// @vitest-environment jsdom
import fs from "node:fs"
import path from "node:path"
import * as React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest"

import { elementWithText, precedes } from "@/components/ds/__tests__/render"
import type { Entry } from "@/lib/building/entries"
import { FLOORS, findFloor, findGroup, type FloorId, type GroupSlug } from "@/lib/building/floors"
import { layoutFloor } from "@/lib/building/layout"
import { categoryOrder } from "@/lib/skills-meta"

vi.hoisted(() => {
    // SITE_URL is evaluated when @/lib/seo is imported, so pin the default origin first.
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", undefined)
})

const mocks = vi.hoisted(() => ({ getEntries: vi.fn() }))
vi.mock("@/lib/building/entries", () => ({ getEntries: mocks.getEntries }))

// next/link -> plain anchor so href assertions work under a static render.
vi.mock("next/link", () => ({
    default: ({ children, ...props }: React.ComponentProps<"a">) => <a {...props}>{children}</a>,
}))

import TopPage, * as pageModule from "@/app/page"

/**
 * Home contract tests (/).
 *
 * From the top: the h1 "onclimb 山荘", then the small primary Contact door with
 * one sentence beside it, then the info center (the floor guide and the map of
 * all five floors). The floor layouts are built on the server from getEntries().
 * Nothing else is shown: no prose under the heading, no `$ command` line, no
 * other links. Without JavaScript the HTML already holds the 1F map with its
 * room names.
 */

const ORIGIN_ROOT = "https://onc-limb.com/"
const DESCRIPTION =
    "ソフトウェアアーキテクトの視点で、設計から実装・運用まで担うフルスタックエンジニア onclimb のポートフォリオ。"
const TITLE = "onclimb 山荘"
const CONTACT_NOTE = "お仕事のご相談、技術的なご相談・壁打ちを受け付けています"
const GUIDE = '[role="group"][aria-label="階"]'

function entry(floor: FloorId, group: GroupSlug | null, room: string | null, index: number): Entry {
    return {
        path: `~/${floor}/${group ?? "rooftop"}/${room ?? "link"}/${index}.md`,
        floor,
        group,
        room,
        title: `${room ?? "link"} ${index}`,
        excerpt: "",
        href: `/${floor}`,
        tags: [],
    }
}

const ENTRIES: Entry[] = [
    entry("b1", "studies", categoryOrder[1], 0),
    entry("1f", "profile", "profile", 0),
    entry("1f", "profile", "profile", 1),
    entry("1f", "contact", "contact", 0),
    entry("2f", "histories", "histories", 0),
    entry("2f", "skills", categoryOrder[0], 0),
    entry("3f", "portfolios", "portfolios", 0),
    { ...entry("rf", null, null, 0), title: "GitHub" },
]

async function renderMain(): Promise<HTMLElement> {
    const html = renderToStaticMarkup(await TopPage())
    const doc = new DOMParser().parseFromString(html, "text/html")
    const main = doc.querySelector("main")
    expect(main).not.toBeNull()
    return main as HTMLElement
}

function contactLink(main: HTMLElement): HTMLAnchorElement {
    const links = Array.from(main.querySelectorAll("a")).filter((a) => a.textContent === "Contact")
    expect(links).toHaveLength(1)
    return links[0]
}

function currentNormalMap(main: HTMLElement): HTMLElement {
    const maps = Array.from(main.querySelectorAll<HTMLElement>('[data-floor-layer][data-current="true"]'))
        .map((layer) => layer.querySelector<HTMLElement>('[data-floor][data-size="normal"]'))
        .filter((map): map is HTMLElement => map !== null)
    expect(maps, "one current normal-size map").toHaveLength(1)
    return maps[0]
}

beforeEach(() => {
    mocks.getEntries.mockReset()
    mocks.getEntries.mockResolvedValue(ENTRIES)
})

afterAll(() => {
    vi.unstubAllEnvs()
})

describe("home heading", () => {
    it("has exactly one h1 reading the lodge name", async () => {
        const main = await renderMain()
        const headings = main.querySelectorAll("h1")

        expect(headings).toHaveLength(1)
        expect(headings[0].textContent).toBe(TITLE)
    })
})

describe("home Contact door", () => {
    it("is a small primary door linking to the contact group's href", async () => {
        const main = await renderMain()
        const link = contactLink(main)

        expect(link.getAttribute("href")).toBe(findGroup("contact").href)
        expect(link.getAttribute("data-primary")).toBe("true")
    })

    it("has the contact sentence beside it, in the same parent element", async () => {
        const main = await renderMain()
        const link = contactLink(main)
        const note = elementWithText(main, CONTACT_NOTE)

        expect(note).toBeDefined()
        expect(note?.parentElement).toBe(link.parentElement)
    })
})

