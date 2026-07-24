import { existsSync, readFileSync, statSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { describe, expect, it } from "vitest"

/**
 * SiteBrand independence contract tests.
 *
 * Plan: 星座風パーティクル背景を削除する後続タスクの前提として、ヘッダーの
 *   `SiteBrand` が背景実装（背景モジュール / canvas 描画基盤 / グラデーション /
 *   パーティクル描画パッケージ）に一切依存していないことを契約として固定する。
 *
 *   検査は SiteBrand 単体のソース文字列ではなく、SiteBrand を起点とした
 *   **モジュールグラフ全体**（`from` 句・副作用 import・動的 import・CSS の @import を
 *   たどって到達するリポジトリ内ファイル）に対して行う。これにより
 *   「経由モジュール越しに背景実装へ依存する」推移的結合と、
 *   `import "@/components/background/particles.css"` のような副作用 import も検出できる。
 *
 *   背景実装の実ディレクトリは調査未完了（service/docs/background-audit.md (a) は
 *   本文未確認の候補にとどまる）である。そのため `BACKGROUND_MODULE_PATTERN` は
 *   特定の 1 ディレクトリ名を前提にせず、背景実装が置かれうるディレクトリ名
 *   （animations / background / particles / canvas / constellation）を横断的に拾う。
 *   実パスがソースツリーアクセス可能な後続タスクで確定したら、パターンを **緩めるのではなく**
 *   確定したパスを足す方向で締めること（(a)/(g) G1 参照）。現状は SiteBrand の import が
 *   0 件で実グラフが 1 ファイルのため、この契約は将来 import が追加された場合の回帰ガードとして機能する。
 *
 *   なお本テストが保証するのは SiteBrand の独立性のみであり、
 *   維持対象である「サイトタイトルの流動アニメーション」の実体と背景実装の
 *   共有有無は未判定である（service/docs/background-audit.md (f-2) を参照）。
 *
 * Reference: service/docs/background-audit.md
 */

const SERVICE_ROOT = fileURLToPath(new URL("../../../", import.meta.url))
const SITE_BRAND_PATH = fileURLToPath(
    new URL("../SiteBrand.tsx", import.meta.url)
)

/** 中身を走査する（＝テキストとして読む）拡張子 */
const SCANNABLE_EXTENSIONS = [
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".mjs",
    ".cjs",
    ".css",
]

/** 拡張子省略 import を解決するときに試す接尾辞 */
const RESOLVE_SUFFIXES = [
    "",
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".mjs",
    ".cjs",
    ".css",
    "/index.ts",
    "/index.tsx",
    "/index.js",
]

/**
 * 背景実装のモジュール（パス・specifier 双方に適用する）。
 *
 * 背景実装の実ディレクトリが未確定なため、ディレクトリ名を 1 つに賭けない。
 * ディレクトリ区切りで一致する名前群と、名前に含まれれば背景実装と断じてよい
 * 語（particle / constellation）を併せて見る。
 */
const BACKGROUND_MODULE_PATTERN =
    /(^|[\\/])(animations?|backgrounds?|particles?|canvas|constellations?)([\\/]|$)|particle|constellation/i

/** パーティクル/canvas 描画エンジン系パッケージ（背景実装の実体になりうるもの） */
const BACKGROUND_RENDERER_PACKAGES = [
    "tsparticles",
    "tsparticles-slim",
    "tsparticles-engine",
    "@tsparticles",
    "react-particles",
    "react-tsparticles",
    "react-particles-js",
    "particles.js",
    "particlesjs",
    "three",
    "@react-three",
    "p5",
    "pixi.js",
]

const CANVAS_PRIMITIVES = [
    "requestAnimationFrame",
    "cancelAnimationFrame",
    "getContext",
]

const GRADIENT_TOKENS = ["linear-gradient", "radial-gradient", "conic-gradient"]

function toPosix(path: string): string {
    return path.split("\\").join("/")
}

function isLocalSpecifier(specifier: string): boolean {
    return (
        specifier.startsWith(".") ||
        specifier.startsWith("@/") ||
        specifier.startsWith("~/")
    )
}

function isScannable(path: string): boolean {
    return SCANNABLE_EXTENSIONS.some((extension) => path.endsWith(extension))
}

/**
 * `from "x"` だけでなく、副作用 import（`import "x"`）・動的 import・
 * require・CSS の `@import` も拾う。どれか一つでも取りこぼすと
 * 背景実装への結合がテストをすり抜けるため、収集口は一箇所にまとめる。
 */
export function collectSpecifiers(source: string): string[] {
    const specifiers = new Set<string>()
    const patterns = [
        /\bfrom\s*["']([^"']+)["']/g,
        /(?:^|[;\n])\s*import\s*["']([^"']+)["']/g,
        /\bimport\(\s*["']([^"']+)["']\s*\)/g,
        /\brequire\(\s*["']([^"']+)["']\s*\)/g,
        /@import\s+(?:url\(\s*)?["']([^"']+)["']/g,
    ]

    for (const pattern of patterns) {
        for (const match of source.matchAll(pattern)) {
            specifiers.add(match[1])
        }
    }

    return [...specifiers]
}

/**
 * ファイル読み取りの抽象。実行時は node:fs を使うが、
 * 「推移的結合を本当に検出できるか」を検査するために仮想 FS を差し込めるようにする。
 */
export interface ModuleHost {
    readFile(path: string): string
    isFile(path: string): boolean
}

const nodeHost: ModuleHost = {
    readFile: (path) => readFileSync(path, "utf8"),
    isFile: (path) => existsSync(path) && statSync(path).isFile(),
}

function resolveLocal(
    specifier: string,
    importer: string,
    host: ModuleHost,
    serviceRoot: string
): string | null {
    const base =
        specifier.startsWith("@/") || specifier.startsWith("~/")
            ? join(serviceRoot, specifier.slice(2))
            : resolve(dirname(importer), specifier)

    for (const suffix of RESOLVE_SUFFIXES) {
        const candidate = base + suffix
        if (host.isFile(candidate)) {
            return candidate
        }
    }

    return null
}

interface ModuleGraph {
    /** 走査したリポジトリ内ファイル: 絶対パス -> ソース */
    sources: Map<string, string>
    /** 到達した全 specifier: specifier -> それを書いているファイル */
    specifiers: Map<string, string>
    /** 外部パッケージの specifier */
    externals: Set<string>
    /** 解決できなかったローカル specifier（走査の死角になるため 0 件を要求する） */
    unresolved: Set<string>
    /** 解決できたが中身を読まないファイル（画像など） */
    skipped: Set<string>
}

export function buildModuleGraph(
    entry: string,
    host: ModuleHost = nodeHost,
    serviceRoot: string = SERVICE_ROOT
): ModuleGraph {
    const sources = new Map<string, string>()
    const specifiers = new Map<string, string>()
    const externals = new Set<string>()
    const unresolved = new Set<string>()
    const skipped = new Set<string>()

    const queue = [entry]

    while (queue.length > 0) {
        const file = queue.pop() as string
        if (sources.has(file)) continue

        const source = host.readFile(file)
        sources.set(file, source)

        for (const specifier of collectSpecifiers(source)) {
            if (!specifiers.has(specifier)) specifiers.set(specifier, file)

            if (!isLocalSpecifier(specifier)) {
                externals.add(specifier)
                continue
            }

            const resolved = resolveLocal(specifier, file, host, serviceRoot)
            if (!resolved) {
                unresolved.add(`${specifier} (from ${toPosix(file)})`)
                continue
            }

            if (isScannable(resolved)) queue.push(resolved)
            else skipped.add(resolved)
        }
    }

    return { sources, specifiers, externals, unresolved, skipped }
}

function relativeTo(path: string, serviceRoot: string): string {
    return toPosix(path).replace(toPosix(serviceRoot), "")
}

/** 背景実装モジュールへの到達（ファイル・specifier の両面） */
export function backgroundOffenders(
    graph: ModuleGraph,
    serviceRoot: string
): string[] {
    const files = [...graph.sources.keys(), ...graph.skipped]
        .map((path) => relativeTo(path, serviceRoot))
        .filter((path) => BACKGROUND_MODULE_PATTERN.test(path))

    const specifiers = [...graph.specifiers.entries()]
        .filter(([specifier]) => BACKGROUND_MODULE_PATTERN.test(specifier))
        .map(
            ([specifier, importer]) =>
                `${specifier} (from ${relativeTo(importer, serviceRoot)})`
        )

    return [...files, ...specifiers]
}

/** canvas / requestAnimationFrame 描画プリミティブの使用 */
export function canvasOffenders(
    graph: ModuleGraph,
    serviceRoot: string
): string[] {
    const offenders: string[] = []

    for (const [file, source] of graph.sources) {
        for (const primitive of CANVAS_PRIMITIVES) {
            if (source.includes(primitive)) {
                offenders.push(`${relativeTo(file, serviceRoot)}: ${primitive}`)
            }
        }
        if (/<canvas\b/i.test(source)) {
            offenders.push(`${relativeTo(file, serviceRoot)}: <canvas>`)
        }
    }

    return offenders
}

/** CSS グラデーション関数・Tailwind グラデーションユーティリティの使用 */
export function gradientOffenders(
    graph: ModuleGraph,
    serviceRoot: string
): string[] {
    const offenders: string[] = []

    for (const [file, source] of graph.sources) {
        for (const token of GRADIENT_TOKENS) {
            if (source.includes(token)) {
                offenders.push(`${relativeTo(file, serviceRoot)}: ${token}`)
            }
        }
        if (/\bbg-gradient-/.test(source)) {
            offenders.push(`${relativeTo(file, serviceRoot)}: bg-gradient-`)
        }
    }

    return offenders
}

const GRAPH = buildModuleGraph(SITE_BRAND_PATH)

describe("module graph walk", () => {
    it("collects side-effect, dynamic and css imports — not only `from` clauses", () => {
        // Given a module that couples to the background through non-`from` syntax
        // When specifiers are collected
        // Then every syntax form is captured, so no coupling can slip past the graph walk
        const fixture = [
            'import "@/components/background/particles.css"',
            'import { X } from "@/components/animations"',
            'const m = await import("@/components/animations/ParticleBackground")',
            'const n = require("@/components/animations/canvas-utils")',
            '@import url("./particles.css");',
        ].join("\n")

        expect(collectSpecifiers(fixture).sort()).toEqual(
            [
                "./particles.css",
                "@/components/animations",
                "@/components/animations/ParticleBackground",
                "@/components/animations/canvas-utils",
                "@/components/background/particles.css",
            ].sort()
        )
    })

    it("detects coupling reached transitively through an intermediate module", () => {
        // Given an entry that only imports a neighbour, which itself side-effect imports a
        //   background stylesheet two hops away
        // When the graph is walked over a virtual filesystem
        // Then every detector reports the transitive offender — proving the assertions below
        //   are not vacuously green just because SiteBrand's own graph is small
        const fixtureRoot = "/virtual-service/"
        const fixtureFiles: Record<string, string> = {
            "/virtual-service/components/header/SiteBrand.tsx":
                'import { Shell } from "./Shell"\nexport const Brand = Shell',
            "/virtual-service/components/header/Shell.tsx":
                'import "@/components/background/particles.css"\n' +
                "export const start = () => requestAnimationFrame(() => {})",
            "/virtual-service/components/background/particles.css":
                ".particles { background: linear-gradient(#000, #fff); }",
        }
        const fixtureHost: ModuleHost = {
            readFile: (path) => fixtureFiles[toPosix(path)],
            isFile: (path) => toPosix(path) in fixtureFiles,
        }

        const graph = buildModuleGraph(
            "/virtual-service/components/header/SiteBrand.tsx",
            fixtureHost,
            fixtureRoot
        )

        expect(graph.sources.size).toBe(3)
        expect([...graph.unresolved]).toEqual([])
        expect(backgroundOffenders(graph, fixtureRoot)).toEqual(
            expect.arrayContaining([
                "components/background/particles.css",
                "@/components/background/particles.css (from components/header/Shell.tsx)",
            ])
        )
        expect(canvasOffenders(graph, fixtureRoot)).toContain(
            "components/header/Shell.tsx: requestAnimationFrame"
        )
        expect(gradientOffenders(graph, fixtureRoot)).toContain(
            "components/background/particles.css: linear-gradient"
        )
    })
})

describe("SiteBrand independence from the background implementation", () => {
    it("resolves every local import so the graph walk has no blind spots", () => {
        // Given the contract is checked over the whole module graph
        // When a local import cannot be resolved to a file
        // Then the walk would be blind there, so it must never happen
        expect([...GRAPH.unresolved]).toEqual([])
        expect(GRAPH.sources.size).toBeGreaterThan(0)
    })

    it("never reaches a background module, directly or transitively", () => {
        // Given the background implementation lives in one of the candidate directories
        //   (animations / background / particles / canvas / constellation — (a) 未確認の候補)
        // When every file and specifier in SiteBrand's module graph is inspected
        // Then none of them points into such a module
        expect(backgroundOffenders(GRAPH, SERVICE_ROOT)).toEqual([])
    })

    it("does not use canvas / requestAnimationFrame drawing primitives", () => {
        // Given the particle background is a self-made canvas renderer
        // When every scanned file in the graph is inspected
        // Then it shares none of those primitives
        expect(canvasOffenders(GRAPH, SERVICE_ROOT)).toEqual([])
    })

    it("does not rely on gradients", () => {
        // Given gradients are being retired repository-wide in favour of solid colors
        // When every scanned file in the graph is inspected
        // Then no CSS gradient function nor Tailwind gradient utility is present
        expect(gradientOffenders(GRAPH, SERVICE_ROOT)).toEqual([])
    })

    it("does not depend on any particle / canvas rendering package", () => {
        // Given SiteBrand must survive the removal of every background module
        // When its external dependencies are inspected
        // Then none of them is a particle or canvas rendering engine
        const offenders = [...GRAPH.externals].filter((specifier) =>
            BACKGROUND_RENDERER_PACKAGES.some(
                (pkg) => specifier === pkg || specifier.startsWith(`${pkg}/`)
            )
        )

        expect(GRAPH.externals.size).toBeGreaterThan(0)
        expect(offenders).toEqual([])
    })
})
