// @vitest-environment jsdom
import fs from "node:fs"
import path from "node:path"
import { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type { Entry } from "@/lib/building/entries"
import { FLOORS, findFloor, findGroup, toVirtualPath, type FloorId, type GroupSlug } from "@/lib/building/floors"
import { buildGuideFloorData, type GuideFloorData, type GuideSelection } from "@/lib/building/guide"
import { layoutFloor, type FloorLayout } from "@/lib/building/layout"
import { litRoomsOn, runSearches, searchCounts } from "@/lib/building/searches"
import { SOCIAL_LINKS } from "@/lib/constants"
import { categoryLabels } from "@/lib/skills-meta"

import { guidePcs, precedes } from "@/components/ds/__tests__/render"
import { LIT_MARK } from "@/components/ds/lit-mark"
import { MAP_AND_GUIDE_COLUMNS } from "@/components/ds/screen-styles"
import { TRIANGLE_CLIP } from "@/components/ds/surface-styles"

import { InfoCenter } from "../InfoCenter"

vi.mock("next/link", () => ({
    default: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}))

/**
 * InfoCenter contract tests (the info center on Home).
 *
 * The floor layouts, the guide data of every floor and the search results are built on the server and
 * passed in as props. The client keeps the selection ({ floor, focus } with focus floor only / room / stairs;
 * 1F with no room first, or what the parent passes) and the active search. It never touches the URL.
 *
 * The map stacks all five floors in FLOORS order and is drawn once (FloorMap switches its own size with
 * md:). The selected floor is in front and fully opaque; the others are drawn at opacity 0.3,
 * non-interactive, and shifted up (floors above) or down (floors below). Only `transform` is transitioned.
 *
 * The guide PC comes right after the map. From xl the map and the PC sit in two columns
 * (MAP_AND_GUIDE_COLUMNS); from md the floor guide is laid over the top left of the map.
 *
 * The PC and the map are wired together: choosing in the PC's room list selects the same room on the map,
 * a search lights the rooms with hits and puts the counts next to the floors, and a result path selects
 * its floor and room.
 *
 * DOM hooks: each floor layer carries `data-floor-layer`, and the selected floor's layer also carries
 * `data-current="true"`.
 *
 * Reference: order.md やること 3・守ること・受け入れ条件, Issue #352, ADR-0001
 */

// ---- fixture: papers in the shape getEntries() returns ----

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
    paper("profile", "profile", "関心"),
    paper("contact", "contact", "フォーム"),
    paper("histories", "histories", "組み込み開発"),
    paper("histories", "histories", "Web 開発"),
    paper("histories", "histories", "AI 開発"),
    paper("skills", "language", "TypeScript", 5),
    paper("skills", "language", "Go", 4),
    paper("portfolios", "portfolios", "作品 1"),
    paper("portfolios", "portfolios", "作品 2"),
    ...SOCIAL_LINKS.slice(0, 2).map(
        (link, i): Entry => ({
            path: `~/rf/link-${i}.url`,
            floor: "rf",
            group: null,
            room: null,
            title: link.name,
            excerpt: link.username,
            href: link.url,
            tags: [],
        })
    ),
]

const onFloor = (id: FloorId) => ENTRIES.filter((entry) => entry.floor === id)
const LAYOUTS = Object.fromEntries(FLOORS.map((floor) => [floor.id, layoutFloor(floor, onFloor(floor.id))])) as Record<
    FloorId,
    FloorLayout
>
const GUIDES = Object.fromEntries(
    FLOORS.map((floor) => [floor.id, buildGuideFloorData(LAYOUTS[floor.id], onFloor(floor.id))])
) as Record<FloorId, GuideFloorData>
const SEARCHES = runSearches(ENTRIES)
const AI = SEARCHES.find((result) => result.command === "grep -rl ai ~")!
const TREE = SEARCHES.find((result) => result.command === "tree -d -L 2 ~")!

const FLOOR_ORDER = FLOORS.map((floor) => floor.id)
const floorText = (id: FloorId) => {
    const floor = findFloor(id)
    return `ここは ${floor.label}「${floor.name}」です。${floor.description}部屋を押すと、中身をお見せします。`
}
const accessibleName = (id: FloorId, name: string) => `${findFloor(id).label} ${name}`

