// @vitest-environment jsdom
import * as React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { ThemeProvider } from "@/components/theme"
import { SITE_NAME } from "@/lib/seo"
import { render } from "../../ds/__tests__/render"
import Header from "../Header"

const navigation = vi.hoisted(() => ({ usePathname: vi.fn<() => string | null>() }))
vi.mock("next/navigation", () => ({ usePathname: navigation.usePathname }))

// next/link -> plain anchor so href / text assertions work under a static render.
vi.mock("next/link", () => ({
    default: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}))

function renderHeaderAt(pathname: string): HTMLElement {
    navigation.usePathname.mockReturnValue(pathname)
    const headers = render(
        <ThemeProvider>
            <Header />
        </ThemeProvider>
    ).querySelectorAll("header")
    expect(headers).toHaveLength(1)
    return headers[0]
}

function promptTexts(header: HTMLElement): string[] {
    return Array.from(header.querySelectorAll('a[href="/"]'))
        .map((a) => a.textContent ?? "")
        .filter((text) => text.startsWith("guest@"))
}

beforeEach(() => {
    navigation.usePathname.mockReset()
})

describe("Header prompt", () => {
    it.each([
        ["/", `guest@${SITE_NAME}:~$`],
        ["/2f/skills", `guest@${SITE_NAME}:~/2f/skills$`],
        ["/3f/portfolios", `guest@${SITE_NAME}:~/3f/portfolios$`],
        ["/3f/portfolios/climbinsight", `guest@${SITE_NAME}:~/3f/portfolios/climbinsight$`],
        ["/portfolio", `guest@${SITE_NAME}:~/portfolio$`],
    ])("shows the prompt of the current page %s as a home link", (pathname, expected) => {
        expect(promptTexts(renderHeaderAt(pathname))).toEqual([expected])
    })

    it("marks 3F for a portfolio detail page in the desktop navigation", () => {
        const header = renderHeaderAt("/3f/portfolios/climbinsight")
        const current = Array.from(header.querySelectorAll('nav a[aria-current="page"]'))
        expect(current.map((a) => [a.getAttribute("href"), a.textContent])).toEqual([["/3f", "3F 作品・考え"]])
    })
})

describe("Header surface", () => {
    it("uses the opaque ds background with a bottom rule", () => {
        const classes = Array.from(renderHeaderAt("/").classList)
        expect(classes).toEqual(expect.arrayContaining(["bg-ds-bg", "border-b", "border-ds-border"]))
    })

    it("does not blur or use a translucent background", () => {
        const classes = Array.from(renderHeaderAt("/").classList)
        expect(classes).not.toContain("site-header")
        expect(classes.filter((c) => /backdrop/.test(c))).toEqual([])
        // Tailwind opacity modifiers such as bg-ds-bg/80 make the surface translucent.
        expect(classes.filter((c) => /^bg-.*\/\d+$/.test(c))).toEqual([])
    })
})

describe("Header controls", () => {
    it("renders the theme toggle and the mobile menu door", () => {
        const header = renderHeaderAt("/")
        const texts = Array.from(header.querySelectorAll("button")).map((b) => b.textContent ?? "")
        // The static render uses the server snapshot (DEFAULT_THEME = dark).
        expect(texts.some((t) => t.includes("表示: ダーク")), "theme toggle").toBe(true)
        expect(texts, "menu door").toContain("メニュー")
    })
})
