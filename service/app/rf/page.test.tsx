// @vitest-environment jsdom
import * as React from "react"
import type { Metadata } from "next"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { findFloor } from "@/lib/building/floors"
import { SOCIAL_LINKS } from "@/lib/constants"

/**
 * Rooftop page contract tests (/rf).
 *
 * The rooftop shows the same heading as the other floors and, right below it,
 * one large door per SOCIAL_LINKS entry. The nameplate shows the site name and
 * its note; the door opens the external URL in a new tab and reads
 * 「外のサイトへ ↗」 below instead of the URL.
 */

// next/link -> plain anchor; external doors must not go through it.
vi.mock("next/link", () => ({
    default: ({ children, ...props }: any) => (
        <a data-next-link="" {...props}>
            {children}
        </a>
    ),
}))

import * as rooftopModule from "@/app/rf/page"
import RooftopPage from "@/app/rf/page"

const floor = findFloor("rf")
const TITLE = `${floor.label} ${floor.name}`

async function renderRooftop(): Promise<HTMLElement> {
    const html = renderToStaticMarkup(await RooftopPage())
    const doc = new DOMParser().parseFromString(html, "text/html")
    const mains = doc.querySelectorAll("main")
    expect(mains).toHaveLength(1)
    return mains[0] as HTMLElement
}

function doorsOf(main: HTMLElement): HTMLAnchorElement[] {
    return Array.from(main.querySelectorAll("a")).filter((a) => a.querySelector(".border-ds-door-lg") !== null)
}

describe("rooftop page /rf", () => {
    it("shows the heading with only the floor label and name, and no description", async () => {
        const main = await renderRooftop()
        const headings = main.querySelectorAll("h1")
        expect(headings).toHaveLength(1)
        expect(headings[0].textContent).toBe(TITLE)
        expect(main.querySelectorAll("p"), "no paragraph").toHaveLength(0)
        expect(main.textContent).not.toContain("$ ")
        expect(main.textContent).toBe(TITLE + doorsOf(main).map((door) => door.textContent).join(""))
    })

    it("shows three doors, one per SOCIAL_LINKS entry, linking to the external URLs", async () => {
        const main = await renderRooftop()
        const doors = doorsOf(main)

        expect(doors).toHaveLength(3)
        expect(main.querySelectorAll("a"), "no other link").toHaveLength(3)
        expect(doors.map((door) => door.getAttribute("href"))).toEqual(SOCIAL_LINKS.map((link) => link.url))
        for (const door of doors) {
            const href = door.getAttribute("href") ?? ""
            expect(href.startsWith("https://"), href).toBe(true)
            expect(door.getAttribute("target"), href).toBe("_blank")
            expect(door.getAttribute("rel"), href).toBe("noopener noreferrer")
            expect(door.hasAttribute("data-next-link"), href).toBe(false)
        }
    })

    it("puts the site name and its note on the plate and 「外のサイトへ ↗」 below each door", async () => {
        const doors = doorsOf(await renderRooftop())
        doors.forEach((door, i) => {
            const link = SOCIAL_LINKS[i]
            expect(door.textContent, link.name).toBe(`${link.name}${link.note}外のサイトへ ↗`)
            expect(door.textContent, link.name).not.toContain(link.url)
        })
        expect(doors.map((door) => door.textContent)).toEqual([
            expect.stringContaining("ソースコード"),
            expect.stringContaining("技術記事"),
            expect.stringContaining("近況"),
        ])
    })

    it("exports a title and a description", async () => {
        const page = rooftopModule as { metadata?: Metadata; generateMetadata?: () => Metadata | Promise<Metadata> }
        const metadata = page.metadata ?? (await page.generateMetadata?.())
        expect(metadata?.title).toBe(TITLE)
        expect(typeof metadata?.description).toBe("string")
        expect((metadata?.description as string).length).toBeGreaterThan(0)
        expect(String(metadata?.alternates?.canonical)).toMatch(/\/rf$/)
    })
})
