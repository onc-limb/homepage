import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"
import {
    BACKGROUND_COLOR_TOKENS,
    TEXT_COLOR_TOKENS,
    parseColorTokens,
    parseValueTokens,
    readSpec,
} from "./design-system-spec"

/**
 * Design system (--ds-*) token contract tests.
 *
 * The expected names and values come from docs/design-system.md
 * (section "3. トークン"), so the spec stays the only place the values are
 * written. globals.css must define every color token for both themes, keep
 * them effective inside nested `data-theme` subtrees, and leave the legacy
 * theme blocks untouched.
 */

const here = dirname(fileURLToPath(import.meta.url))
const readService = (rel: string) => readFileSync(join(here, "..", "..", rel), "utf8")

const spec = readSpec()
const colorTokens = parseColorTokens(spec)
const valueTokens = parseValueTokens(spec)
const globalsCss = readService("app/globals.css")
const layoutTsx = readService("app/layout.tsx")

type CssBlock = { selectors: string[]; vars: Record<string, string> }

/** Flat rule blocks (selector list + custom properties), comments removed. */
function parseBlocks(css: string): CssBlock[] {
    const stripped = css.replace(/\/\*[\s\S]*?\*\//g, "")
    const blockRe = /([^{}]+)\{([^{}]*)\}/g
    const blocks: CssBlock[] = []
    let m: RegExpExecArray | null
    while ((m = blockRe.exec(stripped)) !== null) {
        // Drop at-statements such as `@tailwind base;` preceding the selector
        const selectors = (m[1].split(";").pop() ?? "")
            .split(",")
            .map((s) => s.trim().replace(/\s+/g, " "))
            .filter(Boolean)
        const vars: Record<string, string> = {}
        const declRe = /(--[\w-]+)\s*:\s*([^;]+);/g
        let d: RegExpExecArray | null
        while ((d = declRe.exec(m[2])) !== null) {
            vars[d[1]] = d[2].trim().replace(/\s+/g, " ")
        }
        blocks.push({ selectors, vars })
    }
    return blocks
}

const blocks = parseBlocks(globalsCss)

/** --ds-* custom properties declared by blocks whose selector list contains `selector` (later wins). */
function dsVarsFor(selector: string): Record<string, string> {
    const out: Record<string, string> = {}
    for (const block of blocks) {
        if (!block.selectors.includes(selector)) continue
        for (const [name, value] of Object.entries(block.vars)) {
            if (name.startsWith("--ds-")) out[name] = value
        }
    }
    return out
}

function hexToRgb(hex: string): [number, number, number] {
    const h = hex.replace("#", "").trim()
    return [
        parseInt(h.slice(0, 2), 16),
        parseInt(h.slice(2, 4), 16),
        parseInt(h.slice(4, 6), 16),
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

const THEME_SCOPES = [
    // [theme, selector, description]
    ["dark", ":root", "the document root without data-theme (site default)"],
    ["dark", ':root[data-theme="dark"]', "the document root with data-theme=dark"],
    ["dark", '[data-theme="dark"]', "a nested element with data-theme=dark"],
    ["light", ':root[data-theme="light"]', "the document root with data-theme=light"],
    ["light", '[data-theme="light"]', "a nested element with data-theme=light"],
] as const

describe("design system tokens (--ds-*)", () => {
    describe("spec tables (docs/design-system.md)", () => {
        it("lists 10 base colors and 17 map colors", () => {
            // Guards against a broken parser silently yielding zero rows
            const names = colorTokens.map((t) => t.name)
            expect(names).toHaveLength(27)
            expect(names.filter((n) => n.startsWith("--ds-map-"))).toHaveLength(17)
            expect(names).toContain("--ds-border-strong")
            expect(new Set(names).size).toBe(27)
        })

        it("lists 10 type tokens and 5 spacing tokens", () => {
            const names = valueTokens.map((t) => t.name)
            expect(names.filter((n) => n.startsWith("--ds-space-"))).toHaveLength(5)
            expect(names.filter((n) => !n.startsWith("--ds-space-"))).toHaveLength(10)
        })
    })

    describe("color tokens in app/globals.css", () => {
        it.each(THEME_SCOPES)(
            "defines every color token with its %s value for %s (%s)",
            (theme, selector) => {
                // Given the spec table values for the theme
                // When the --ds-* properties applying to the selector are collected
                // Then every color token is present with exactly the table value
                const vars = dsVarsFor(selector)
                for (const token of colorTokens) {
                    const expected = theme === "dark" ? token.dark : token.light
                    expect(vars[token.name]?.toLowerCase(), `${token.name} on ${selector}`).toBe(
                        expected
                    )
                }
            }
        )

        it("keeps the --ds-* tokens out of the legacy theme blocks", () => {
            // Given the legacy blocks are identified by the legacy --bg token
            // Then none of them declares a --ds-* property
            const legacy = blocks.filter((b) => "--bg" in b.vars)
            expect(legacy.length).toBeGreaterThanOrEqual(2)
            for (const block of legacy) {
                const dsNames = Object.keys(block.vars).filter((n) => n.startsWith("--ds-"))
                expect(dsNames, block.selectors.join(", ")).toEqual([])
            }
        })

        it("leaves the legacy theme block selectors unchanged", () => {
            // Widening the legacy dark block to [data-theme="dark"] would change
            // the old tokens for nested subtrees, which this job must not do
            const legacySelectors = blocks
                .filter((b) => "--bg" in b.vars)
                .map((b) => b.selectors)
            expect(legacySelectors).toEqual([
                [":root", ':root[data-theme="dark"]'],
                [':root[data-theme="light"]', '[data-theme="light"]'],
            ])
        })
    })

    describe("WCAG AA contrast (>= 4.5:1)", () => {
        const cases = (["light", "dark"] as const).flatMap((theme) =>
            TEXT_COLOR_TOKENS.flatMap((fg) =>
                BACKGROUND_COLOR_TOKENS.map((bg) => [theme, fg, bg] as const)
            )
        )

        it("covers 5 text colors x 3 backgrounds for both themes", () => {
            expect(cases).toHaveLength(30)
        })

        it.each(cases)("%s: %s on %s", (theme, fg, bg) => {
            // Given the values globals.css applies inside a data-theme subtree
            const vars = dsVarsFor(`[data-theme="${theme}"]`)
            expect(vars[fg], `${fg} missing`).toMatch(/^#[0-9a-fA-F]{6}$/)
            expect(vars[bg], `${bg} missing`).toMatch(/^#[0-9a-fA-F]{6}$/)
            const ratio = contrastRatio(vars[fg], vars[bg])
            expect(
                ratio,
                `${fg} (${vars[fg]}) on ${bg} (${vars[bg]}) = ${ratio.toFixed(2)}:1`
            ).toBeGreaterThanOrEqual(4.5)
        })
    })

    describe("type and spacing tokens", () => {
        const rootVars = dsVarsFor(":root")

        it.each(
            valueTokens
                .filter((t) => !t.name.startsWith("--ds-font"))
                .map((t) => [t.name, t.value] as const)
        )("defines %s as %s on :root", (name, value) => {
            expect(rootVars[name]).toBe(value)
        })

        it.each([
            ["--ds-font", "M_PLUS_1_Code", "monospace"],
            ["--ds-font-prose", "M_PLUS_1", "sans-serif"],
        ] as const)(
            "defines %s from the next/font %s variable with a %s fallback, resolvable on <html>",
            (token, fontLoader, fallback) => {
                // Given --ds-font is declared on :root, the next/font variable it
                // references must be defined on <html> (not only on <body>)
                const value = rootVars[token]
                expect(value, `${token} missing on :root`).toBeDefined()
                const m = value.match(new RegExp(`^var\\((--[\\w-]+)\\),\\s*${fallback}$`))
                expect(m, `${token}: ${value}`).not.toBeNull()
                const fontVar = m![1]

                const call = layoutTsx.match(
                    new RegExp(`const\\s+(\\w+)\\s*=\\s*${fontLoader}\\(\\{([\\s\\S]*?)\\}\\)`)
                )
                expect(call, `${fontLoader}(...) not loaded in app/layout.tsx`).not.toBeNull()
                const [, binding, options] = call!
                expect(options).toContain(`variable: "${fontVar}"`)
                expect(options).toMatch(/weight:\s*\[\s*"400",\s*"700"\s*\]/)

                const htmlTag = layoutTsx.match(/<html\b[^>]*>/)
                expect(htmlTag).not.toBeNull()
                expect(htmlTag![0]).toContain(`${binding}.variable`)
            }
        )
    })
})
