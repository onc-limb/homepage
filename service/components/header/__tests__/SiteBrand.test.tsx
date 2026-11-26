// @vitest-environment jsdom
import * as React from "react"
import { describe, expect, it, vi } from "vitest"

import { SITE_NAME } from "@/lib/seo"
import { closestClass, elementWithText, render } from "../../ds/__tests__/render"
import { SiteBrand } from "../SiteBrand"

// next/link -> plain anchor so href / text assertions work under a static render.
vi.mock("next/link", () => ({
    default: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}))

/** ds color utilities (text-ds-sm/base/lg/xl are font sizes, not colors). */
const TEXT_COLOR = /^text-ds-(?!(sm|base|lg|xl)$)/
const USER_HOST = `guest@${SITE_NAME}`

function promptLink(pathname: string): HTMLAnchorElement {
    const anchors = render(<SiteBrand pathname={pathname} />).querySelectorAll("a")
    expect(anchors).toHaveLength(1)
    return anchors[0]
}

describe("SiteBrand prompt", () => {
    it("shows a transitional URL as the virtual path of its floor: `guest@onclimb:~/3f/portfolios$`", () => {
        expect(promptLink("/portfolio").textContent).toBe("guest@onclimb:~/3f/portfolios$")
    })

    it.each([
        ["/", `${USER_HOST}:~$`],
        ["/2f/skills", `${USER_HOST}:~/2f/skills$`],
        ["/b1/studies", `${USER_HOST}:~/b1/studies$`],
        ["/skills", `${USER_HOST}:~/skills$`],
        ["/2f", `${USER_HOST}:~/2f$`],
        ["/portfolio/onc-limb", `${USER_HOST}:~/3f/portfolios/onc-limb$`],
        ["/books", `${USER_HOST}:~/books$`],
    ])("renders the prompt for %s", (pathname, expected) => {
        expect(promptLink(pathname).textContent).toBe(expected)
    })

    it("links the prompt to the home page", () => {
        for (const pathname of ["/", "/2f/skills", "/portfolio/onc-limb"]) {
            expect(promptLink(pathname).getAttribute("href"), pathname).toBe("/")
        }
    })

    it("colors guest@onclimb with the prompt color and the path with the link color", () => {
        const a = promptLink("/2f/skills")
        const user = elementWithText(a, USER_HOST)
        const path = elementWithText(a, "~/2f/skills")
        expect(user, "element with guest@onclimb").toBeDefined()
        expect(path, "element with ~/2f/skills").toBeDefined()
        expect(closestClass(user!, TEXT_COLOR, a.parentElement!)).toBe("text-ds-prompt")
        expect(closestClass(path!, TEXT_COLOR, a.parentElement!)).toBe("text-ds-link")
    })

    it("does not render a gradient", () => {
        const html = promptLink("/profile").outerHTML
        expect(html).not.toMatch(/gradient/i)
    })
})
