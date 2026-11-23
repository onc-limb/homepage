// @vitest-environment jsdom
import fs from "node:fs"
import path from "node:path"
import * as React from "react"
import type { Metadata } from "next"
import type { ReactElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, describe, expect, it, vi } from "vitest"

import type { Entry } from "@/lib/building/entries"
import { findFloor, type FloorGroup, type FloorId, type GroupSlug } from "@/lib/building/floors"

/**
 * Floor page contract tests (/b1 /1f /2f /3f).
 *
 * Each floor page shows only the heading "<label> <name>" and, right below it,
 * one large door per group of the floor. The nameplate shows the group name and
 * the number of entries of that group ("N 件"), or the group's note for a
 * single-page group. The door links to the group's href and shows that href below.
 */

const mocks = vi.hoisted(() => ({ getEntries: vi.fn() }))
vi.mock("@/lib/building/entries", () => ({ getEntries: mocks.getEntries }))

// next/link -> plain anchor so href assertions work under a static render.
vi.mock("next/link", () => ({
    default: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}))

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

function entry(floor: FloorId, group: GroupSlug | null, index: number): Entry {
    return {
        path: `~/${floor}/${group ?? "rooftop"}/${index}.md`,
        floor,
        group,
        room: group,
        title: `${group ?? "rooftop"} ${index}`,
        excerpt: "",
        href: `/${floor}/${group ?? "rooftop"}`,
        tags: [],
    }
}

const ENTRIES: Entry[] = [
    ...(Object.entries(COUNTS) as Array<[GroupSlug, number]>).flatMap(([slug, count]) =>
        Array.from({ length: count }, (_, i) => entry(slugFloor(slug), slug, i)),
    ),
    entry("rf", null, 0),
    entry("rf", null, 1),
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

    it("has no description and no command line under the heading", async () => {
        const main = await renderPage(module)
        expect(main.querySelectorAll("p"), "no paragraph").toHaveLength(0)
        expect(main.textContent).not.toContain("$ ")
        // Nothing but the heading and the doors is written on the page.
        const doors = doorsOf(main)
        expect(main.textContent).toBe(title + doors.map((door) => door.textContent).join(""))
    })

    it("shows one door per group with the name, the count or note, and the href below", async () => {
        const main = await renderPage(module)
        const doors = doorsOf(main)

        expect(doors).toHaveLength(floor.groups.length)
        expect(main.querySelectorAll("a"), "no other link").toHaveLength(floor.groups.length)
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
