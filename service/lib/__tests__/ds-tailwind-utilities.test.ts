import { describe, it, expect } from "vitest"
import postcss from "postcss"
import tailwindcss from "tailwindcss"
import config from "../../tailwind.config"
import { parseColorTokens, readSpec } from "./design-system-spec"

/**
 * Tailwind `ds` namespace contract tests.
 *
 * Runs the real tailwind.config.ts through tailwindcss with a raw content
 * source and checks that the ds utilities are generated and point at the
 * --ds-* custom properties (never at hard-coded values).
 */

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
})
