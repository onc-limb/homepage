// @vitest-environment jsdom
import * as React from "react"
import { describe, expect, it, vi } from "vitest"

import { PagerDoors } from "../PagerDoors"
import { render } from "./render"

vi.mock("next/link", () => ({
    default: ({ children, ...props }: any) => (
        <a data-next-link="" {...props}>
            {children}
        </a>
    ),
}))

const PREV = { title: "agora", href: "/3f/portfolios/agora" }
const NEXT = { title: "ol-soldiers", href: "/3f/portfolios/ol-soldiers" }
const LIST = { category: "Portfolio", listHref: "/3f/portfolios" }

/** [visible text, href] of each door link inside the nav, in order. */
function doors(root: HTMLElement): Array<[string, string | null]> {
    const nav = root.querySelector("nav")
    expect(nav, "nav").not.toBeNull()
    return Array.from(nav!.querySelectorAll("a")).map((a) => [
        (a.textContent ?? "").trim(),
        a.getAttribute("href"),
    ])
}

describe("PagerDoors", () => {
    it("shows previous, back-to-list and next doors in that order", () => {
        const root = render(<PagerDoors prev={PREV} next={NEXT} {...LIST} />)
        expect(doors(root)).toEqual([
            ["← 前: agora", "/3f/portfolios/agora"],
            ["Portfolioの一覧へ戻る", "/3f/portfolios"],
            ["次: ol-soldiers →", "/3f/portfolios/ol-soldiers"],
        ])
    })

    it("omits the previous door on the first page", () => {
        const root = render(<PagerDoors next={NEXT} {...LIST} />)
        expect(doors(root)).toEqual([
            ["Portfolioの一覧へ戻る", "/3f/portfolios"],
            ["次: ol-soldiers →", "/3f/portfolios/ol-soldiers"],
        ])
        expect(root.textContent).not.toContain("前:")
    })

    it("omits the next door on the last page", () => {
        const root = render(<PagerDoors prev={PREV} {...LIST} />)
        expect(doors(root)).toEqual([
            ["← 前: agora", "/3f/portfolios/agora"],
            ["Portfolioの一覧へ戻る", "/3f/portfolios"],
        ])
        expect(root.textContent).not.toContain("次:")
    })

    it("wraps the doors in a labelled nav", () => {
        const root = render(<PagerDoors prev={PREV} next={NEXT} {...LIST} />)
        const navs = root.querySelectorAll("nav")
        expect(navs).toHaveLength(1)
        expect(navs[0].getAttribute("aria-label")).toBe("前後のページ")
    })

    it("uses small DoorButtons for every door", () => {
        const root = render(<PagerDoors prev={PREV} next={NEXT} {...LIST} />)
        const links = Array.from(root.querySelectorAll("nav a"))
        expect(links).toHaveLength(3)
        for (const a of links) {
            const all = [a, ...Array.from(a.querySelectorAll("*"))]
            expect(all.some((e) => e.classList.contains("border-ds-door")), "small door frame").toBe(true)
            expect(all.some((e) => e.classList.contains("border-ds-door-lg")), "not large").toBe(false)
            expect(all.some((e) => e.classList.contains("bg-ds-map-wood")), "wood face").toBe(true)
        }
    })

    it("stacks vertically on narrow screens and wraps in a row from md up", () => {
        const nav = render(<PagerDoors prev={PREV} next={NEXT} {...LIST} />).querySelector("nav")!
        for (const cls of ["flex", "flex-col", "md:flex-row", "md:flex-wrap"]) {
            expect(nav.classList.contains(cls), cls).toBe(true)
        }
    })
})
