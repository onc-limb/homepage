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
        const links = linksOf("/skills")
        expect(links.map((a) => [a.getAttribute("href"), a.textContent])).toEqual(
            NAV_ITEMS.map((item) => [item.href, item.label])
        )
    })

    it("shows the five Japanese labels", () => {
        expect(linksOf("/skills").map((a) => a.textContent)).toEqual([
            "ホーム",
            "プロフィール",
            "スキル",
            "ポートフォリオ",
            "連絡先",
        ])
    })

    it.each(["books", "blog"])("has no link to %s by href or by label", (name) => {
        for (const a of linksOf("/skills")) {
            const href = a.getAttribute("href") ?? ""
            expect(href.replace(/\/+$/, "").toLowerCase(), href).not.toBe(`/${name}`)
            expect((a.textContent ?? "").trim().toLowerCase(), href).not.toBe(name)
        }
    })

    it("draws every item with the TextLink look", () => {
        const textLink = render(<TextLink href="/x">x</TextLink>).querySelector("a")!
        const shared = Array.from(textLink.classList)
        expect(shared).toEqual(expect.arrayContaining(["text-ds-link", "underline"]))
        for (const a of linksOf("/skills")) {
            expect(Array.from(a.classList), a.textContent ?? "").toEqual(
                expect.arrayContaining(shared)
            )
        }
    })
})

describe("SiteNav current page", () => {
    it.each([
        ["/skills", ["スキル"]],
        ["/portfolio/onc-limb", ["ポートフォリオ"]],
        ["/", ["ホーム"]],
        ["/books", []],
    ])("marks only the matching item as current on %s", (pathname, expected) => {
        expect(currentLabels(pathname)).toEqual(expected)
    })

    it("underlines the current item with the accent color and no other item", () => {
        for (const a of linksOf("/skills")) {
            const current = a.getAttribute("aria-current") === "page"
            expect(a.classList.contains("decoration-ds-accent"), a.textContent ?? "").toBe(
                current
            )
        }
    })
})
