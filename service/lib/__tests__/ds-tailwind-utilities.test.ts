import { describe, it, expect } from "vitest"
import { createRequire } from "node:module"
import postcss from "postcss"
import tailwindcss from "tailwindcss"
import type { Config } from "tailwindcss"
import { parseColorTokens, readSpec } from "./design-system-spec"

/**
 * Tailwind `ds` namespace contract tests.
 *
 * Runs the real tailwind.config.js through tailwindcss with a raw content
 * source and checks that the ds utilities are generated and point at the
 * --ds-* custom properties (never at hard-coded values).
 */

const requireCjs = createRequire(import.meta.url)
const config = requireCjs("../../tailwind.config.js") as Config

const colorNames = parseColorTokens(readSpec()).map((t) => t.name.replace(/^--ds-/, ""))

/** selector -> declarations of the utilities generated for `classes`. */
async function generate(classes: string[]): Promise<Map<string, Record<string, string>>> {
    const result = await postcss([
        tailwindcss({ ...config, content: [{ raw: classes.join(" "), extension: "html" }] }),
    ]).process("@tailwind utilities", { from: undefined })
    const rules = new Map<string, Record<string, string>>()
    result.root.walkRules((rule) => {
        const decls: Record<string, string> = rules.get(rule.selector) ?? {}
        rule.walkDecls((decl) => {
            decls[decl.prop] = decl.value
        })
        rules.set(rule.selector, decls)
    })
    return rules
}