describe("home info center", () => {
    it("builds the floor layouts on the server from the entries", async () => {
        await renderMain()

        expect(mocks.getEntries).toHaveBeenCalled()
    })

    it("has replaced the per-floor links with the floor guide and the map of every floor", async () => {
        const main = await renderMain()
        const floorUrls = FLOORS.map((floor) => floor.url)

        expect(main.querySelector(GUIDE), "floor guide").not.toBeNull()
        expect(main.querySelectorAll("[data-floor-layer]").length).toBeGreaterThan(0)
        expect(
            Array.from(main.querySelectorAll("a")).filter((a) => floorUrls.includes(a.getAttribute("href") ?? ""))
        ).toEqual([])
    })

    it("has no links other than Contact", async () => {
        const main = await renderMain()

        expect(main.querySelectorAll("a")).toHaveLength(1)
    })

    it("starts on 1F without JavaScript, with the 1F room names in the HTML", async () => {
        const main = await renderMain()
        const map = currentNormalMap(main)
        const expected = layoutFloor(
            findFloor("1f"),
            ENTRIES.filter((e) => e.floor === "1f")
        ).rooms.map((room) => room.name)

        expect(main.querySelector(`${GUIDE} button[data-floor="1f"]`)?.getAttribute("aria-pressed")).toBe("true")
        expect(map.getAttribute("data-floor")).toBe("1f")
        expect(Array.from(map.querySelectorAll('[data-part="label"]')).map((el) => el.textContent)).toEqual(expected)
    })

    it("does not reorder the shared FLOORS definition", async () => {
        await renderMain()

        expect(FLOORS.map((floor) => floor.url)).toEqual(["/b1", "/1f", "/2f", "/3f", "/rf"])
    })
})

describe("home order and content", () => {
    it("puts Contact and its sentence first right under the h1", async () => {
        const main = await renderMain()
        const heading = main.querySelector("h1") as HTMLElement
        const first = heading.nextElementSibling?.firstElementChild

        expect(first, "first element under the heading").not.toBeNull()
        expect(first!.contains(contactLink(main))).toBe(true)
        expect(first!.contains(elementWithText(main, CONTACT_NOTE) ?? null)).toBe(true)
    })

    it("places the h1, Contact, the floor guide and the map in that order", async () => {
        const main = await renderMain()
        const heading = main.querySelector("h1") as HTMLElement
        const link = contactLink(main)
        const guide = main.querySelector(GUIDE) as HTMLElement
        const layer = main.querySelector("[data-floor-layer]") as HTMLElement

        expect(precedes(heading, link)).toBe(true)
        expect(precedes(link, guide)).toBe(true)
        expect(precedes(guide, layer)).toBe(true)
    })

    it("shows no text besides the title, Contact and its sentence outside the guide and the maps", async () => {
        const main = await renderMain()
        main.querySelectorAll(`script, ${GUIDE}, [data-floor][data-size]`).forEach((el) => el.remove())

        expect(main.textContent).toBe([TITLE, "Contact", CONTACT_NOTE].join(""))
    })

    it("shows no `$ command` line", async () => {
        const main = await renderMain()
        const lines = Array.from(main.querySelectorAll("*")).map((el) => el.textContent ?? "")

        expect(lines.some((text) => text.trimStart().startsWith("$ "))).toBe(false)
    })
})

describe("home source", () => {
    it("imports neither lib/stats nor components/animations", () => {
        const source = fs.readFileSync(path.resolve(__dirname, "page.tsx"), "utf-8")

        expect(source).not.toContain("@/lib/stats")
        expect(source).not.toContain("@/components/animations")
    })

    it("is no longer forced to render dynamically", () => {
        expect("dynamic" in pageModule).toBe(false)
    })

    it("has removed the stats module and its test", () => {
        const root = path.resolve(__dirname, "..")

        expect(fs.existsSync(path.join(root, "lib/stats.ts"))).toBe(false)
        expect(fs.existsSync(path.join(root, "lib/__tests__/stats.test.ts"))).toBe(false)
    })

    it("has removed the unused home view model and its test", () => {
        expect(fs.existsSync(path.resolve(__dirname, "home-view-model.ts"))).toBe(false)
        expect(fs.existsSync(path.resolve(__dirname, "home-view-model.test.ts"))).toBe(false)
    })
})

describe("home metadata and structured data", () => {
    it("exports metadata for the root path", () => {
        const { metadata } = pageModule

        expect(metadata.title).toBe("Home")
        expect(metadata.description).toBe(DESCRIPTION)
        expect(metadata.alternates?.canonical).toBe(ORIGIN_ROOT)
        expect(metadata.openGraph).toMatchObject({
            title: "Home | onclimb",
            description: DESCRIPTION,
            url: ORIGIN_ROOT,
        })
    })

    it("embeds WebSite JSON-LD", async () => {
        const main = await renderMain()
        const scripts = main.querySelectorAll('script[type="application/ld+json"]')

        expect(scripts).toHaveLength(1)
        expect(JSON.parse(scripts[0].textContent ?? "")).toEqual({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "onclimb",
            url: ORIGIN_ROOT,
            description: DESCRIPTION,
            inLanguage: "ja-JP",
        })
    })
})
