// @vitest-environment jsdom
import * as React from "react"
import { describe, expect, it, vi } from "vitest"

import { TextLink } from "../TextLink"
import { render } from "./render"

// next/link -> anchor carrying a marker, so internal links can be told apart from plain <a>.
vi.mock("next/link", () => ({
    default: ({ children, ...props }: any) => (
        <a data-next-link="" {...props}>
            {children}
        </a>
    ),
}))

function anchorOf(root: HTMLElement): HTMLAnchorElement {
    const anchors = root.querySelectorAll("a")
    expect(anchors).toHaveLength(1)
    return anchors[0]
}

describe("TextLink", () => {
    it.each(["/3f/portfolios", "#top", "/go?to=https://example.com"])(
        "renders the internal href %s through next/link in the same tab",
        (href) => {
            const a = anchorOf(render(<TextLink href={href}>スキル</TextLink>))
            expect(a.hasAttribute("data-next-link"), "next/link").toBe(true)
            expect(a.getAttribute("href")).toBe(href)
            expect(a.hasAttribute("target"), "target").toBe(false)
            expect(a.textContent).toBe("スキル")
            expect(a.textContent).not.toContain("↗")
        }
    )

    it.each(["https://github.com/onc-limb", "http://example.com/a", "//example.com"])(
        "opens the external href %s in a new tab with the ↗ mark",
        (href) => {
            const a = anchorOf(render(<TextLink href={href}>GitHub</TextLink>))
            expect(a.hasAttribute("data-next-link"), "next/link").toBe(false)
            expect(a.getAttribute("href")).toBe(href)
            expect(a.getAttribute("target")).toBe("_blank")
            expect(a.getAttribute("rel")).toBe("noopener noreferrer")
            expect(a.textContent?.startsWith("GitHub")).toBe(true)
            expect(a.textContent?.trimEnd().endsWith("↗")).toBe(true)
        }
    )

    it("shows a focus outline for keyboard users", () => {
        for (const href of ["/3f/portfolios", "https://github.com/onc-limb"]) {
            const a = anchorOf(render(<TextLink href={href}>link</TextLink>))
            const focus = Array.from(a.classList).filter((c) => c.startsWith("focus-visible:outline"))
            expect(focus.length, href).toBeGreaterThan(0)
        }
    })
})
