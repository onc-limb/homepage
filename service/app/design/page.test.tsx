// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server"
import { beforeAll, describe, expect, it } from "vitest"

import {
    parseColorTokens,
    parseValueTokens,
    readSpec,
} from "@/lib/__tests__/design-system-spec"

import tailwindConfig from "../../tailwind.config"

import DesignPage, { metadata } from "./page"
import { DESIGN_SAMPLES } from "./samples"

const spec = readSpec()
const colorTokens = parseColorTokens(spec)
const valueTokens = parseValueTokens(spec)
const textTokens = valueTokens.filter((t) => t.name.startsWith("--ds-text-"))
const spaceTokens = valueTokens.filter((t) => t.name.startsWith("--ds-space-"))

const THEMES = ["light", "dark"] as const
type Theme = (typeof THEMES)[number]

let html = ""
let root: HTMLElement

beforeAll(async () => {
    html = renderToStaticMarkup(await DesignPage())
    root = document.createElement("div")
    root.innerHTML = html
})

function frame(theme: Theme): HTMLElement {
    const el = root.querySelector<HTMLElement>(`[data-theme="${theme}"]`)
    if (!el) throw new Error(`no data-theme="${theme}" frame`)
    return el
}

const text = (el: HTMLElement) => (el.textContent ?? "").toLowerCase()

/** True when the element itself or a descendant carries the class. */
const hasClass = (el: HTMLElement, cls: string) =>
    el.classList.contains(cls) ||
    Array.from(el.querySelectorAll("[class]")).some((child) => child.classList.contains(cls))

describe("/design page", () => {
    it("is excluded from search indexing", () => {
        expect(metadata.robots).toMatchObject({ index: false })
    })

    it("shows exactly one light frame and one dark frame side by side", () => {
        // Both themes are visible at once, without a theme toggle
        expect(root.querySelectorAll('[data-theme="light"]')).toHaveLength(1)
        expect(root.querySelectorAll('[data-theme="dark"]')).toHaveLength(1)
    })

    describe.each(THEMES)("%s frame", (theme) => {
        it("lists every color token with its name, this theme's value and a swatch", () => {
            expect(colorTokens).toHaveLength(27)
            const el = frame(theme)
            const content = text(el)
            for (const token of colorTokens) {
                expect(content, token.name).toContain(token.name)
                expect(content, `${token.name} value`).toContain(token[theme])
                const swatch = `bg-ds-${token.name.replace(/^--ds-/, "")}`
                expect(hasClass(el, swatch), swatch).toBe(true)
            }
        })

        it("does not show the other theme's values", () => {
            const other: Theme = theme === "light" ? "dark" : "light"
            const own = new Set(colorTokens.map((t) => t[theme]))
            const content = text(frame(theme))
            for (const token of colorTokens) {
                const foreign = token[other]
                if (own.has(foreign)) continue
                expect(content, `${token.name} ${other} value ${foreign}`).not.toContain(foreign)
            }
        })

        it("shows the four type sizes and both font families", () => {
            expect(textTokens).toHaveLength(4)
            const el = frame(theme)
            const content = text(el)
            for (const token of textTokens) {
                expect(content, token.name).toContain(token.name)
                expect(content, `${token.name} value`).toContain(token.value)
                const cls = token.name.replace(/^--ds-/, "").replace(/^text-/, "text-ds-")
                expect(hasClass(el, cls), cls).toBe(true)
            }
            expect(hasClass(el, "font-ds"), "font-ds").toBe(true)
            expect(hasClass(el, "font-ds-prose"), "font-ds-prose").toBe(true)
        })

        it("shows the five spacing steps", () => {
            expect(spaceTokens).toHaveLength(5)
            const el = frame(theme)
            const content = text(el)
            for (const token of spaceTokens) {
                expect(content, token.name).toContain(token.name)
                expect(content, `${token.name} value`).toContain(token.value)
                const step = token.name.replace(/^--ds-space-/, "")
                expect(hasClass(el, `w-ds-${step}`), `w-ds-${step}`).toBe(true)
            }
        })

        it("renders every registered sample's title", () => {
            const content = text(frame(theme))
            for (const sample of DESIGN_SAMPLES) {
                expect(content, sample.id).toContain(sample.title.toLowerCase())
            }
        })
    })

    describe("sample registry (app/design/samples)", () => {
        it("registers one entry per sample kind with unique ids", () => {
            expect(DESIGN_SAMPLES.length).toBeGreaterThanOrEqual(3)
            const ids = DESIGN_SAMPLES.map((s) => s.id)
            expect(new Set(ids).size).toBe(ids.length)
            for (const sample of DESIGN_SAMPLES) {
                expect(typeof sample.title).toBe("string")
                expect(typeof sample.Sample).toBe("function")
            }
        })
    })

    describe("styling rules", () => {
        const legacyColorKeys = Object.keys(tailwindConfig.theme?.extend?.colors ?? {}).filter(
            (k) => k !== "ds"
        )
        const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        const legacyColorRe = new RegExp(
            `^(bg|text|border|ring|fill|stroke|outline|divide)-(${legacyColorKeys
                .map(escapeRe)
                .join("|")})$`
        )

        const FORBIDDEN: Array<[string, RegExp]> = [
            ["rounded corners", /^rounded/],
            ["shadow", /^shadow/],
            ["translucency", /^(opacity-|bg-opacity|text-opacity|border-opacity)/],
            ["alpha modifier", /\/\d+$/],
            ["gradient", /gradient|^(from|via|to)-/],
            ["blur", /blur/],
            ["animation", /^(animate-|transition|duration-)/],
            ["arbitrary value", /\[/],
            ["legacy color token", legacyColorRe],
            [
                "default palette color",
                /^(bg|text|border)-(white|black|(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d+)$/,
            ],
            [
                "default spacing",
                /^-?(p|px|py|pt|pb|pl|pr|ps|pe|m|mx|my|mt|mb|ml|mr|ms|me|gap|gap-x|gap-y|space-x|space-y|w|h|size|inset|top|left|right|bottom)-(\d|px$)/,
            ],
            ["default font size", /^text-(xs|sm|base|lg|\d?xl)$/],
            ["default font family", /^font-(sans|serif|mono)$/],
        ]

        it("uses only ds tokens and no decoration classes", () => {
            const classes = new Set(
                Array.from(root.querySelectorAll<HTMLElement>("[class]")).flatMap((el) =>
                    Array.from(el.classList).map((c) => c.split(":").pop() ?? c)
                )
            )
            expect(classes.size).toBeGreaterThan(0)
            const offenders = Array.from(classes).flatMap((cls) =>
                FORBIDDEN.filter(([, re]) => re.test(cls)).map(([why]) => `${cls} (${why})`)
            )
            expect(offenders).toEqual([])
        })

        it("does not render icons or inline hard-coded values", () => {
            expect(root.querySelector("svg")).toBeNull()
            for (const el of Array.from(root.querySelectorAll<HTMLElement>("[style]"))) {
                const style = el.getAttribute("style") ?? ""
                // No element, LodgeExterior included, may hard-code a colour inline.
                expect(style).not.toMatch(/#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(/)
                // LodgeExterior is a fixed-geometry drawing whose leaf positions come
                // straight from the mock (Maze.dc.html), so only its subtree may carry
                // length units inline; the rest of the page stays free of them.
                if (el.closest('[data-part="lodge-exterior"]') === null) {
                    expect(style).not.toMatch(/\d(px|rem|em)\b/)
                }
            }
        })
    })
})
