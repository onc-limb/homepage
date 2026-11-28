// @vitest-environment jsdom
import fs from "node:fs"
import path from "node:path"
import { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type { Entry } from "@/lib/building/entries"
import { FLOORS, findFloor, findGroup, toVirtualPath, type FloorId, type GroupSlug } from "@/lib/building/floors"
import { buildGuideFloorData } from "@/lib/building/guide"
import { layoutFloor } from "@/lib/building/layout"
import { litRoomsOn, runSearches } from "@/lib/building/searches"
import { categoryLabels } from "@/lib/skills-meta"

import { guidePcs, precedes } from "@/components/ds/__tests__/render"
import { MAP_AND_GUIDE_COLUMNS } from "@/components/ds/screen-styles"

import { FloorView } from "../FloorView"

const router = vi.hoisted(() => ({ push: vi.fn() }))
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: router.push, replace: vi.fn(), prefetch: vi.fn() }) }))

vi.mock("next/link", () => ({
    default: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}))

/**
 * FloorView contract tests (the map and the guide PC under the doors of a floor page).
 *
 * Props: { layout, guide, searches } built on the server (FloorMapSection) from getEntries().
 * The view draws the map of its floor once and the guide PC right after it (two columns from xl,
 * MAP_AND_GUIDE_COLUMNS). It uses the same composition and searches as the info center, with these
 * differences (order.md やること 4, Issue #345):
 *   - it starts with the floor introduction and has no 「（階の番号） のページへ」
 *   - 上の階・下の階 of the stairs are links to those floor pages
 *   - a result path on another floor goes to that floor page (router.push); on this floor it selects the room
 *
 * Reference: order.md やること 4・受け入れ条件, Issue #345 やること・受け入れ条件（幅 390px でも部屋を選べる）
 */

// ---- fixture ----

let serial = 0
const paper = (group: GroupSlug, room: string, title: string, level?: 1 | 2 | 3 | 4 | 5): Entry => {
    const g = findGroup(group)
    return {
        path: `${toVirtualPath(g.url)}/${room}/${serial++}.md`,
        floor: g.floor,
        group,
        room,
        title,
        excerpt: `${title} line`,
        href: g.url,
        tags: level === undefined ? [] : [room],
        ...(level === undefined ? {} : { level }),
    }
}

const ENTRIES: Entry[] = [
    paper("studies", "ai-llm", "LangChain", 2),
    paper("profile", "profile", "自己紹介"),
    paper("histories", "histories", "組み込み開発"),
    paper("histories", "histories", "AI 開発"),
    paper("skills", "language", "TypeScript", 5),
    paper("skills", "ai-llm", "Claude Code", 4),
    paper("portfolios", "portfolios", "作品 1"),
]

const FLOOR: FloorId = "2f"
const onFloor = (id: FloorId) => ENTRIES.filter((entry) => entry.floor === id)
const LAYOUT = layoutFloor(findFloor(FLOOR), onFloor(FLOOR))
const GUIDE = buildGuideFloorData(LAYOUT, onFloor(FLOOR))
const SEARCHES = runSearches(ENTRIES)
const AI = SEARCHES.find((result) => result.command === "grep -rl ai ~")!
const TREE = SEARCHES.find((result) => result.command === "tree -d -L 2 ~")!

const floor = findFloor(FLOOR)
const floorText = `ここは ${floor.label}「${floor.name}」です。${floor.description}部屋を押すと、中身をお見せします。`
const accessibleName = (name: string) => `${floor.label} ${name}`
const roomName = (id: string) => LAYOUT.rooms.find((room) => room.id === id)!.name

// ---- DOM helpers ----

function mapOf(root: Element): HTMLElement {
    const maps = Array.from(root.querySelectorAll<HTMLElement>("[data-floor][data-material]"))
    expect(maps, "one map").toHaveLength(1)
    return maps[0]
}

const roomButtons = (root: Element) => Array.from(mapOf(root).querySelectorAll<HTMLButtonElement>("button[aria-label]"))
const pressedRooms = (root: Element) =>
    roomButtons(root)
        .filter((b) => b.getAttribute("aria-pressed") === "true")
        .map((b) => b.getAttribute("aria-label"))
const litRooms = (root: Element) =>
    Array.from(mapOf(root).querySelectorAll('[data-part="room"][data-lit="true"]')).map((el) => el.getAttribute("aria-label"))

function pc(root: Element): HTMLElement {
    const pcs = guidePcs(root)
    expect(pcs, "one guide PC").toHaveLength(1)
    return pcs[0]
}

function pcText(root: Element): string {
    const live = pc(root).querySelector("[aria-live]")
    expect(live, "the live region of the PC").not.toBeNull()
    return live!.textContent ?? ""
}

function pcControl(root: Element, text: string): HTMLElement {
    const found = Array.from(pc(root).querySelectorAll<HTMLElement>("a, button")).filter(
        (el) => el.textContent?.trim() === text
    )
    expect(found, `PC control 「${text}」`).toHaveLength(1)
    return found[0]
}

function searchButton(root: Element, label: string): HTMLButtonElement {
    const found = Array.from(pc(root).querySelectorAll<HTMLButtonElement>("button[aria-pressed]")).filter((b) =>
        b.textContent?.includes(label)
    )
    expect(found, label).toHaveLength(1)
    return found[0]
}

const SOURCE = fs.readFileSync(path.resolve(__dirname, "../FloorView.tsx"), "utf-8")

// ---- tests ----

