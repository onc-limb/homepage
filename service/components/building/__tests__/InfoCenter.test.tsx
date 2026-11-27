// @vitest-environment jsdom
import fs from "node:fs"
import path from "node:path"
import { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { FLOORS, findFloor, findGroup, type FloorId, type GroupSlug } from "@/lib/building/floors"
import { layoutFloor, type FloorLayout, type LayoutEntry } from "@/lib/building/layout"
import { categoryOrder } from "@/lib/skills-meta"

import { precedes } from "@/components/ds/__tests__/render"
import { TRIANGLE_CLIP } from "@/components/ds/surface-styles"

import { InfoCenter } from "../InfoCenter"

/**
 * InfoCenter contract tests (the info center on Home).
 *
 * The floor layouts are built on the server and passed in as props. The client keeps the
 * selected floor and room in its own state (1F first, no room), never touches the URL, and
 * shows the floor guide first and the map second (side by side on wide screens).
 *
 * The map stacks all five floors in FLOORS order. The selected floor is in front and fully
 * opaque; the others are drawn at opacity 0.3, non-interactive, and shifted up (floors above)
 * or down (floors below). Only `transform` is transitioned, so the map moves only when the
 * floor changes, and the global reduced-motion rule stops that transition.
 *
 * The map is drawn twice: the normal size inside `hidden md:block` and the small size inside
 * `md:hidden`, using the existing breakpoint only.
 *
 * DOM hooks (from the plan): each floor layer carries `data-floor-layer`, and the selected
 * floor's layer also carries `data-current="true"`.
 *
 * Reference: order.md やること 2〜4・受け入れ条件, Issue #351
 */

// ---- fixture ----

const floorOf = (group: GroupSlug): FloorId => findGroup(group).floor

const papers = (group: GroupSlug, room: string, count: number): LayoutEntry[] =>
    Array.from({ length: count }, (_, i) => ({
        path: `~/${floorOf(group)}/${group}/${room}/${String(i).padStart(3, "0")}.md`,
        floor: floorOf(group),
        group,
        room,
        title: `${room} ${i}`,
    }))

const link = (name: string, file: string): LayoutEntry => ({
    path: `~/rf/${file}.url`,
    floor: "rf",
    group: null,
    room: null,
    title: name,
})

const LAYOUTS: Record<FloorId, FloorLayout> = {
    b1: layoutFloor(findFloor("b1"), papers("studies", categoryOrder[1], 2)),
    "1f": layoutFloor(findFloor("1f"), [
        ...papers("profile", "profile", 2),
        ...papers("contact", "contact", 1),
    ]),
    "2f": layoutFloor(findFloor("2f"), [
        ...papers("histories", "histories", 3),
        ...papers("skills", categoryOrder[0], 2),
    ]),
    "3f": layoutFloor(findFloor("3f"), papers("portfolios", "portfolios", 3)),
    rf: layoutFloor(findFloor("rf"), [link("GitHub", "github"), link("Zenn", "zenn")]),
}

const FLOOR_ORDER = FLOORS.map((floor) => floor.id)
const roomNames = (id: FloorId): string[] => LAYOUTS[id].rooms.map((room) => room.name)

// ---- DOM helpers ----

type Size = "normal" | "small"

function guideButton(root: Element, id: FloorId): HTMLButtonElement {
    const group = root.querySelector('[role="group"][aria-label="階"]')
    expect(group, "floor guide").not.toBeNull()
    const found = group!.querySelector<HTMLButtonElement>(`button[data-floor="${id}"]`)
    expect(found, `guide ${id}`).not.toBeNull()
    return found!
}

function mapOf(layer: Element): HTMLElement {
    const map = layer.querySelector<HTMLElement>("[data-floor][data-size]")
    expect(map, "floor map inside the layer").not.toBeNull()
    return map!
}

/** The five layers of the stack whose maps have the given size, in document order. */
function layers(root: Element, size: Size): HTMLElement[] {
    return Array.from(root.querySelectorAll<HTMLElement>("[data-floor-layer]")).filter(
        (layer) => mapOf(layer).getAttribute("data-size") === size
    )
}

function layerFloor(layer: Element): FloorId {
    return mapOf(layer).getAttribute("data-floor") as FloorId
}

function currentLayer(root: Element, size: Size): HTMLElement {
    const current = layers(root, size).filter((layer) => layer.getAttribute("data-current") === "true")
    expect(current, `${size}: one current layer`).toHaveLength(1)
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

function ancestorClasses(el: Element, stop: Element): string[] {
    const classes: string[] = []
    for (let cur = el.parentElement; cur && cur !== stop; cur = cur.parentElement) {
        classes.push(...Array.from(cur.classList))
    }
    return classes
}

function roomButtons(root: Element): HTMLButtonElement[] {
    return Array.from(root.querySelectorAll<HTMLButtonElement>("button[aria-label]"))
}

const SOURCE = fs.readFileSync(path.resolve(__dirname, "../InfoCenter.tsx"), "utf-8")

// ---- tests ----

describe("InfoCenter (interactive)", () => {
    let container: HTMLDivElement
    let root: Root

    const mount = async () => {
        await act(async () => root.render(<InfoCenter layouts={LAYOUTS} />))
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
        it("starts on 1F in the guide and in both maps, with no room selected", async () => {
            await mount()

            for (const id of FLOOR_ORDER) {
                expect(guideButton(container, id).getAttribute("aria-pressed"), id).toBe(String(id === "1f"))
            }
            for (const size of ["normal", "small"] as const) {
                expect(layerFloor(currentLayer(container, size)), size).toBe("1f")
            }
            const buttons = roomButtons(container)
            expect(buttons.length).toBeGreaterThan(0)
            expect(buttons.filter((b) => b.getAttribute("aria-pressed") === "true")).toEqual([])
            expect(container.querySelectorAll('[data-part="room"][data-selected="true"]')).toHaveLength(0)
        })

        it("makes only the selected floor's map interactive", async () => {
            await mount()

            for (const size of ["normal", "small"] as const) {
                for (const layer of layers(container, size)) {
                    const map = mapOf(layer)
                    const current = layer.getAttribute("data-current") === "true"
                    expect(map.getAttribute("aria-hidden"), `${size} ${layerFloor(layer)}`).toBe(
                        current ? null : "true"
                    )
                    expect(map.querySelectorAll("button").length > 0, `${size} ${layerFloor(layer)} buttons`).toBe(
                        current
                    )
                }
            }
            expect(new Set(roomButtons(container).map((b) => b.getAttribute("aria-label")))).toEqual(
                new Set(roomNames("1f"))
            )
        })
    })

    describe("selecting a floor", () => {
        it("shows the chosen floor's map in front, in both sizes", async () => {
            await mount()
            await click(guideButton(container, "3f"))

            for (const id of FLOOR_ORDER) {
                expect(guideButton(container, id).getAttribute("aria-pressed"), id).toBe(String(id === "3f"))
            }
            for (const size of ["normal", "small"] as const) {
                expect(layerFloor(currentLayer(container, size)), size).toBe("3f")
            }
            expect(new Set(roomButtons(container).map((b) => b.getAttribute("aria-label")))).toEqual(
                new Set(roomNames("3f"))
            )
        })

        it("can go back to 1F after another floor", async () => {
            await mount()
            await click(guideButton(container, "rf"))
            await click(guideButton(container, "1f"))

            expect(layerFloor(currentLayer(container, "normal"))).toBe("1f")
            expect(layerFloor(currentLayer(container, "small"))).toBe("1f")
        })

        it("clears the selected room when the floor changes", async () => {
            await mount()
            const [first] = roomNames("1f")
            await click(roomButtons(container).find((b) => b.getAttribute("aria-label") === first)!)

            await click(guideButton(container, "3f"))
            expect(roomButtons(container).filter((b) => b.getAttribute("aria-pressed") === "true")).toEqual([])

            await click(guideButton(container, "1f"))
            expect(roomButtons(container).filter((b) => b.getAttribute("aria-pressed") === "true")).toEqual([])
            expect(container.querySelectorAll('[data-part="room"][data-selected="true"]')).toHaveLength(0)
        })
    })

    describe("selecting a room", () => {
        it("marks only the clicked room as selected", async () => {
            await mount()
            const [, second] = roomNames("1f")
            const target = roomButtons(container).find((b) => b.getAttribute("aria-label") === second)!
            await click(target)

            for (const button of roomButtons(container)) {
                const name = button.getAttribute("aria-label")
                const selected = name === second
                expect(button.getAttribute("aria-pressed"), name!).toBe(String(selected))
                expect(button.getAttribute("data-selected"), name!).toBe(selected ? "true" : null)
            }
            expect(layerFloor(currentLayer(container, "normal"))).toBe("1f")
        })

        it("can select a room on a floor reached through the guide", async () => {
            await mount()
            await click(guideButton(container, "3f"))
            const [name] = roomNames("3f")
            await click(roomButtons(container).find((b) => b.getAttribute("aria-label") === name)!)

            const pressed = roomButtons(container).filter((b) => b.getAttribute("aria-pressed") === "true")
            expect(pressed.length).toBeGreaterThan(0)
            expect(new Set(pressed.map((b) => b.getAttribute("aria-label")))).toEqual(new Set([name]))
        })
    })

    describe("floor stack", () => {
        it("has one layer per floor in FLOORS order, in both sizes", async () => {
            await mount()

            for (const size of ["normal", "small"] as const) {
                expect(layers(container, size).map(layerFloor), size).toEqual(FLOOR_ORDER)
            }
        })

        it("draws the other floors at opacity 0.3 behind the selected one", async () => {
            await mount()
            await click(guideButton(container, "2f"))

            for (const size of ["normal", "small"] as const) {
                const current = currentLayer(container, size)
                expect(current.style.opacity, `${size} current`).toBe("")
                for (const layer of layers(container, size)) {
                    if (layer === current) continue
                    expect(layer.style.opacity, `${size} ${layerFloor(layer)}`).toBe("0.3")
                    expect(Number(layer.style.zIndex), `${size} ${layerFloor(layer)} behind`).toBeLessThan(
                        Number(current.style.zIndex)
                    )
                }
            }
        })

        it("shifts the floors above upward and the floors below downward", async () => {
            await mount()
            await click(guideButton(container, "2f"))
            const selectedIndex = FLOOR_ORDER.indexOf("2f")

            for (const size of ["normal", "small"] as const) {
                for (const [index, layer] of layers(container, size).entries()) {
                    const y = translateY(layer)
                    const label = `${size} ${layerFloor(layer)}`
                    if (index > selectedIndex) expect(y, label).toBeLessThan(0)
                    else if (index < selectedIndex) expect(y, label).toBeGreaterThan(0)
                    else expect(Math.abs(y), label).toBe(0)
                }
            }
        })

        it("transitions only transform, so opacity switches without animation", async () => {
            await mount()

            for (const layer of layers(container, "normal")) {
                expect(transitionProperties(layer.style.transition), layerFloor(layer)).toEqual(["transform"])
            }
        })

        it("moves the stack when the floor changes but not when a room is selected", async () => {
            await mount()
            const transforms = () => layers(container, "normal").map((layer) => layer.style.transform)
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
        it("does not change the URL when floors and rooms are selected", async () => {
            const before = window.location.href
            await mount()
            await click(guideButton(container, "2f"))
            await click(roomButtons(container)[0])
            await click(guideButton(container, "b1"))

            expect(window.location.href).toBe(before)
        })
    })

    describe("layout on narrow and wide screens", () => {
        it("puts the guide first and the map second, in a column that becomes a row at md", async () => {
            await mount()
            const guide = container.querySelector('[role="group"][aria-label="階"]') as HTMLElement
            const [firstLayer] = layers(container, "normal")
            expect(precedes(guide, firstLayer)).toBe(true)

            let box: HTMLElement | null = guide.parentElement
            while (box && !box.querySelector("[data-floor-layer]")) box = box.parentElement
            expect(box, "box holding the guide and the map").not.toBeNull()
            expect(box!.classList.contains("flex-col"), "column on narrow").toBe(true)
            expect(box!.classList.contains("md:flex-row"), "row on wide").toBe(true)
        })

        it("shows the small map only below md and the normal map only from md", async () => {
            await mount()

            for (const layer of layers(container, "small")) {
                const classes = ancestorClasses(layer, container)
                expect(classes, `small ${layerFloor(layer)}`).toContain("md:hidden")
                expect(classes, `small ${layerFloor(layer)}`).not.toContain("hidden")
            }
            for (const layer of layers(container, "normal")) {
                const classes = ancestorClasses(layer, container)
                expect(classes, `normal ${layerFloor(layer)}`).toContain("hidden")
                expect(classes, `normal ${layerFloor(layer)}`).toContain("md:block")
                expect(classes, `normal ${layerFloor(layer)}`).not.toContain("md:hidden")
            }
        })

        it("adds no decoration classes, arbitrary values or hard-coded colours", async () => {
            await mount()
            // The roof of the floor guide is a ds-owned clip-path; only what InfoCenter adds is checked.
            const owned = new Set(TRIANGLE_CLIP.split(/\s+/))
            const classes = Array.from(container.querySelectorAll("[class]"))
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
