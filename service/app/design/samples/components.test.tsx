// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server"
import { beforeAll, describe, expect, it } from "vitest"

import { LIT_MARK } from "@/components/ds/lit-mark"
import { findGroup } from "@/lib/building/floors"

import DesignPage from "../page"
import { DESIGN_SAMPLES } from "./index"

const THEMES = ["light", "dark"] as const

/** Sample id -> selector of the component's own markup inside its sample. */
const COMPONENT_SAMPLES: Array<[string, string]> = [
    ["page", "h1"],
    ["section", "section > h2"],
    ["key-value", "dl dt + dd"],
    ["data-table", "table thead th"],
    ["code-block", "pre > code"],
    ["prose", ".font-ds-prose.max-w-ds-measure"],
    ["text-link", "a[href]"],
    ["log-list", "ul > li a[href]"],
    ["door-button", "button, a[href]"],
    ["pager-doors", "nav[aria-label] a[href]"],
    ["floor-guide", '[role="group"][aria-label="階"] button[aria-pressed]'],
    ["guide-pc", "section h2"],
    ["lodge-exterior", '[data-part="lodge-exterior"][aria-hidden="true"]'],
]

let root: HTMLElement

beforeAll(async () => {
    root = document.createElement("div")
    root.innerHTML = renderToStaticMarkup(await DesignPage())
})

/** The sample block on /design whose h3 title matches the registered sample. */
function sampleBlock(theme: (typeof THEMES)[number], id: string): HTMLElement {
    const sample = DESIGN_SAMPLES.find((s) => s.id === id)
    if (!sample) throw new Error(`sample "${id}" is not registered`)
    const frame = root.querySelector<HTMLElement>(`[data-theme="${theme}"]`)
    if (!frame) throw new Error(`no data-theme="${theme}" frame`)
    const heading = Array.from(frame.querySelectorAll("h3")).find(
        (h3) => h3.textContent === sample.title
    )
    if (!heading?.parentElement) throw new Error(`sample "${id}" is not shown in ${theme}`)
    return heading.parentElement
}

describe("/design component samples", () => {
    it("registers a sample for each of the components", () => {
        const ids = DESIGN_SAMPLES.map((s) => s.id)
        for (const [id] of COMPONENT_SAMPLES) expect(ids, id).toContain(id)
    })

    describe.each(THEMES)("%s frame", (theme) => {
        it.each(COMPONENT_SAMPLES)("shows the %s component (%s)", (id, selector) => {
            const block = sampleBlock(theme, id)
            expect(block.querySelector(selector), `${id}: ${selector}`).not.toBeNull()
        })

        it("shows TextLink as both an internal and an external link", () => {
            const links = Array.from(sampleBlock(theme, "text-link").querySelectorAll("a[href]"))
            const external = links.filter((a) => a.getAttribute("target") === "_blank")
            expect(external.length, "external").toBeGreaterThanOrEqual(1)
            expect(links.length - external.length, "internal").toBeGreaterThanOrEqual(1)
        })

        it("shows DoorButton small and large, each as normal, primary and pressed", () => {
            const block = sampleBlock(theme, "door-button")
            for (const frameClass of ["border-ds-door", "border-ds-door-lg"]) {
                const frames = Array.from(block.querySelectorAll(`.${frameClass}`))
                expect(frames, frameClass).toHaveLength(3)
                const accent = frames.filter((f) => f.classList.contains("border-ds-accent"))
                expect(accent, `${frameClass} accent frames`).toHaveLength(2)
            }
            expect(block.querySelectorAll('[data-primary="true"]'), "primary").toHaveLength(2)
            expect(block.querySelectorAll('button[aria-pressed="true"]'), "pressed").toHaveLength(2)
        })

        it("shows FloorMap on wood, stone and terrace floors, with selected, lit and small maps", () => {
            const block = sampleBlock(theme, "floor-map")
            const maps = Array.from(block.querySelectorAll<HTMLElement>("[data-floor]"))
            const materials = new Set(maps.map((m) => m.getAttribute("data-material")))
            for (const material of ["wood", "stone", "deck"]) {
                expect(materials.has(material), material).toBe(true)
            }
            expect(maps.filter((m) => m.getAttribute("data-size") === "normal").length, "normal").toBeGreaterThan(0)
            const small = maps.filter((m) => m.getAttribute("data-size") === "small")
            expect(small.length, "small").toBeGreaterThan(0)
            expect(
                small.some((m) => m.querySelector('[data-part="mark"]') !== null),
                "small map with a mark"
            ).toBe(true)
            expect(block.querySelectorAll('button[aria-pressed="true"]').length, "selected").toBeGreaterThan(0)
            expect(block.querySelectorAll('[data-lit="true"]').length, "lit").toBeGreaterThan(0)
            expect(block.querySelectorAll('[data-part="label"]').length, "labels").toBeGreaterThan(0)
        })

        it("shows FloorGuide with a selected floor and a floor with a count", () => {
            const block = sampleBlock(theme, "floor-guide")
            const floors = block.querySelectorAll('[role="group"][aria-label="階"] button')
            expect(floors, "floors").toHaveLength(5)
            expect(block.querySelectorAll('button[aria-pressed="true"]'), "selected").toHaveLength(1)
            expect(block.querySelector('[data-part="roof"]'), "roof").not.toBeNull()
            expect(block.textContent, "count").toMatch(new RegExp(`${LIT_MARK}\\d`))
        })

        it("shows GuidePc with the heading, more than five papers and the Contact door", () => {
            const block = sampleBlock(theme, "guide-pc")
            expect(block.querySelector("section h2")?.textContent).toContain("案内人")
            expect(block.textContent, "docent").toContain("$ docent")
            expect(block.textContent, "rest of the papers").toMatch(/ほか\s*\d+\s*枚/)
            const contact = block.querySelector<HTMLElement>('[data-primary="true"]')
            expect(contact?.textContent?.trim(), "Contact").toBe("Contact")
            expect(contact?.getAttribute("href"), "Contact href").toBe(findGroup("contact").href)
            expect(block.querySelectorAll("button[aria-pressed]").length, "searches").toBeGreaterThan(0)
        })

        it("shows LodgeExterior with the door closed and open, at the desktop and the narrow size", () => {
            const drawings = Array.from(
                sampleBlock(theme, "lodge-exterior").querySelectorAll<HTMLElement>('[data-part="lodge-exterior"]')
            )
            const shown = drawings.map((d) => `${d.getAttribute("data-size")}/${d.getAttribute("data-door")}`)
            expect([...shown].sort()).toEqual(["desktop/closed", "desktop/open", "narrow/closed", "narrow/open"])
        })

        it("shows PagerDoors in the middle, on the first and on the last page", () => {
            const navs = Array.from(sampleBlock(theme, "pager-doors").querySelectorAll("nav"))
            expect(navs).toHaveLength(3)
            const texts = navs.map((nav) => nav.textContent ?? "")
            expect(texts.filter((t) => t.includes("前:") && t.includes("次:")), "middle").toHaveLength(1)
            expect(texts.filter((t) => !t.includes("前:") && t.includes("次:")), "first").toHaveLength(1)
            expect(texts.filter((t) => t.includes("前:") && !t.includes("次:")), "last").toHaveLength(1)
        })
    })
})
