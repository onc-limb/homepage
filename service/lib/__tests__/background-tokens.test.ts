import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

/**
 * Solid background token contract tests.
 *
 * Plan: グラデーション廃止・単色化（gradient-abolition-solid-background）が
 *   場当たりな色を足さずに済むよう、単色背景トークンを既存テーマ機構
 *   （app/globals.css の CSS 変数 + tailwind.config.* のマッピング）へ集約定義する。
 *   本テストはトークンが「ライト/ダーク両テーマに単色（不透明 hex）で定義され」
 *   「Tailwind に載って」おり、本文（--fg）との組み合わせが WCAG AA（4.5:1）を
 *   満たすことを契約として固定する。
 *
 * Reference: service/docs/background-audit.md §(e) 既存テーマ機構の所在 / §(i) 単色背景トークン
 */

const here = dirname(fileURLToPath(import.meta.url))
const readRepo = (rel: string) => readFileSync(join(here, rel), "utf8")

const globalsCss = readRepo("../../app/globals.css")
const tailwindTs = readRepo("../../tailwind.config.ts")
const tailwindJs = readRepo("../../tailwind.config.js")

/** ページ/セクション/サーフェスの単色（不透明 hex）背景トークン。 */
const SOLID_BG_TOKENS = [
    "--bg",
    "--bg-elev",
    "--bg-elev-2",
    "--surface-solid",
    "--surface-solid-strong",
] as const

/** globals.css からテーマブロックの CSS 変数を抜き出す。 */
function parseThemeVars(css: string, selectorRegex: RegExp): Record<string, string> {
    const block = css.match(selectorRegex)
    if (!block) throw new Error(`theme block not found for ${selectorRegex}`)
    const vars: Record<string, string> = {}
    const declRe = /(--[\w-]+)\s*:\s*([^;]+);/g
    let m: RegExpExecArray | null
    while ((m = declRe.exec(block[1])) !== null) {
        vars[m[1]] = m[2].trim()
    }
    return vars
}

const darkVars = parseThemeVars(
    globalsCss,
    /:root,\s*:root\[data-theme="dark"\]\s*\{([^}]*)\}/
)
const lightVars = parseThemeVars(
    globalsCss,
    /:root\[data-theme="light"\]\s*\{([^}]*)\}/
)

function hexToRgb(hex: string): [number, number, number] {
    const h = hex.replace("#", "").trim()
    const full =
        h.length === 3
            ? h
                  .split("")
                  .map((c) => c + c)
                  .join("")
            : h
    return [
        parseInt(full.slice(0, 2), 16),
        parseInt(full.slice(2, 4), 16),
        parseInt(full.slice(4, 6), 16),
    ]
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
    const lin = (c: number) => {
        const s = c / 255
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
    }
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

function contrastRatio(a: string, b: string): number {
    const la = relativeLuminance(hexToRgb(a))
    const lb = relativeLuminance(hexToRgb(b))
    const [hi, lo] = la >= lb ? [la, lb] : [lb, la]
    return (hi + 0.05) / (lo + 0.05)
}

const isSolidHex = (v: string) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v)

describe("solid background tokens", () => {
    describe("app/globals.css definitions", () => {
        it.each([
            ["dark", darkVars],
            ["light", lightVars],
        ] as const)(
            "defines every solid background token as an opaque hex for the %s theme",
            (_theme, vars) => {
                // Given a theme block in globals.css
                // When the solid background tokens are read
                // Then each is present and an opaque hex (no rgba/gradient)
                for (const token of SOLID_BG_TOKENS) {
                    expect(vars[token], `${token} missing`).toBeDefined()
                    expect(isSolidHex(vars[token]), `${token}=${vars[token]}`).toBe(true)
                }
            }
        )

        it("keeps the page/section base tokens solid (unchanged single-color values)", () => {
            // Given the page and section layers reuse the existing solid tokens
            // When the base tokens are compared across themes
            // Then dark stays deep-navy and light stays near-white
            expect(darkVars["--bg"]).toBe("#0a1020")
            expect(lightVars["--bg"]).toBe("#f2f5fb")
        })

        it("adds solid surface tokens as opaque counterparts of the translucent surface tokens", () => {
            // Given --surface / --surface-strong stay translucent (used with backdrop blur)
            // When the new solid tokens are inspected
            // Then they are opaque and distinct from the rgba() originals
            expect(darkVars["--surface"]).toMatch(/^rgba\(/)
            expect(darkVars["--surface-solid"]).toBe("#141f3d")
            expect(darkVars["--surface-solid-strong"]).toBe("#1e2c4e")
            expect(lightVars["--surface-solid"]).toBe("#ffffff")
            expect(lightVars["--surface-solid-strong"]).toBe("#ffffff")
        })
    })

    describe("WCAG AA contrast against body text (--fg)", () => {
        it.each([
            ["dark", darkVars],
            ["light", lightVars],
        ] as const)(
            "every solid background token clears 4.5:1 against --fg for the %s theme",
            (_theme, vars) => {
                // Given --fg is the body text color for the theme
                // When each solid background token is paired with --fg
                // Then the contrast ratio meets WCAG 2.2 AA for normal text (>= 4.5:1)
                const fg = vars["--fg"]
                expect(isSolidHex(fg)).toBe(true)
                for (const token of SOLID_BG_TOKENS) {
                    const ratio = contrastRatio(fg, vars[token])
                    expect(
                        ratio,
                        `${token} (${vars[token]}) vs --fg (${fg}) = ${ratio.toFixed(2)}:1`
                    ).toBeGreaterThanOrEqual(4.5)
                }
            }
        )
    })

    describe("tailwind mapping (both configs stay in sync)", () => {
        it.each([
            ["tailwind.config.ts", tailwindTs],
            ["tailwind.config.js", tailwindJs],
        ] as const)("maps the solid surface tokens in %s", (_name, config) => {
            // Given components reference background tokens via bg-* utility classes
            // When the tailwind color map is inspected
            // Then the new solid tokens are exposed as CSS-variable-backed colors
            expect(config).toContain('"surface-solid": "var(--surface-solid)"')
            expect(config).toContain(
                '"surface-solid-strong": "var(--surface-solid-strong)"'
            )
        })
    })
})
