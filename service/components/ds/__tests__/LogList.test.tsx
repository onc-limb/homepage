// @vitest-environment jsdom
import * as React from "react"
import { describe, expect, it, vi } from "vitest"

import { LogList } from "../LogList"
import { elementWithText, precedes, render } from "./render"

vi.mock("next/link", () => ({
    default: ({ children, ...props }: any) => (
        <a data-next-link="" {...props}>
            {children}
        </a>
    ),
}))

const ITEMS = [
    { id: "a1b2c3d", date: "2026-11-01", title: "homepage", href: "/3f/portfolios/homepage" },
    { id: "e4f5a6b", date: "2026-10-12", title: "ol-soldiers", href: "/3f/portfolios/ol-soldiers" },
    { id: "c7d8e9f", date: "2026-09-03", title: "agora", href: "/3f/portfolios/agora" },
]

describe("LogList", () => {
    it("renders one li per item inside a ul, each row being a single link", () => {
        const root = render(<LogList items={ITEMS} />)
        const ul = root.querySelector("ul")
        expect(ul).not.toBeNull()
        const rows = Array.from(ul!.children)
        expect(rows.map((el) => el.tagName)).toEqual(["LI", "LI", "LI"])

        rows.forEach((li, i) => {
            const item = ITEMS[i]
            const links = li.querySelectorAll("a")
            expect(links, item.id).toHaveLength(1)
            const a = links[0]
            expect(a.getAttribute("href")).toBe(item.href)
            expect(a.hasAttribute("data-next-link"), "next/link").toBe(true)
            // The whole row (date, id and title) is inside the link.
            const date = elementWithText(a, item.date)
            const id = elementWithText(a, item.id)
            const title = elementWithText(a, item.title)
            expect(date, "date").toBeDefined()
            expect(id, "id").toBeDefined()
            expect(title, "title").toBeDefined()
            expect(precedes(date!, title!), "date before title").toBe(true)
        })
    })

    it("stacks date and title on narrow screens and uses three columns from md up", () => {
        const root = render(<LogList items={ITEMS} />)
        const a = root.querySelector("li a")!
        expect(a.classList.contains("grid"), "grid").toBe(true)
        expect(a.classList.contains("grid-cols-1"), "grid-cols-1").toBe(true)
        expect(a.classList.contains("md:grid-cols-ds-log"), "md:grid-cols-ds-log").toBe(true)

        const date = elementWithText(a, ITEMS[0].date)!
        const title = elementWithText(a, ITEMS[0].title)!
        expect(date).not.toBe(title)
        expect(date.contains(title) || title.contains(date), "separate elements").toBe(false)
    })
})
