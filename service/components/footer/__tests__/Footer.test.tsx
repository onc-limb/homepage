// @vitest-environment jsdom
import * as React from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { render } from "@/components/ds/__tests__/render"
import { NAV_ITEMS, SOCIAL_LINKS } from "@/lib/constants"
import { SITE_NAME } from "@/lib/seo"
import Footer from "../Footer"

// next/link -> plain anchor so href / target assertions work under a static render.
vi.mock("next/link", () => ({
    default: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}))

const YEAR = 2031

function renderFooter(): HTMLElement {
    const footers = render(<Footer />).querySelectorAll("footer")
    expect(footers).toHaveLength(1)
    return footers[0]
}

function internalLinks(footer: HTMLElement): HTMLAnchorElement[] {
    return Array.from(footer.querySelectorAll("a")).filter((a) => !a.hasAttribute("target"))
}

function externalLinks(footer: HTMLElement): HTMLAnchorElement[] {
    return Array.from(footer.querySelectorAll("a")).filter((a) => a.hasAttribute("target"))
}

beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] })
    vi.setSystemTime(new Date(YEAR, 4, 1))
})

afterEach(() => {
    vi.useRealTimers()
})

describe("Footer page links", () => {
    it("links the NAV_ITEMS pages in order, in the same tab", () => {
        const links = internalLinks(renderFooter())
        expect(links.map((a) => [a.getAttribute("href"), a.textContent])).toEqual(
            NAV_ITEMS.map((item) => [item.href, item.label])
        )
    })

    it("shows the five Japanese labels", () => {
        expect(internalLinks(renderFooter()).map((a) => a.textContent)).toEqual([
            "ホーム",
            "プロフィール",
            "スキル",
            "ポートフォリオ",
            "連絡先",
        ])
    })

    it.each(["books", "blog"])("has no link to %s by href or by label", (name) => {
        for (const a of Array.from(renderFooter().querySelectorAll("a"))) {
            const href = a.getAttribute("href") ?? ""
            expect(href.replace(/\/+$/, "").toLowerCase(), href).not.toBe(`/${name}`)
            expect((a.textContent ?? "").trim().toLowerCase(), href).not.toBe(name)
        }
    })
})

describe("Footer external links", () => {
    it("opens every SOCIAL_LINKS url in a new tab, labelled with its name", () => {
        const links = externalLinks(renderFooter())
        expect(links.map((a) => a.getAttribute("href"))).toEqual(
            SOCIAL_LINKS.map((link) => link.url)
        )
        links.forEach((a, i) => {
            const name = SOCIAL_LINKS[i].name
            expect(a.getAttribute("target"), name).toBe("_blank")
            expect(a.getAttribute("rel"), name).toBe("noopener noreferrer")
            expect(a.textContent?.startsWith(name), name).toBe(true)
        })
    })
})

describe("Footer contents", () => {
    it("shows the copyright with the current year and the site name", () => {
        expect(renderFooter().textContent).toContain(`© ${YEAR} ${SITE_NAME}`)
    })

    it("carries only the copyright besides the links", () => {
        // Nothing beyond ©, the page list and the external links (no tagline, no headings).
        const footer = renderFooter()
        for (const a of Array.from(footer.querySelectorAll("a"))) a.remove()
        expect(footer.textContent?.replace(/\s+/g, " ").trim()).toBe(`© ${YEAR} ${SITE_NAME}`)
        expect(footer.querySelectorAll("a, h1, h2, h3, h4, h5, h6")).toHaveLength(0)
    })
})