// ---- DOM helpers ----

function guideButton(root: Element, id: FloorId): HTMLButtonElement {
    const group = root.querySelector('[role="group"][aria-label="階"]')
    expect(group, "floor guide").not.toBeNull()
    const found = group!.querySelector<HTMLButtonElement>(`button[data-floor="${id}"]`)
    expect(found, `guide ${id}`).not.toBeNull()
    return found!
}

function mapOf(layer: Element): HTMLElement {
    const map = layer.querySelector<HTMLElement>("[data-floor][data-material]")
    expect(map, "floor map inside the layer").not.toBeNull()
    return map!
}

const layers = (root: Element): HTMLElement[] => Array.from(root.querySelectorAll<HTMLElement>("[data-floor-layer]"))
const layerFloor = (layer: Element): FloorId => mapOf(layer).getAttribute("data-floor") as FloorId

function currentLayer(root: Element): HTMLElement {
    const current = layers(root).filter((layer) => layer.getAttribute("data-current") === "true")
    expect(current, "one current layer").toHaveLength(1)
    return current[0]
}

function translateY(layer: HTMLElement): number {
    const match = layer.style.transform.match(/translateY\(\s*(-?[\d.]+)/)
    expect(match, `translateY in "${layer.style.transform}"`).not.toBeNull()
    return Number(match![1])
}

/** Property names of a CSS transition list (commas inside cubic-bezier(...) are not separators). */
function transitionProperties(transition: string): string[] {
    return transition
        .split(/,(?![^(]*\))/)
        .map((part) => part.trim().split(/\s+/)[0])
        .filter((name) => name !== "")
}

/** The room buttons of the maps (they carry an accessible name; the PC's doors do not). */
const roomButtons = (root: Element): HTMLButtonElement[] =>
    Array.from(root.querySelectorAll<HTMLButtonElement>("[data-floor] button[aria-label]"))

function mapRoom(root: Element, floor: FloorId, name: string): HTMLButtonElement {
    const found = roomButtons(root).find((b) => b.getAttribute("aria-label") === accessibleName(floor, name))
    expect(found, accessibleName(floor, name)).toBeDefined()
    return found!
}

const pressedRooms = (root: Element) =>
    roomButtons(root)
        .filter((b) => b.getAttribute("aria-pressed") === "true")
        .map((b) => b.getAttribute("aria-label"))

function pc(root: Element): HTMLElement {
    const pcs = guidePcs(root)
    expect(pcs, "one guide PC").toHaveLength(1)
    return pcs[0]
}

/** The text of the $ docent output (the live region). */
function pcText(root: Element): string {
    const live = pc(root).querySelector("[aria-live]")
    expect(live, "the live region of the PC").not.toBeNull()
    return live!.textContent ?? ""
}

/** A door or text button inside the PC whose whole text is `text`. */
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

const litOnCurrentMap = (root: Element) =>
    Array.from(mapOf(currentLayer(root)).querySelectorAll('[data-part="room"][data-lit="true"]')).map((el) =>
        el.getAttribute("aria-label")
    )

const guideCount = (root: Element, id: FloorId): string | null => {
    const span = Array.from(guideButton(root, id).querySelectorAll("span")).find((s) => s.textContent?.startsWith(LIT_MARK))
    return span?.textContent ?? null
}

const SOURCE = fs.readFileSync(path.resolve(__dirname, "../InfoCenter.tsx"), "utf-8")

// ---- tests ----

describe("InfoCenter (interactive)", () => {
    let container: HTMLDivElement
    let root: Root

    type Props = Partial<Parameters<typeof InfoCenter>[0]>
    const mount = async (props: Props = {}) => {
        await act(async () => root.render(<InfoCenter layouts={LAYOUTS} guides={GUIDES} searches={SEARCHES} {...props} />))
    }
    const click = async (el: HTMLElement) => {
        await act(async () => el.click())
    }

    beforeEach(() => {
        vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true)
        container = document.createElement("div")
        document.body.append(container)
        root = createRoot(container)
    })

    afterEach(async () => {
        await act(async () => root.unmount())
        container.remove()
        vi.unstubAllGlobals()
    })

    describe("initial state", () => {
        it("starts on 1F in the guide, the map and the PC, with no room selected", async () => {
            await mount()

            for (const id of FLOOR_ORDER) {
                expect(guideButton(container, id).getAttribute("aria-pressed"), id).toBe(String(id === "1f"))
            }
            expect(layerFloor(currentLayer(container))).toBe("1f")
            expect(roomButtons(container).length).toBeGreaterThan(0)
            expect(pressedRooms(container)).toEqual([])
            expect(container.querySelectorAll('[data-part="room"][data-selected="true"]')).toHaveLength(0)
            expect(pcText(container)).toContain(floorText("1f"))
            expect(pcControl(container, "1F のページへ").getAttribute("href")).toBe(findFloor("1f").url)
        })

        it("makes only the selected floor's map interactive, with the floor in the room names", async () => {
            await mount()

            for (const layer of layers(container)) {
                const map = mapOf(layer)
                const current = layer.getAttribute("data-current") === "true"
                expect(map.getAttribute("aria-hidden"), layerFloor(layer)).toBe(current ? null : "true")
                expect(map.querySelectorAll("button").length > 0, `${layerFloor(layer)} buttons`).toBe(current)
            }
            expect(new Set(roomButtons(container).map((b) => b.getAttribute("aria-label")))).toEqual(
                new Set(LAYOUTS["1f"].rooms.map((room) => accessibleName("1f", room.name)))
            )
        })

        it("starts from defaultSelection when it is given", async () => {
            await mount({ defaultSelection: { floor: "2f", focus: { kind: "room", id: "histories" } } })

            expect(layerFloor(currentLayer(container))).toBe("2f")
            expect(pressedRooms(container)).toEqual([accessibleName("2f", "経歴")])
            expect(pcText(container)).toContain("「経歴」です。")
        })
    })

    describe("selecting a floor", () => {
        it("shows the chosen floor's map in front and its guide in the PC", async () => {
            await mount()
            await click(guideButton(container, "3f"))

            for (const id of FLOOR_ORDER) {
                expect(guideButton(container, id).getAttribute("aria-pressed"), id).toBe(String(id === "3f"))
            }
            expect(layerFloor(currentLayer(container))).toBe("3f")
            expect(pcText(container)).toContain(floorText("3f"))
            expect(pcControl(container, "3F のページへ").getAttribute("href")).toBe(findFloor("3f").url)
        })

        it("clears the selected room when the floor changes", async () => {
            await mount()
            await click(mapRoom(container, "1f", "プロフィール"))

            await click(guideButton(container, "3f"))
            expect(pressedRooms(container)).toEqual([])

            await click(guideButton(container, "1f"))
            expect(pressedRooms(container)).toEqual([])
            expect(container.querySelectorAll('[data-part="room"][data-selected="true"]')).toHaveLength(0)
            expect(pcText(container)).toContain(floorText("1f"))
        })
    })

    describe("selecting a room on the map", () => {
        it("marks only the clicked room and changes the text, papers and destination of the PC", async () => {
            await mount({ defaultSelection: { floor: "2f", focus: { kind: "floor" } } })
            const before = pcText(container)
            await click(mapRoom(container, "2f", "経歴"))

            expect(pressedRooms(container)).toEqual([accessibleName("2f", "経歴")])
            expect(pcText(container)).not.toBe(before)
            expect(pcText(container)).toContain(
                "「経歴」です。組み込みから Web、機械学習、AI まで。関わってきた仕事を古い順に置いてあります。置いてあるものは、下のとおりです。"
            )
            expect(pc(container).textContent).toContain("組み込み開発")
            expect(pcControl(container, "経歴のページで読む").getAttribute("href")).toBe(findGroup("histories").href)
            expect(pc(container).textContent).toContain("つながっている部屋")
        })
    })

    describe("choosing in the PC's room list", () => {
        it("selects the same room on the map, on the same map", async () => {
            await mount()
            const button = mapRoom(container, "1f", "受付・連絡先")
            await click(pcControl(container, "受付・連絡先"))

            expect(mapRoom(container, "1f", "受付・連絡先"), "same map button").toBe(button)
            expect(button.getAttribute("aria-pressed")).toBe("true")
            expect(pressedRooms(container)).toEqual([accessibleName("1f", "受付・連絡先")])
            expect(pcText(container)).toContain("「受付・連絡先」です。")
        })

        it("goes back to the corridor with 「廊下へ戻る」", async () => {
            await mount()
            await click(pcControl(container, "プロフィール"))
            await click(pcControl(container, "廊下へ戻る"))

            expect(pressedRooms(container)).toEqual([])
            expect(pcText(container)).toContain(floorText("1f"))
        })

        it("switches the floor from the stairs (上の階・下の階)", async () => {
            await mount()
            await click(pcControl(container, "階段"))
            expect(pcText(container)).toContain("階段です。上の階・下の階へは、下の一覧から移れます。")
            expect(pressedRooms(container)).toEqual([])

            const up = findFloor("2f")
            await click(pcControl(container, `上の階へ — ${up.label} ${up.name}`))
            expect(layerFloor(currentLayer(container))).toBe("2f")
            expect(guideButton(container, "2f").getAttribute("aria-pressed")).toBe("true")
            expect(pcText(container)).toContain(floorText("2f"))
            expect(window.location.pathname, "no navigation").toBe("/")
        })

        it("selects a category room by its full category name", async () => {
            await mount({ defaultSelection: { floor: "2f", focus: { kind: "floor" } } })
            await click(pcControl(container, categoryLabels.language))

            expect(pressedRooms(container)).toEqual([accessibleName("2f", LAYOUTS["2f"].rooms[1].name)])
            expect(pc(container).textContent).toContain("TypeScript")
        })
    })

    describe("searches", () => {
        it("lights the rooms with hits and shows the counts per floor, as the result says", async () => {
            await mount({ defaultSelection: { floor: "2f", focus: { kind: "floor" } } })
            expect(litOnCurrentMap(container), "nothing lit before").toEqual([])
            for (const id of FLOOR_ORDER) expect(guideCount(container, id), `${id} before`).toBeNull()

            await click(searchButton(container, "AI に関わるもの"))

            expect(searchButton(container, "AI に関わるもの").getAttribute("aria-pressed")).toBe("true")
            const expectedLit = litRoomsOn(AI, "2f").map((id) =>
                accessibleName("2f", LAYOUTS["2f"].rooms.find((room) => room.id === id)!.name)
            )
            expect(expectedLit.length).toBeGreaterThan(0)
            expect([...litOnCurrentMap(container)].sort()).toEqual([...expectedLit].sort())

            const counts = searchCounts(AI)
            for (const id of FLOOR_ORDER) {
                const count = counts[id]
                expect(guideCount(container, id), id).toBe(count ? `${LIT_MARK}${count}` : null)
            }
            expect(pcText(container)).toContain(`${AI.paths.length} 件見つかりました。`)
            expect(pc(container).textContent).toContain(AI.summary)
        })

        it("moves the lit rooms with the selected floor while the search stays", async () => {
            await mount({ defaultSelection: { floor: "2f", focus: { kind: "floor" } } })
            await click(searchButton(container, "AI に関わるもの"))
            await click(guideButton(container, "b1"))

            expect(searchButton(container, "AI に関わるもの").getAttribute("aria-pressed")).toBe("true")
            expect(litOnCurrentMap(container)).toEqual(
                litRoomsOn(AI, "b1").map((id) => accessibleName("b1", LAYOUTS.b1.rooms.find((room) => room.id === id)!.name))
            )
        })

        it("selects the floor and the room of a result path", async () => {
            await mount()
            await click(searchButton(container, "AI に関わるもの"))
            const hit = AI.hits.find((h) => h.floor === "b1")!
            await click(pcControl(container, hit.path))

            expect(layerFloor(currentLayer(container))).toBe("b1")
            expect(guideButton(container, "b1").getAttribute("aria-pressed")).toBe("true")
            const roomName = LAYOUTS.b1.rooms.find((room) => room.id === hit.room)!.name
            expect(pressedRooms(container)).toEqual([accessibleName("b1", roomName)])
            expect(pcText(container)).toContain(`「${categoryLabels["ai-llm"]}」です。`)
        })

        it("lights nothing and counts nothing for the tree, and selects the floor of a line", async () => {
            await mount()
            await click(searchButton(container, "建物の構成を見る"))

            expect(litOnCurrentMap(container)).toEqual([])
            for (const id of FLOOR_ORDER) expect(guideCount(container, id), id).toBeNull()

            const line = TREE.hits.find((h) => h.floor === "3f")!
            await click(pcControl(container, line.path))
            expect(layerFloor(currentLayer(container))).toBe("3f")
            expect(pressedRooms(container)).toEqual([])
        })
    })

    describe("controlled selection", () => {
        it("shows the selection passed by the parent and reports changes without moving by itself", async () => {
            const onSelectionChange = vi.fn()
            const selection: GuideSelection = { floor: "2f", focus: { kind: "room", id: "histories" } }
            await mount({ selection, onSelectionChange })

            expect(layerFloor(currentLayer(container))).toBe("2f")
            expect(pressedRooms(container)).toEqual([accessibleName("2f", "経歴")])

            await click(guideButton(container, "3f"))
            expect(onSelectionChange).toHaveBeenCalledWith({ floor: "3f", focus: { kind: "floor" } })
            expect(layerFloor(currentLayer(container)), "the parent decides").toBe("2f")

            await mount({ selection: { floor: "1f", focus: { kind: "floor" } }, onSelectionChange })
            expect(layerFloor(currentLayer(container)), "follows the parent in the same component").toBe("1f")
            expect(pressedRooms(container)).toEqual([])
            expect(pcText(container)).toContain(floorText("1f"))
        })
    })

    describe("floor stack", () => {
        it("has one layer per floor in FLOORS order, each with one map", async () => {
            await mount()

            expect(layers(container).map(layerFloor)).toEqual(FLOOR_ORDER)
            expect(container.querySelectorAll("[data-floor][data-material]"), "one map per floor").toHaveLength(
                FLOOR_ORDER.length
            )
        })

        it("draws the other floors at opacity 0.3 behind the selected one", async () => {
            await mount()
            await click(guideButton(container, "2f"))

            const current = currentLayer(container)
            expect(current.style.opacity, "current").toBe("")
            for (const layer of layers(container)) {
                if (layer === current) continue
                expect(layer.style.opacity, layerFloor(layer)).toBe("0.3")
                expect(Number(layer.style.zIndex), `${layerFloor(layer)} behind`).toBeLessThan(Number(current.style.zIndex))
            }
        })

        it("shifts the floors above upward and the floors below downward", async () => {
            await mount()
            await click(guideButton(container, "2f"))
            const selectedIndex = FLOOR_ORDER.indexOf("2f")

            for (const [index, layer] of layers(container).entries()) {
                const y = translateY(layer)
                const label = layerFloor(layer)
                if (index > selectedIndex) expect(y, label).toBeLessThan(0)
                else if (index < selectedIndex) expect(y, label).toBeGreaterThan(0)
                else expect(Math.abs(y), label).toBe(0)
            }
        })

        it("transitions only transform, so opacity switches without animation", async () => {
            await mount()

            for (const layer of layers(container)) {
                expect(transitionProperties(layer.style.transition), layerFloor(layer)).toEqual(["transform"])
            }
        })

        it("moves the stack when the floor changes but not when a room is selected", async () => {
            await mount()
            const transforms = () => layers(container).map((layer) => layer.style.transform)
            const before = transforms()

            await click(roomButtons(container)[0])
            expect(transforms(), "room click keeps the stack still").toEqual(before)

            await click(guideButton(container, "3f"))
            expect(transforms(), "floor click moves the stack").not.toEqual(before)
        })

        it("relies on the global reduced-motion rule that stops transitions", () => {
            const css = fs.readFileSync(path.resolve(__dirname, "../../../app/globals.css"), "utf-8")
            const block = css.match(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\n\}/)
            expect(block, "reduced-motion block").not.toBeNull()
            expect(block![0]).toMatch(/transition-duration:\s*0\.01ms\s*!important/)
        })
    })

    describe("client state", () => {
        it("does not change the URL when floors, rooms and searches are used", async () => {
            const before = window.location.href
            await mount()
            await click(guideButton(container, "2f"))
            await click(roomButtons(container)[0])
            await click(searchButton(container, "AI に関わるもの"))
            await click(pcControl(container, AI.paths[0]))
            await click(guideButton(container, "b1"))

            expect(window.location.href).toBe(before)
        })
    })

    describe("layout on narrow and wide screens", () => {
        it("puts the map first and the guide PC right after it, in the shared two-column set from xl", async () => {
            await mount()
            const [firstLayer] = layers(container)
            const guidePc = pc(container)
            expect(precedes(firstLayer, guidePc), "map before the PC").toBe(true)

            let box: HTMLElement | null = guidePc.parentElement
            while (box && !box.querySelector("[data-floor-layer]")) box = box.parentElement
            expect(box, "box holding the map and the PC").not.toBeNull()
            const columns = MAP_AND_GUIDE_COLUMNS.split(/\s+/).filter(Boolean)
            for (const cls of columns) expect(box!.classList.contains(cls), cls).toBe(true)
            expect(columns.some((cls) => cls.startsWith("xl:")), "two columns from xl").toBe(true)
            expect(
                columns.filter((cls) => /^(md|lg):/.test(cls) && /grid-cols|flex-row/.test(cls)),
                "no two columns below xl"
            ).toEqual([])
            expect(Array.from(box!.classList).filter((cls) => cls === "md:flex-row"), "no md row").toEqual([])
        })

        it("lays the floor guide over the top left of the map from md", async () => {
            await mount()
            const guide = container.querySelector('[role="group"][aria-label="階"]') as HTMLElement
            const [firstLayer] = layers(container)

            let overlay: HTMLElement | null = guide
            while (overlay && !overlay.classList.contains("md:absolute")) overlay = overlay.parentElement
            expect(overlay, "an md:absolute box around the guide").not.toBeNull()
            expect(overlay!.classList.contains("md:left-ds-2"), "left").toBe(true)
            expect(overlay!.classList.contains("md:top-ds-2"), "top").toBe(true)
            expect(overlay!.contains(firstLayer), "the overlay holds only the guide").toBe(false)

            let frame: HTMLElement | null = overlay!.parentElement
            while (frame && !frame.contains(firstLayer)) frame = frame.parentElement
            expect(frame, "a box around the guide and the map").not.toBeNull()
            const anchors = [frame!, ...Array.from(frame!.querySelectorAll<HTMLElement>("*"))].filter(
                (el) => el.contains(overlay!) && el !== overlay && /(^|\s)(md:)?relative(\s|$)/.test(el.className)
            )
            expect(anchors.length, "a relative box that the guide is placed in").toBeGreaterThan(0)
        })

        it("adds no decoration classes, arbitrary values or hard-coded colours", async () => {
            await mount()
            // The roof of the floor guide is a ds-owned clip-path; only what InfoCenter adds is checked.
            const owned = new Set(TRIANGLE_CLIP.split(/\s+/))
            const classes = Array.from(container.querySelectorAll("[class]"))
                .filter((el) => !guidePcs(container).some((pcEl) => pcEl.contains(el)))
                .flatMap((el) => Array.from(el.classList))
                .filter((c) => !owned.has(c))
            expect(classes.filter((c) => /gradient|shadow|rounded|opacity|blur|transition|\[/.test(c))).toEqual([])
            expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(/)
        })
    })
})

describe("InfoCenter source", () => {
    it("is a client component", () => {
        expect(SOURCE.trimStart().startsWith('"use client"')).toBe(true)
    })

    it("does not import the modules that load markdown", () => {
        const specifiers = [...SOURCE.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1])
        expect(specifiers.length).toBeGreaterThan(0)
        for (const specifier of specifiers) {
            expect(specifier).not.toMatch(/(^|\/)(skills|profile|portfolio|entries)$|\.md$/)
        }
    })

    it("keeps the selection out of the URL and the screen width out of JavaScript", () => {
        expect(SOURCE).not.toContain("next/navigation")
        expect(SOURCE).not.toMatch(/matchMedia|innerWidth|min-width|max-width/)
    })
})
