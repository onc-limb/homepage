// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

// The page must only lay out the registry: replacing the registry with two
// stub samples has to change what both frames show, in registry order.
vi.mock("./samples", () => ({
    DESIGN_SAMPLES: [
        {
            id: "second",
            title: "Stub second",
            Sample: ({ theme }: { theme: "light" | "dark" }) => (
                <p data-sample="second">second:{theme}</p>
            ),
        },
        {
            id: "first",
            title: "Stub first",
            Sample: ({ theme }: { theme: "light" | "dark" }) => (
                <p data-sample="first">first:{theme}</p>
            ),
        },
    ],
}))

import DesignPage from "./page"

async function renderPage(): Promise<HTMLElement> {
    const root = document.createElement("div")
    root.innerHTML = renderToStaticMarkup(await DesignPage())
    return root
}

describe("/design page layout", () => {
    it.each(["light", "dark"] as const)(
        "renders the registered samples in registry order inside the %s frame",
        async (theme) => {
            const root = await renderPage()
            const frame = root.querySelector<HTMLElement>(`[data-theme="${theme}"]`)
            expect(frame).not.toBeNull()

            const rendered = Array.from(frame!.querySelectorAll("[data-sample]")).map((el) =>
                el.textContent
            )
            expect(rendered).toEqual([`second:${theme}`, `first:${theme}`])

            const content = frame!.textContent ?? ""
            expect(content.indexOf("Stub second")).toBeGreaterThanOrEqual(0)
            expect(content.indexOf("Stub second")).toBeLessThan(content.indexOf("Stub first"))
        }
    )

    it("does not write token samples directly in the page", async () => {
        const root = await renderPage()
        expect(root.textContent ?? "").not.toContain("--ds-")
    })
})
