// @vitest-environment jsdom
import fs from "node:fs"
import path from "node:path"
import * as React from "react"
import type { Metadata } from "next"
import type { ReactElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { guidePcs, precedes, withoutGuidePcAndMaps } from "@/components/ds/__tests__/render"
import type { Entry } from "@/lib/building/entries"
import { findFloor, type FloorGroup, type FloorId, type GroupSlug } from "@/lib/building/floors"
import { SOCIAL_LINKS } from "@/lib/constants"
import { categoryOrder } from "@/lib/skills-meta"

/**
 * Floor page contract tests (/b1 /1f /2f /3f).
 *
 * Each floor page shows only the heading "<label> <name>" and, right below it,
 * one large door per group of the floor. The nameplate shows the group name and
 * the number of entries of that group ("N 件"), or the group's note for a
 * single-page group. The door links to the group's href and shows that href below.
 *
 * renewal 20 (order.md やること 4, Issue #345): below the doors, the map of that floor
 * and the guide PC. The rules above are kept for what lies outside the map and the PC.
 * The guide starts with the floor introduction and has no 「（階の番号） のページへ」.
 */

const mocks = vi.hoisted(() => ({ getEntries: vi.fn() }))
vi.mock("@/lib/building/entries", () => ({ getEntries: mocks.getEntries }))

// next/link -> plain anchor so href assertions work under a static render.
vi.mock("next/link", () => ({
    default: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}))

// The floor view moves to another floor page with the router; a static render has no app router.
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }) }))

import B1Page, * as b1Module from "@/app/b1/page"
import Floor1Page, * as f1Module from "@/app/1f/page"
import Floor2Page, * as f2Module from "@/app/2f/page"
import Floor3Page, * as f3Module from "@/app/3f/page"

type PageModule = {
    default: () => ReactElement | Promise<ReactElement>
    metadata?: Metadata
    generateMetadata?: () => Metadata | Promise<Metadata>
}

const PAGES: Array<{ id: Exclude<FloorId, "rf">; module: PageModule; file: string }> = [
    { id: "b1", module: { ...b1Module, default: B1Page }, file: "b1/page.tsx" },
    { id: "1f", module: { ...f1Module, default: Floor1Page }, file: "1f/page.tsx" },
    { id: "2f", module: { ...f2Module, default: Floor2Page }, file: "2f/page.tsx" },
    { id: "3f", module: { ...f3Module, default: Floor3Page }, file: "3f/page.tsx" },
]

/** Entry counts per group. Every group differs, and so do the floor totals. */
const COUNTS: Record<GroupSlug, number> = {
    studies: 4,
    profile: 3,
    contact: 1,
    histories: 2,
    skills: 7,
    portfolios: 5,
}

// Skills and studies papers sit in a category room (as getEntries makes them); the others in the group's room.
const roomOf = (group: GroupSlug, index: number): string =>
    group === "skills" || group === "studies" ? categoryOrder[index % 3] : group

function entry(floor: FloorId, group: GroupSlug, index: number): Entry {
    return {
        path: `~/${floor}/${group}/${roomOf(group, index)}/${index}.md`,
        floor,
        group,
        room: roomOf(group, index),
        title: `${group} ${index}`,
        excerpt: "",
        href: `/${floor}/${group}`,
        tags: [],
    }
}

const rooftopEntry = (index: number): Entry => ({
    path: `~/rf/link-${index}.url`,
    floor: "rf",
    group: null,
    room: null,
    title: SOCIAL_LINKS[index].name,
    excerpt: SOCIAL_LINKS[index].username,
    href: SOCIAL_LINKS[index].url,
    tags: [],
})

const ENTRIES: Entry[] = [
    ...(Object.entries(COUNTS) as Array<[GroupSlug, number]>).flatMap(([slug, count]) =>
        Array.from({ length: count }, (_, i) => entry(slugFloor(slug), slug, i)),
    ),
    rooftopEntry(0),
    rooftopEntry(1),
]

function slugFloor(slug: GroupSlug): FloorId {
    for (const id of ["b1", "1f", "2f", "3f"] as const) {
        if (findFloor(id).groups.some((g) => g.slug === slug)) return id
    }
    throw new Error(`no floor for ${slug}`)
}

/** What the nameplate's second line must read. */
function plateOf(group: FloorGroup): string {
    return group.note ?? `${COUNTS[group.slug]} 件`
}

async function renderPage(page: PageModule): Promise<HTMLElement> {
    const html = renderToStaticMarkup(await page.default())
    const doc = new DOMParser().parseFromString(html, "text/html")
    const mains = doc.querySelectorAll("main")
    expect(mains).toHaveLength(1)
    return mains[0] as HTMLElement
}

async function metadataOf(page: PageModule): Promise<Metadata> {
    if (page.metadata) return page.metadata
    if (page.generateMetadata) return await page.generateMetadata()
    throw new Error("page exports neither metadata nor generateMetadata")
}

