// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server"
import { beforeAll, describe, expect, it } from "vitest"

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
    it("registers a sample for each of the six components", () => {
        const ids = DESIGN_SAMPLES.map((s) => s.id)
        for (const [id] of COMPONENT_SAMPLES) expect(ids, id).toContain(id)
    })

    describe.each(THEMES)("%s frame", (theme) => {
        it.each(COMPONENT_SAMPLES)("shows the %s component (%s)", (id, selector) => {
            const block = sampleBlock(theme, id)
            expect(block.querySelector(selector), `${id}: ${selector}`).not.toBeNull()
        })
    })
})
