// @vitest-environment jsdom
import * as React from "react"
import { describe, expect, it } from "vitest"

import { BOXED_SURFACE } from "@/components/ds/surface-styles"
import { render } from "../../ds/__tests__/render"
import { ArchDiagram } from "../ArchDiagram"

/**
 * ArchDiagram contract tests.
 *
 * The diagram is redrawn with ds tokens only: colors come from fill-ds-* /
 * stroke-ds-* / text-ds-* / border-ds-* / bg-ds-* classes, text from the ds
 * font classes, the frame from the shared boxed surface. No inline styles, no
 * rounded corners, no animation class, no old CSS variables. What the diagram
 * shows (boxes, clusters, arrows, labels, legend and their geometry) stays the
 * same as before.
 */

/** Every svg text in document order, as the diagram showed it before the redraw. */
const SVG_TEXTS = [
    "USER",
    "User",
    "browser",
    "CLOUDFLARE EDGE",
    "Cloudflare Workers",
    "OpenNext / Next.js 15 App Router",
    "RSC · Server Actions · NextAuth",
    "R2",
    "images / md",
    "KV Cache",
    "ISR cache",
    "Cloudflare D1",
    "SQLite · Drizzle ORM",
    "books · notes · views",
    "EXTERNAL",
    "OpenAI / Anthropic",
    "news summary",
    "RSS / GitHub Trending",
    "scheduled fetch",
    "CI / CD",
    "GitHub Actions",
    "Wrangler deploy",
    "GitHub Repo (main)",
    "HTTPS",
    "SQL",
    "fetch",
    "cron",
    "deploy",
]

/** [x, y, width, height] of the 4 clusters and the 9 boxes, in document order. */
const RECTS = [
    [20, 20, 160, 440],
    [50, 200, 100, 60],
    [220, 20, 320, 440],
    [260, 80, 240, 80],
    [260, 200, 110, 60],
    [390, 200, 110, 60],
    [260, 320, 240, 80],
    [580, 20, 300, 240],
    [620, 80, 220, 60],
    [620, 170, 220, 60],
    [580, 280, 300, 180],
    [620, 330, 220, 60],
    [620, 400, 220, 40],
].map((values) => values.map(String))

/** The arrow head and the 8 connections. */
const PATHS = [
    "M0,0 L10,5 L0,10 z",
    "M 150 220 C 200 220, 220 120, 260 120",
    "M 320 160 L 315 200",
    "M 440 160 L 445 200",
    "M 380 260 L 380 320",
    "M 500 110 L 620 110",
    "M 620 200 L 500 140",
    "M 620 360 C 540 360, 540 130, 500 130",
    "M 730 400 L 730 390",
]

const LEGEND = ["Core compute", "Storage / external", "request flow", "scheduled / deploy"]

function diagram() {
    const root = render(<ArchDiagram />)
    const frame = root.firstElementChild as HTMLElement
    const svg = root.querySelector("svg")!
    return { root, frame, svg }
}

const allElements = (root: Element) => Array.from(root.querySelectorAll("*"))

describe("ArchDiagram content", () => {
    it("keeps the svg as one labelled image with the same viewBox", () => {
        const { root, svg } = diagram()
        expect(root.querySelectorAll("svg")).toHaveLength(1)
        expect(svg.getAttribute("role")).toBe("img")
        expect(svg.getAttribute("aria-label")).toBe("onc-limb.com architecture diagram")
        expect(svg.getAttribute("viewBox")).toBe("0 0 900 480")
    })

    it("keeps every label of the clusters, boxes and arrows", () => {
        const { svg } = diagram()
        expect(Array.from(svg.querySelectorAll("text")).map((t) => t.textContent)).toEqual(SVG_TEXTS)
    })

    it("keeps the position and size of the clusters and boxes", () => {
        const { svg } = diagram()
        const rects = Array.from(svg.querySelectorAll("rect")).map((r) =>
            ["x", "y", "width", "height"].map((name) => r.getAttribute(name)),
        )
        expect(rects).toEqual(RECTS)
    })

    it("keeps the arrow head and the routes of the arrows", () => {
        const { svg } = diagram()
        expect(Array.from(svg.querySelectorAll("path")).map((p) => p.getAttribute("d"))).toEqual(PATHS)
        // every connection still ends with the arrow head
        const connections = Array.from(svg.querySelectorAll("path")).slice(1)
        for (const path of connections) {
            expect(path.getAttribute("marker-end"), path.getAttribute("d") ?? "").toBe("url(#arr)")
        }
    })

    it("keeps the dashed request flows and the dashed cluster borders", () => {
        const { svg } = diagram()
        const dashedPaths = Array.from(svg.querySelectorAll("path[stroke-dasharray]")).map((p) => p.getAttribute("d"))
        expect(dashedPaths).toEqual(["M 150 220 C 200 220, 220 120, 260 120", "M 380 260 L 380 320"])
        const dashedRects = Array.from(svg.querySelectorAll("rect[stroke-dasharray]")).map((r) => r.getAttribute("x"))
        expect(dashedRects).toEqual(["20", "220", "580", "580"])
    })

    it("keeps the four legend entries below the svg", () => {
        const { frame, svg } = diagram()
        const text = frame.textContent ?? ""
        const afterSvg = text.slice(text.indexOf(svg.textContent ?? "") + (svg.textContent ?? "").length)
        expect(afterSvg).toBe(LEGEND.join(""))
    })
})