/** The large doors: links that carry the large door frame. */
function doorsOf(main: HTMLElement): HTMLAnchorElement[] {
    return Array.from(main.querySelectorAll("a")).filter((a) => a.querySelector(".border-ds-door-lg") !== null)
}

beforeEach(() => {
    mocks.getEntries.mockReset()
    mocks.getEntries.mockResolvedValue(ENTRIES)
})

describe.each(PAGES)("floor page /$id", ({ id, module, file }) => {
    const floor = findFloor(id)
    const title = `${floor.label} ${floor.name}`

    it("shows the heading with only the floor label and name", async () => {
        const main = await renderPage(module)
        const headings = main.querySelectorAll("h1")
        expect(headings).toHaveLength(1)
        expect(headings[0].textContent).toBe(title)
    })

    it("has no description and no command line under the heading, outside the map and the guide PC", async () => {
        const main = withoutGuidePcAndMaps(await renderPage(module))
        expect(main.querySelectorAll("p"), "no paragraph").toHaveLength(0)
        expect(main.textContent).not.toContain("$ ")
        // Nothing but the heading and the doors is written outside the map and the PC (no legend either).
        const doors = doorsOf(main)
        expect(main.textContent).toBe(title + doors.map((door) => door.textContent).join(""))
    })

    it("shows the map of this floor and the guide PC below the doors", async () => {
        const main = await renderPage(module)
        const maps = Array.from(main.querySelectorAll<HTMLElement>("[data-floor][data-material]"))
        expect(maps.map((map) => map.getAttribute("data-floor")), "one map, of this floor").toEqual([id])
        expect(maps[0].querySelectorAll("button").length, "rooms can be chosen").toBeGreaterThan(0)
        const pcs = guidePcs(main)
        expect(pcs, "one guide PC").toHaveLength(1)

        const heading = main.querySelector("h1")!
        const doors = doorsOf(main)
        expect(precedes(heading, doors[0]), "heading, then the doors").toBe(true)
        expect(precedes(doors[doors.length - 1], maps[0]), "the doors, then the map").toBe(true)
        expect(precedes(maps[0], pcs[0]), "the map, then the PC").toBe(true)
    })

    it("starts the guide with the floor introduction and without a link to its own floor page", async () => {
        const pc = guidePcs(await renderPage(module))[0]
        expect(pc.textContent).toContain(
            `ここは ${floor.label}「${floor.name}」です。${floor.description}部屋を押すと、中身をお見せします。`
        )
        expect(pc.textContent).not.toContain("のページへ")
        expect(Array.from(pc.querySelectorAll("a")).map((a) => a.textContent), "only Contact links").toEqual(["Contact"])
        expect(pc.textContent).toContain("この階の部屋")
    })

    it("shows one door per group with the name, the count or note, and the href below", async () => {
        const main = await renderPage(module)
        const doors = doorsOf(main)

        expect(doors).toHaveLength(floor.groups.length)
        expect(withoutGuidePcAndMaps(main).querySelectorAll("a"), "no other link outside the PC").toHaveLength(
            floor.groups.length
        )
        doors.forEach((door, i) => {
            const group = floor.groups[i]
            expect(door.getAttribute("href"), group.slug).toBe(group.href)
            expect(door.textContent, group.slug).toBe(group.name + plateOf(group) + group.href)
        })
        expect(mocks.getEntries).toHaveBeenCalled()
    })

    it("exports a title and a description", async () => {
        const metadata = await metadataOf(module)
        expect(metadata.title).toBe(title)
        expect(typeof metadata.description).toBe("string")
        expect((metadata.description as string).length).toBeGreaterThan(0)
        expect(String(metadata.alternates?.canonical)).toMatch(new RegExp(`${floor.url}$`))
    })

    it("only hands its floor id to the shared floor page component", () => {
        // The drawing lives in one shared component; the page does not draw doors or count entries itself.
        const source = fs.readFileSync(path.resolve(__dirname, file), "utf-8")
        expect(source).toContain(`"${id}"`)
        expect(source).not.toMatch(/DoorButton|getEntries|@\/components\/ds\//)
    })
})

describe("floor page values", () => {
    it("shows the counts of each group on 2F, not the floor total", async () => {
        const main = await renderPage(PAGES[2].module)
        expect(doorsOf(main).map((door) => door.textContent)).toEqual([
            `経歴${COUNTS.histories} 件/2f/histories`,
            `スキル${COUNTS.skills} 件/2f/skills`,
        ])
    })

    it("shows the notes instead of a count on 1F", async () => {
        const main = await renderPage(PAGES[1].module)
        const doors = doorsOf(main)
        expect(doors.map((door) => door.textContent)).toEqual([
            "プロフィール自己紹介・関心・資格/1f/profile",
            "連絡先フォーム・メール/1f/contact",
        ])
        for (const door of doors) expect(door.textContent).not.toContain("件")
    })

    it("counts only the studies on B1 and links the door to /b1/studies", async () => {
        const main = await renderPage(PAGES[0].module)
        expect(doorsOf(main).map((door) => door.textContent)).toEqual([`自己学習${COUNTS.studies} 件/b1/studies`])
    })
})
