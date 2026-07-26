import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

/**
 * Opaque surface (border + shadow) token contract tests.
 *
 * Plan: 半透明 UI 廃止（opaque-surface-border-shadow-tokens）で、カード・ボタンが
 *   backdrop-blur / rgba 透過背景を落とせるよう、置き換え先の「不透明の境界線」と
 *   「控えめなニュートラル影」をライト/ダーク両テーマの CSS 変数 + tailwind.config.*
 *   のマッピングとして一元定義する。背景の不透明トークン（--surface-solid 系）は
 *   background-tokens.test.ts が契約を固定済み。
 *
 * Reference: service/docs/background-audit.md §(i) / GitHub issue #194
 */

const here = dirname(fileURLToPath(import.meta.url))
const readRepo = (rel: string) => readFileSync(join(here, rel), "utf8")

const globalsCss = readRepo("../../app/globals.css")
const tailwindTs = readRepo("../../tailwind.config.ts")
const tailwindJs = readRepo("../../tailwind.config.js")

/** 不透明ボーダートークン（半透明 --hairline / --hairline-strong の置き換え先）。 */
const OPAQUE_BORDER_TOKENS = ["--hairline-solid", "--hairline-solid-strong"] as const

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

const isSolidHex = (v: string) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v)

describe("opaque surface tokens (border + shadow)", () => {
    describe("app/globals.css definitions", () => {
        it.each([
            ["dark", darkVars],
            ["light", lightVars],
        ] as const)(
            "defines every opaque border token as an opaque hex for the %s theme",
            (_theme, vars) => {
                // Given a theme block in globals.css
                // When the opaque border tokens are read
                // Then each is present and an opaque hex (no rgba / transparency)
                for (const token of OPAQUE_BORDER_TOKENS) {
                    expect(vars[token], `${token} missing`).toBeDefined()
                    expect(isSolidHex(vars[token]), `${token}=${vars[token]}`).toBe(true)
                }
            }
        )

        it("keeps the translucent hairline tokens untouched for the header exception", () => {
            // Given the header keeps its backdrop-blur styling by user decision
            // When the original hairline tokens are inspected
            // Then they stay rgba() so existing header styling is unchanged
            expect(darkVars["--hairline"]).toMatch(/^rgba\(/)
            expect(lightVars["--hairline"]).toMatch(/^rgba\(/)
        })

        it.each([
            ["dark", darkVars],
            ["light", lightVars],
        ] as const)(
            "defines a subtle neutral card shadow for the %s theme",
            (_theme, vars) => {
                // Given cards need a restrained sense of depth after going opaque
                // When --shadow-card is read
                // Then it exists and carries no accent tint (differs from
                //   --shadow-soft, which is accent-coloured)
                expect(vars["--shadow-card"], "--shadow-card missing").toBeDefined()
                expect(vars["--shadow-card"]).not.toBe(vars["--shadow-soft"])
            }
        )
    })

    describe("tailwind mappings (kept in parity across config.ts / config.js)", () => {
        it.each([
            ["tailwind.config.ts", tailwindTs],
            ["tailwind.config.js", tailwindJs],
        ] as const)("maps the opaque border tokens in %s", (_name, source) => {
            // Given components style borders through Tailwind utilities
            // When the config sources are read
            // Then both configs expose the opaque border tokens
            expect(source).toContain('"hairline-solid": "var(--hairline-solid)"')
            expect(source).toContain(
                '"hairline-solid-strong": "var(--hairline-solid-strong)"'
            )
        })

        it.each([
            ["tailwind.config.ts", tailwindTs],
            ["tailwind.config.js", tailwindJs],
        ] as const)("maps the card shadow token in %s", (_name, source) => {
            // Given the subtle shadow must be reachable as `shadow-card`
            // When the config sources are read
            // Then both configs map boxShadow.card to the CSS variable
            expect(source).toContain('card: "var(--shadow-card)"')
        })
    })
})