describe("ArchDiagram ds tokens", () => {
    it("frames the diagram with the shared boxed surface", () => {
        const { frame } = diagram()
        for (const cls of BOXED_SURFACE.split(" ")) {
            expect(frame.classList.contains(cls), cls).toBe(true)
        }
    })

    it("has no inline styles, rounded corners, old CSS variables or animation class", () => {
        const { root } = diagram()
        expect(root.querySelector("[style]"), "no inline styles").toBeNull()
        expect(root.querySelector("[rx], [ry]"), "no rounded rects").toBeNull()
        for (const el of allElements(root)) {
            for (const attr of Array.from(el.attributes)) {
                expect(attr.value, `${el.tagName} ${attr.name}`).not.toMatch(/var\(--/)
            }
            // fonts come from classes, not from svg presentation attributes
            for (const name of ["font-family", "font-size", "letter-spacing", "font-weight"]) {
                expect(el.hasAttribute(name), `${el.tagName} ${name}`).toBe(false)
            }
        }
        const banned = allElements(root)
            .flatMap((el) => Array.from(el.classList))
            .filter((c) => /rounded|shadow|gradient|backdrop|opacity|animate|transition|arch-flow|\/\d+$|\[/.test(c))
        expect(banned).toEqual([])
    })

    it("colors the shapes and the text with ds classes only", () => {
        const { svg } = diagram()
        for (const el of Array.from(svg.querySelectorAll("rect, path, text"))) {
            const label = `${el.tagName} ${el.getAttribute("d") ?? el.getAttribute("x") ?? ""} ${el.textContent}`
            const fill = el.getAttribute("fill")
            const stroke = el.getAttribute("stroke")
            // the only presentation color left is "none" (no fill)
            expect(fill === null || fill === "none", `${label} fill=${fill}`).toBe(true)
            expect(stroke, `${label} stroke`).toBeNull()
            const classes = Array.from(el.classList)
            const colorClasses = classes.filter((c) => /^(fill|stroke)-/.test(c) && !/^stroke-\d/.test(c))
            for (const c of colorClasses) expect(c, label).toMatch(/^(fill|stroke)-ds-/)
            if (el.tagName === "text") {
                expect(colorClasses.some((c) => c.startsWith("fill-ds-")), `${label} text color`).toBe(true)
                expect(classes, label).toContain("font-ds")
            } else if (fill !== "none") {
                expect(colorClasses.some((c) => c.startsWith("fill-ds-")), `${label} fill color`).toBe(true)
            }
            if (el.tagName !== "text" && !(el.tagName === "path" && el.getAttribute("d") === PATHS[0])) {
                expect(colorClasses.some((c) => c.startsWith("stroke-ds-")), `${label} stroke color`).toBe(true)
            }
        }
    })

    it("draws every line 1px wide", () => {
        const { svg } = diagram()
        for (const el of Array.from(svg.querySelectorAll("[stroke-width]"))) {
            expect(el.getAttribute("stroke-width"), `${el.tagName} ${el.getAttribute("d") ?? ""}`).toBe("1")
        }
    })

    it("draws the accent boxes and the core flows in the accent color", () => {
        const { svg } = diagram()
        const rectOf = (label: string) => {
            const text = Array.from(svg.querySelectorAll("text")).find((t) => t.textContent === label)!
            let prev = text.previousElementSibling
            while (prev && prev.tagName !== "rect") prev = prev.previousElementSibling
            return prev!
        }
        for (const label of ["Cloudflare Workers", "Cloudflare D1"]) {
            expect(rectOf(label).classList.contains("stroke-ds-accent"), label).toBe(true)
        }
        for (const label of ["R2", "KV Cache", "GitHub Actions"]) {
            expect(rectOf(label).classList.contains("stroke-ds-accent"), label).toBe(false)
        }
    })

    it("colors the legend with ds classes and draws the swatches as plain bordered blocks", () => {
        const { frame, svg } = diagram()
        const legend = allElements(frame).filter((el) => !svg.contains(el) && el !== svg)
        expect(legend.length).toBeGreaterThan(0)
        const classes = legend.flatMap((el) => Array.from(el.classList))
        const colors = classes.filter((c) => /^(text|bg|border)-/.test(c) && !/^border(-[tblrxy])?$/.test(c))
        const nonDs = colors.filter(
            (c) => !/^(text|bg|border(-[tblrxy])?)-ds-/.test(c) && !/^border-(dashed|solid|dotted)$/.test(c),
        )
        expect(nonDs).toEqual([])
        expect(frame.querySelector(".border-ds-accent"), "accent swatch").not.toBeNull()
        expect(frame.querySelector(".border-dashed"), "dashed line sample").not.toBeNull()
    })
})
