// @vitest-environment jsdom
import { describe, expect, it } from "vitest"

import { Section } from "../Section"
import { closestClass, render } from "./render"

const INDENT = /^(md:)?(pl|ps|ml|ms|px|mx)-/

describe("Section", () => {
    it("renders the heading as an uppercase h2 inside a section", () => {
        const root = render(
            <Section heading="name">
                <p>onclimb の山荘</p>
            </Section>
        )
        const h2 = root.querySelector("section > h2")
        expect(h2).not.toBeNull()
        expect(h2!.textContent).toBe("name")
        expect(h2!.classList.contains("uppercase"), "uppercase").toBe(true)
        expect(root.querySelectorAll("h1, h3, h4, h5, h6")).toHaveLength(0)
    })

    it("indents the body but not the heading, like a man page", () => {
        const root = render(
            <Section heading="description">
                <p data-part="body">onclimb の山荘</p>
            </Section>
        )
        const section = root.querySelector("section")!
        const h2 = section.querySelector("h2")!
        const body = section.querySelector('[data-part="body"]')!

        expect(closestClass(h2, INDENT, root), "heading indent").toBeUndefined()

        const container = body.parentElement!
        expect(container).not.toBe(section)
        expect(container.contains(h2)).toBe(false)
        expect(container.classList.contains("pl-ds-3"), "pl-ds-3").toBe(true)
        expect(container.classList.contains("md:pl-ds-5"), "md:pl-ds-5").toBe(true)
    })
})