describe("FloorView (interactive)", () => {
    let container: HTMLDivElement
    let root: Root

    const mount = async () => {
        await act(async () => root.render(<FloorView layout={LAYOUT} guide={GUIDE} searches={SEARCHES} />))
    }
    const click = async (el: HTMLElement) => {
        await act(async () => el.click())
    }

    beforeEach(() => {
        vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true)
        router.push.mockReset()
        container = document.createElement("div")
        document.body.append(container)
        root = createRoot(container)
    })

    afterEach(async () => {
        await act(async () => root.unmount())
        container.remove()
        vi.unstubAllGlobals()
    })

    it("draws the map of its floor and the guide PC after it, in the shared two-column set", async () => {
        await mount()
        const map = mapOf(container)
        expect(map.getAttribute("data-floor")).toBe(FLOOR)
        expect(precedes(map, pc(container)), "map before the PC").toBe(true)

        let box: HTMLElement | null = pc(container).parentElement
        while (box && !box.contains(map)) box = box.parentElement
        expect(box, "box holding the map and the PC").not.toBeNull()
        for (const cls of MAP_AND_GUIDE_COLUMNS.split(/\s+/).filter(Boolean)) {
            expect(box!.classList.contains(cls), cls).toBe(true)
        }
    })

    it("starts with the floor introduction, no room selected and no link to its own floor page", async () => {
        await mount()
        expect(pcText(container)).toContain(floorText)
        expect(pressedRooms(container)).toEqual([])
        expect(pc(container).textContent).not.toContain("のページへ")
        expect(pc(container).textContent).toContain("この階の部屋")
    })

    it("changes the guide when a room is selected on the map, and marks it on the same map", async () => {
        await mount()
        const button = roomButtons(container).find((b) => b.getAttribute("aria-label") === accessibleName("経歴"))!
        await click(button)

        expect(button.getAttribute("aria-pressed")).toBe("true")
        expect(pcText(container)).toContain("「経歴」です。")
        expect(pcControl(container, "経歴のページで読む").getAttribute("href")).toBe(findGroup("histories").href)
    })

    it("selects the same room on the map when it is chosen in the PC's room list (works on any width)", async () => {
        await mount()
        await click(pcControl(container, categoryLabels.language))

        expect(pressedRooms(container)).toEqual([accessibleName(roomName("language"))])
        expect(pcText(container)).toContain(`「${categoryLabels.language}」です。`)
        expect(pc(container).textContent).toContain("TypeScript")

        await click(pcControl(container, "廊下へ戻る"))
        expect(pressedRooms(container)).toEqual([])
        expect(pcText(container)).toContain(floorText)
    })

    it("links the stairs to the floor pages above and below", async () => {
        await mount()
        await click(pcControl(container, "階段"))
        expect(pcText(container)).toContain("階段です。上の階・下の階へは、下の一覧から移れます。")

        const index = FLOORS.findIndex((f) => f.id === FLOOR)
        const [up, down] = [FLOORS[index + 1], FLOORS[index - 1]]
        const upLink = pcControl(container, `上の階へ — ${up.label} ${up.name}`)
        const downLink = pcControl(container, `下の階へ — ${down.label} ${down.name}`)
        expect(upLink.tagName).toBe("A")
        expect(upLink.getAttribute("href")).toBe(up.url)
        expect(downLink.tagName).toBe("A")
        expect(downLink.getAttribute("href")).toBe(down.url)
    })

    it("lights the rooms of this floor with hits and tells the count of the whole result", async () => {
        await mount()
        await click(searchButton(container, "AI に関わるもの"))

        const expected = litRoomsOn(AI, FLOOR).map((id) => accessibleName(roomName(id)))
        expect(expected.length).toBeGreaterThan(0)
        expect([...litRooms(container)].sort()).toEqual([...expected].sort())
        expect(pcText(container)).toContain(`${AI.paths.length} 件見つかりました。`)
    })

    it("selects the room of a result path on this floor without leaving the page", async () => {
        await mount()
        await click(searchButton(container, "AI に関わるもの"))
        const hit = AI.hits.find((h) => h.floor === FLOOR && h.room === "histories")!
        await click(pcControl(container, hit.path))

        expect(pressedRooms(container)).toEqual([accessibleName("経歴")])
        expect(pcText(container)).toContain("「経歴」です。")
        expect(router.push).not.toHaveBeenCalled()
    })

    it("goes to the floor page of a result path on another floor", async () => {
        await mount()
        await click(searchButton(container, "AI に関わるもの"))
        const hit = AI.hits.find((h) => h.floor !== FLOOR)!
        await click(pcControl(container, hit.path))

        expect(router.push).toHaveBeenCalledTimes(1)
        expect(router.push).toHaveBeenCalledWith(findFloor(hit.floor).url)
    })

    it("goes to another floor page from a tree line, and stays on this floor for its own line", async () => {
        await mount()
        await click(searchButton(container, "建物の構成を見る"))
        expect(litRooms(container)).toEqual([])

        await click(pcControl(container, TREE.hits.find((h) => h.floor === FLOOR)!.path))
        expect(router.push).not.toHaveBeenCalled()
        expect(pcText(container)).toContain(floorText)

        const other = TREE.hits.find((h) => h.floor === "3f")!
        await click(pcControl(container, other.path))
        expect(router.push).toHaveBeenCalledWith(findFloor("3f").url)
    })
})

describe("FloorView source", () => {
    it("is a client component", () => {
        expect(SOURCE.trimStart().startsWith('"use client"')).toBe(true)
    })

    it("does not import the modules that load markdown, even for types", () => {
        const specifiers = [...SOURCE.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1])
        expect(specifiers.length).toBeGreaterThan(0)
        for (const specifier of specifiers) {
            expect(specifier).not.toMatch(/(^|\/)(skills|profile|portfolio|entries)$|\.md$/)
        }
    })

    it("keeps the screen width out of JavaScript", () => {
        expect(SOURCE).not.toMatch(/matchMedia|innerWidth|min-width|max-width/)
    })
})
