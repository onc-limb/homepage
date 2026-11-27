// @vitest-environment jsdom
import * as React from "react"
import type { Metadata } from "next"
import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { guidePcs, precedes, withoutGuidePcAndMaps } from "@/components/ds/__tests__/render"
import type { Entry } from "@/lib/building/entries"
import { findFloor } from "@/lib/building/floors"
import { layoutFloor } from "@/lib/building/layout"
import { SOCIAL_LINKS } from "@/lib/constants"

/**
 * Rooftop page contract tests (/rf).
 *
 * The rooftop shows the same heading as the other floors and, right below it,
 * one large door per SOCIAL_LINKS entry. The nameplate shows the site name and
 * its note; the door opens the external URL in a new tab and reads
 * 「外のサイトへ ↗」 below instead of the URL.
 *
 * renewal 20 (order.md やること 4, Issue #345): below the doors, the rooftop map and
 * the guide PC, built on the server from getEntries(). The rules above are kept for
 * what lies outside the map and the PC.
 */

const mocks = vi.hoisted(() => ({ getEntries: vi.fn() }))
vi.mock("@/lib/building/entries", () => ({ getEntries: mocks.getEntries }))

// The floor view moves to another floor page with the router; a static render has no app router.
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }) }))

// The rooftop papers as getEntries makes them from SOCIAL_LINKS, plus a paper on another floor for the searches
const ENTRIES: Entry[] = [
    ...SOCIAL_LINKS.map((link, i) => ({
        path: `~/rf/link-${i}.url`,
        floor: "rf" as const,
        group: null,
        room: null,
        title: link.name,
        excerpt: link.username,
        href: link.url,
        tags: [],
    })),
    {
        path: "~/3f/portfolios/sample.md",
        floor: "3f",
        group: "portfolios",
        room: "portfolios",
        title: "Sample",
        excerpt: "",
        href: "/3f/portfolios/sample",
        tags: [],
    },
]

beforeEach(() => {
    mocks.getEntries.mockReset()
    mocks.getEntries.mockResolvedValue(ENTRIES)
})

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
        const outside = withoutGuidePcAndMaps(main)
        expect(outside.querySelectorAll("p"), "no paragraph").toHaveLength(0)
        expect(outside.textContent).not.toContain("$ ")
        expect(outside.textContent).toBe(TITLE + doorsOf(main).map((door) => door.textContent).join(""))
    })

    it("shows the rooftop map and the guide PC below the doors", async () => {
        const main = await renderRooftop()
        const maps = Array.from(main.querySelectorAll<HTMLElement>("[data-floor][data-material]"))
        expect(maps.map((map) => map.getAttribute("data-floor")), "one map, of the rooftop").toEqual(["rf"])
        const expectedRooms = layoutFloor(floor, ENTRIES.filter((entry) => entry.floor === "rf")).rooms
        expect(maps[0].querySelectorAll("button"), "one button per rooftop room").toHaveLength(expectedRooms.length)
        const pcs = guidePcs(main)
        expect(pcs, "one guide PC").toHaveLength(1)
        const doors = doorsOf(main)
        expect(precedes(doors[doors.length - 1], maps[0]), "the doors, then the map").toBe(true)
        expect(precedes(maps[0], pcs[0]), "the map, then the PC").toBe(true)
        expect(mocks.getEntries).toHaveBeenCalled()
    })

    it("starts the guide with the rooftop introduction and without a link to its own page", async () => {
        const pc = guidePcs(await renderRooftop())[0]
        expect(pc.textContent).toContain(
            `ここは ${floor.label}「${floor.name}」です。${floor.description}部屋を押すと、中身をお見せします。`
        )
        expect(pc.textContent).not.toContain("のページへ")
    })

    it("shows three doors, one per SOCIAL_LINKS entry, linking to the external URLs", async () => {
        const main = await renderRooftop()
        const doors = doorsOf(main)

        expect(doors).toHaveLength(3)
        expect(withoutGuidePcAndMaps(main).querySelectorAll("a"), "no other link outside the PC").toHaveLength(3)
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