describe("tailwind ds namespace", () => {
    it("maps all 27 color tokens to bg-ds-* utilities backed by the CSS variables", async () => {
        expect(colorNames).toHaveLength(27)
        const rules = await generate(colorNames.map((n) => `bg-ds-${n}`))
        for (const name of colorNames) {
            expect(rules.get(`.bg-ds-${name}`), `.bg-ds-${name}`).toMatchObject({
                "background-color": `var(--ds-${name})`,
            })
        }
    })

    it.each([
        ["text-ds-fg", "color", "var(--ds-fg)"],
        ["text-ds-fg-muted", "color", "var(--ds-fg-muted)"],
        ["text-ds-accent", "color", "var(--ds-accent)"],
        ["border-ds-border", "border-color", "var(--ds-border)"],
        ["border-ds-border-strong", "border-color", "var(--ds-border-strong)"],
    ] as const)("generates %s as %s: %s", async (cls, prop, value) => {
        const rules = await generate([cls])
        expect(rules.get(`.${cls}`), `.${cls}`).toMatchObject({ [prop]: value })
    })

    it.each([
        ["font-ds", "font-family", "var(--ds-font)"],
        ["font-ds-prose", "font-family", "var(--ds-font-prose)"],
        ["text-ds-sm", "font-size", "var(--ds-text-sm)"],
        ["text-ds-base", "font-size", "var(--ds-text-base)"],
        ["text-ds-lg", "font-size", "var(--ds-text-lg)"],
        ["text-ds-xl", "font-size", "var(--ds-text-xl)"],
        ["leading-ds", "line-height", "var(--ds-leading)"],
        ["leading-ds-prose", "line-height", "var(--ds-leading-prose)"],
    ] as const)("generates the type utility %s as %s: %s", async (cls, prop, value) => {
        const rules = await generate([cls])
        expect(rules.get(`.${cls}`), `.${cls}`).toMatchObject({ [prop]: value })
    })

    it.each([1, 2, 3, 4, 5])(
        "exposes spacing key ds-%i for padding, gap and width",
        async (n) => {
            const rules = await generate([`p-ds-${n}`, `gap-ds-${n}`, `w-ds-${n}`])
            const value = `var(--ds-space-${n})`
            expect(rules.get(`.p-ds-${n}`)).toMatchObject({ padding: value })
            expect(rules.get(`.gap-ds-${n}`)).toMatchObject({ gap: value })
            expect(rules.get(`.w-ds-${n}`)).toMatchObject({ width: value })
        }
    )

    it.each([
        ["max-w-ds-page", "max-width", "var(--ds-page-max)"],
        ["max-w-ds-measure", "max-width", "var(--ds-measure)"],
        ["px-ds-page-gutter", "padding-left", "calc(var(--ds-space-4) + var(--ds-space-3))"],
        ["px-ds-page-gutter", "padding-right", "calc(var(--ds-space-4) + var(--ds-space-3))"],
        ["grid-cols-ds-kv", "grid-template-columns", "max-content minmax(0, 1fr)"],
        ["grid-cols-ds-log", "grid-template-columns", "7.5em 11em minmax(0, 1fr)"],
    ] as const)("generates the layout utility %s as %s: %s", async (cls, prop, value) => {
        const rules = await generate([cls])
        expect(rules.get(`.${cls}`), `.${cls}`).toMatchObject({ [prop]: value })
    })

    // Door sizes from the mock (Maze.dc.html): 150x210 desktop, 104x150 narrow.
    it.each([
        ["w-ds-door", "width", "150px"],
        ["w-ds-door-narrow", "width", "104px"],
        ["h-ds-door", "height", "210px"],
        ["h-ds-door-narrow", "height", "150px"],
        ["border-ds-door", "border-width", "3px"],
        ["border-ds-door-lg", "border-width", "6px"],
    ] as const)("generates the door utility %s as %s: %s", async (cls, prop, value) => {
        const rules = await generate([cls])
        expect(rules.get(`.${cls}`), `.${cls}`).toMatchObject({ [prop]: value })
    })

    it("switches the door size and the log columns at the md breakpoint", async () => {
        const result = await postcss([
            tailwindcss({
                ...config,
                content: [
                    { raw: "md:w-ds-door md:h-ds-door md:grid-cols-ds-log", extension: "html" },
                ],
            }),
        ]).process("@tailwind utilities", { from: undefined })
        const found: Record<string, { media: string; decls: Record<string, string> }> = {}
        result.root.walkAtRules("media", (media) => {
            media.walkRules((rule) => {
                const decls: Record<string, string> = {}
                rule.walkDecls((decl) => {
                    decls[decl.prop] = decl.value
                })
                found[rule.selector] = { media: media.params, decls }
            })
        })
        const expected: Array<[string, string, string]> = [
            [".md\\:w-ds-door", "width", "150px"],
            [".md\\:h-ds-door", "height", "210px"],
            [".md\\:grid-cols-ds-log", "grid-template-columns", "7.5em 11em minmax(0, 1fr)"],
        ]
        for (const [selector, prop, value] of expected) {
            const rule = found[selector]
            expect(rule, selector).toBeDefined()
            expect(rule.media).toContain("768px")
            expect(rule.decls).toMatchObject({ [prop]: value })
        }
    })

    it("switches the page gutter and the key-value columns at the md breakpoint", async () => {
        const result = await postcss([
            tailwindcss({
                ...config,
                content: [{ raw: "md:px-ds-page-gutter md:grid-cols-ds-kv", extension: "html" }],
            }),
        ]).process("@tailwind utilities", { from: undefined })
        const found: Record<string, { media: string; decls: Record<string, string> }> = {}
        result.root.walkAtRules("media", (media) => {
            media.walkRules((rule) => {
                const decls: Record<string, string> = {}
                rule.walkDecls((decl) => {
                    decls[decl.prop] = decl.value
                })
                found[rule.selector] = { media: media.params, decls }
            })
        })
        const gutter = found[".md\\:px-ds-page-gutter"]
        expect(gutter, "md:px-ds-page-gutter").toBeDefined()
        expect(gutter.media).toContain("768px")
        expect(gutter.decls).toMatchObject({
            "padding-left": "calc(var(--ds-space-4) + var(--ds-space-3))",
        })
        const kv = found[".md\\:grid-cols-ds-kv"]
        expect(kv, "md:grid-cols-ds-kv").toBeDefined()
        expect(kv.media).toContain("768px")
        expect(kv.decls).toMatchObject({ "grid-template-columns": "max-content minmax(0, 1fr)" })
    })
})
