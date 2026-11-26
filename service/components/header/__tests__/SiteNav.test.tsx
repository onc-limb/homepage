// @vitest-environment jsdom
import * as React from "react"
import { describe, expect, it, vi } from "vitest"

import { TextLink } from "@/components/ds/TextLink"
import { NAV_ITEMS } from "@/lib/constants"
import { render } from "../../ds/__tests__/render"
import { SiteNav } from "../SiteNav"

// next/link -> plain anchor so href / class / aria assertions work under a static render.
vi.mock("next/link", () => ({
    default: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}))

function navOf(pathname: string): HTMLElement {
    const navs = render(<SiteNav pathname={pathname} />).querySelectorAll("nav")
    expect(navs).toHaveLength(1)
    return navs[0]
}

function linksOf(pathname: string): HTMLAnchorElement[] {
    return Array.from(navOf(pathname).querySelectorAll("a"))
}

function currentLabels(pathname: string): string[] {
    return linksOf(pathname)
        .filter((a) => a.getAttribute("aria-current") === "page")
        .map((a) => a.textContent ?? "")
}

describe("SiteNav items", () => {
    it("is a navigation landmark named サイト", () => {
        expect(navOf("/").getAttribute("aria-label")).toBe("サイト")
    })

    it("lists the NAV_ITEMS labels and hrefs in order", () => {
        const links = linksOf("/2f/skills")
        expect(links.map((a) => [a.getAttribute("href"), a.textContent])).toEqual(
            NAV_ITEMS.map((item) => [item.href, item.label])
        )
    })

    it("shows 案内 and the five floors", () => {
        expect(linksOf("/2f/skills").map((a) => [a.getAttribute("href"), a.textContent])).toEqual([
            ["/", "案内"],
            ["/b1", "B1 自己学習"],
            ["/1f", "1F プロフィール"],
            ["/2f", "2F 経歴・技術"],
            ["/3f", "3F 作品・考え"],
            ["/rf", "屋上 リンク"],
        ])
    })

    it.each(["books", "blog"])("has no link to %s by href or by label", (name) => {
        for (const a of linksOf("/2f/skills")) {
            const href = a.getAttribute("href") ?? ""
            expect(href.replace(/\/+$/, "").toLowerCase(), href).not.toBe(`/${name}`)
            expect((a.textContent ?? "").trim().toLowerCase(), href).not.toBe(name)
        }
    })

    it("draws every item with the TextLink look", () => {
        const textLink = render(<TextLink href="/x">x</TextLink>).querySelector("a")!
        const shared = Array.from(textLink.classList)
        expect(shared).toEqual(expect.arrayContaining(["text-ds-link", "underline"]))
        for (const a of linksOf("/2f/skills")) {
            expect(Array.from(a.classList), a.textContent ?? "").toEqual(
                expect.arrayContaining(shared)
            )
        }
    })
})

describe("SiteNav current page", () => {
    it.each([
        ["/portfolio", ["3F 作品・考え"]],
        ["/2f/skills", ["2F 経歴・技術"]],
        ["/b1/studies", ["B1 自己学習"]],
        ["/skills", []],
        ["/portfolio/onc-limb", ["3F 作品・考え"]],
        ["/1f/contact", ["1F プロフィール"]],
        ["/b1", ["B1 自己学習"]],
        ["/rf", ["屋上 リンク"]],
        ["/", ["案内"]],
        ["/books", []],
    ])("marks only the floor the page belongs to as current on %s", (pathname, expected) => {
        expect(currentLabels(pathname)).toEqual(expected)
    })

    it("underlines the current item with the accent color and no other item", () => {
        for (const a of linksOf("/2f/skills")) {
            const current = a.getAttribute("aria-current") === "page"
            expect(a.classList.contains("decoration-ds-accent"), a.textContent ?? "").toBe(
                current
            )
        }
    })
})
