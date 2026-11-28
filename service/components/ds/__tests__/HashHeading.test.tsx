// @vitest-environment jsdom
import { describe, expect, it } from "vitest"

import { HashHeading } from "../HashHeading"
import { render } from "./render"

describe("HashHeading", () => {
    it("renders an h2 with a single # marker by default", () => {
        const root = render(<HashHeading>フォームで送る</HashHeading>)
        const h2 = root.querySelector("h2")
        expect(h2).not.toBeNull()
        expect(h2!.textContent).toBe("# フォームで送る")
        expect(root.querySelectorAll("h1, h3, h4, h5, h6")).toHaveLength(0)
    })

    it("renders an h3 with a ## marker at level 3", () => {
        const root = render(<HashHeading level={3}>業務</HashHeading>)
        expect(root.querySelector("h3")!.textContent).toBe("## 業務")
    })

    it("renders an h4 with a ### marker at level 4", () => {
        const root = render(<HashHeading level={4}>Frontend</HashHeading>)
        expect(root.querySelector("h4")!.textContent).toBe("### Frontend")
    })

    it("hides the marker from screen readers", () => {
        const root = render(<HashHeading>見出し</HashHeading>)
        const marker = root.querySelector("h2 > span")!
        expect(marker.getAttribute("aria-hidden")).toBe("true")
        expect(marker.textContent).toBe("# ")
    })

    // The legacy base CSS colours bare h1-h4 with --fg-strong; the heading must set its own colour.
    it.each([2, 3, 4] as const)("sets the ds text colour at level %i", (level) => {
        const root = render(<HashHeading level={level}>見出し</HashHeading>)
        const heading = root.querySelector("h2, h3, h4")!
        expect(heading.classList.contains("text-ds-fg")).toBe(true)
    })

    it("appends spacing classes without dropping the scale", () => {
        const root = render(<HashHeading className="mt-ds-4 mb-ds-3">見出し</HashHeading>)
        const classes = root.querySelector("h2")!.classList
        for (const cls of ["mt-ds-4", "mb-ds-3", "font-ds", "text-ds-lg", "font-bold", "text-ds-fg"]) {
            expect(classes.contains(cls), cls).toBe(true)
        }
    })
})
