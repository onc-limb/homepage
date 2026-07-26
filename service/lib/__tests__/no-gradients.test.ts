import { describe, it, expect } from "vitest"
import { readdirSync, readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join, relative } from "node:path"

/**
 * Gradient-abolition regression test.
 *
 * Plan: グラデーション廃止・単色化（gradient-abolition-solid-background）の完了状態を
 *   回帰防止として固定する。親 issue の受け入れ条件どおり、`service/` 配下の
 *   アプリケーションコード（app / components / lib のコンポーネント・スタイル・設定）を
 *   `bg-gradient-` / `linear-gradient` / `radial-gradient` で検索して 0 件であることを
 *   契約化する。背景・セクション装飾のグラデーションが後から再混入した場合、
 *   この 1 本のテストが CI を落として気づけるようにする。
 *
 * 走査対象からは、意図的に上記文字列を「含まれないこと」の検証やコメントで
 *   参照しているテスト（`*.test.ts(x)` / `__tests__/`）を除外する。除外しないと
 *   SiteBrand.test.tsx など（linear-gradient を not.toContain で検証）が
 *   偽陽性になるため。
 *
 * Reference: service/docs/background-audit.md, 親 issue 受け入れ条件（gradient 0 件）
 */

const here = dirname(fileURLToPath(import.meta.url))
// service/lib/__tests__ -> service
const serviceRoot = join(here, "..", "..")

/** 背景・セクション装飾で使われうるグラデーション表現。全て 0 件が契約。 */
const GRADIENT_PATTERNS = [
    "bg-gradient-",
    "linear-gradient",
    "radial-gradient",
] as const

/** アプリケーションコードのルート（コンポーネント・スタイル・データアクセス）。 */
const SCAN_DIRS = ["app", "components", "lib"] as const

/** ソース/スタイル拡張子のみを走査する。 */
const SCAN_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".css"] as const

/** 走査から外すディレクトリ（テスト・生成物・依存）。 */
const SKIP_DIRS = new Set(["__tests__", "node_modules", ".next", ".open-next"])

const isTestFile = (name: string) => /\.test\.[jt]sx?$/.test(name)

function collectFiles(dir: string): string[] {
    const out: string[] = []
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) {
            if (SKIP_DIRS.has(entry.name)) continue
            out.push(...collectFiles(join(dir, entry.name)))
            continue
        }
        if (!entry.isFile()) continue
        if (isTestFile(entry.name)) continue
        if (SCAN_EXTENSIONS.some((ext) => entry.name.endsWith(ext))) {
            out.push(join(dir, entry.name))
        }
    }
    return out
}

// app / components / lib のソース + テーマ機構の設定（globals.css は app 配下で拾う、
// Tailwind 設定は単色トークンのマッピング先なので明示的に含める）。
const files = [
    ...SCAN_DIRS.flatMap((d) => collectFiles(join(serviceRoot, d))),
    join(serviceRoot, "tailwind.config.ts"),
    join(serviceRoot, "tailwind.config.js"),
]

describe("solid background — no gradient decorations remain", () => {
    it("scans a non-trivial number of source files (guards against an empty walk)", () => {
        // Given the walk should reach app/components/lib + tailwind configs
        // When the file list is built
        // Then it is clearly non-empty (a broken walk must not read as a green pass)
        expect(files.length).toBeGreaterThan(20)
    })

    it.each(GRADIENT_PATTERNS)(
        "has zero occurrences of %s across app/components/lib and tailwind config",
        (pattern) => {
            // Given every background/section decoration was converted to a solid token
            // When each application source file is searched for the gradient token
            // Then no non-test file contains it
            const offenders: string[] = []
            for (const file of files) {
                const content = readFileSync(file, "utf8")
                if (content.includes(pattern)) {
                    offenders.push(relative(serviceRoot, file))
                }
            }
            expect(
                offenders,
                `${pattern} found in: ${offenders.join(", ") || "(none)"}`
            ).toEqual([])
        }
    )
})
