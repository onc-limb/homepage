// @vitest-environment jsdom
import fs from "node:fs"
import path from "node:path"
import { act, useState } from "react"
import { createRoot, type Root } from "react-dom/client"
import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { findFloor, findGroup, type FloorId, type GroupSlug } from "@/lib/building/floors"
import {
    layoutFloor,
    projectTopDown,
    type FloorLayout,
    type LayoutEntry,
} from "@/lib/building/layout"
import { categoryOrder } from "@/lib/skills-meta"

import { FloorMap, FloorMapInputError } from "../FloorMap"
import { render } from "./render"

/**
 * FloorMap contract tests.
 *
 * Plan: components/ds/FloorMap.tsx は layoutFloor の結果を props で受け取り、上から見下ろした階の地図を描く。
 *   床板・部屋（床と奥側の壁）・廊下・階段・扉・1F の入口とデッキ・部屋の名前のラベル。素材は階で変える。
 *   状態: selected（prompt の太い枠）/ lit（accent の枠と map-lit の地、ラベルに ●）/ onSelect（click と Enter）。
 *   size="small" ではラベルを出さず印だけ。interactive={false} では button を作らず全体を aria-hidden にする。
 *
 * DOM の目印（計画で決めたもの）:
 *   外の枠: data-floor / data-material / data-size、size で max-w-ds-map / max-w-ds-map-small
 *   data-part: plane（変形する平面）, slab, corridor, stairs, door, deck, entrance-step,
 *              room（部屋の床。包みの中に wall と並ぶ）, wall, label（平面の外）, mark（小の印）
 *
 * Reference: order.md 作るもの・やること 1〜3・受け入れ条件, Issue #339, #340
 */

// ---- 固定の入力 ----

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
    b1: layoutFloor(findFloor("b1"), [
        ...papers("studies", categoryOrder[0], 3),
        ...papers("studies", categoryOrder[1], 1),
        ...papers("studies", categoryOrder[2], 2),
    ]),
    "1f": layoutFloor(findFloor("1f"), [
        ...papers("profile", "profile", 2),
        ...papers("contact", "contact", 1),
    ]),
    "2f": layoutFloor(findFloor("2f"), [
        ...papers("histories", "histories", 4),
        ...papers("skills", categoryOrder[0], 2),
        ...papers("skills", categoryOrder[3], 5),
    ]),
    "3f": layoutFloor(findFloor("3f"), papers("portfolios", "portfolios", 3)),
    rf: layoutFloor(findFloor("rf"), [
        link("GitHub", "github"),
        link("Zenn", "zenn"),
        link("X (Twitter)", "x"),
    ]),
}

const MATERIAL_OF: Record<FloorId, "wood" | "stone" | "deck"> = {
    b1: "stone",
    "1f": "wood",
    "2f": "wood",
    "3f": "wood",
    rf: "deck",
}

const FLOOR_IDS = Object.keys(LAYOUTS) as FloorId[]

// ---- DOM を読む補助 ----

const parts = (root: Element, part: string): HTMLElement[] =>
    Array.from(root.querySelectorAll<HTMLElement>(`[data-part="${part}"]`))

const mapRoot = (container: HTMLElement): HTMLElement => {
    const el = container.querySelector<HTMLElement>("[data-floor]")
    expect(el, "map root with data-floor").not.toBeNull()
    return el!
}

const has = (el: Element, cls: string): boolean => el.classList.contains(cls)

const withClass = (el: Element, cls: string): Element[] =>
    [el, ...Array.from(el.querySelectorAll("*"))].filter((e) => e.classList.contains(cls))

const percent = (value: string): number => {
    expect(value, "a % length").toMatch(/%$/)
    return Number.parseFloat(value)
}

const ancestors = (el: Element, stop: Element): HTMLElement[] => {
    const found: HTMLElement[] = []
    for (let cur = el.parentElement; cur && cur !== stop; cur = cur.parentElement)
        found.push(cur)
    return found
}

describe("FloorMap drawing", () => {
    it("renders one button per room, named after the room, in layout order", () => {
        const layout = LAYOUTS["2f"]
        const root = mapRoot(render(<FloorMap layout={layout} />))
        const buttons = Array.from(root.querySelectorAll("button"))

        expect(buttons).toHaveLength(layout.rooms.length)
        expect(buttons.map((b) => b.getAttribute("aria-label"))).toEqual(
            layout.rooms.map((r) => r.name)
        )
        for (const button of buttons) {
            expect(button.getAttribute("type")).toBe("button")
            expect(button.getAttribute("data-part")).toBe("room")
        }
    })

    it("shows each room name as a label (name only, no paper counts)", () => {
        const layout = LAYOUTS["2f"]
        const root = mapRoot(render(<FloorMap layout={layout} />))
        const labels = parts(root, "label").map((l) => l.textContent)

        expect([...labels].sort()).toEqual(layout.rooms.map((r) => r.name).sort())
    })

    it("only rooms are buttons: corridor and stairs are drawn but not interactive", () => {
        const root = mapRoot(render(<FloorMap layout={LAYOUTS["2f"]} />))
        for (const part of ["corridor", "stairs"]) {
            const found = parts(root, part)
            expect(found, part).toHaveLength(1)
            expect(found[0].tagName, part).not.toBe("BUTTON")
            expect(found[0].querySelector("button"), `${part} has no button`).toBeNull()
        }
    })

    it("draws the floor on a top-down transformed plane with a slab under it", () => {
        const root = mapRoot(render(<FloorMap layout={LAYOUTS["2f"]} />))
        const planes = parts(root, "plane")
        expect(planes).toHaveLength(1)
        const transform = planes[0].style.transform
        expect(transform).toContain("scaleY(0.5)")
        expect(transform).toContain("rotate(45deg)")

        const slabs = parts(planes[0], "slab")
        expect(slabs.length, "slab").toBeGreaterThanOrEqual(1)
        expect(
            slabs.some((s) => has(s, "bg-ds-map-slab")),
            "slab color"
        ).toBe(true)
    })

    it("places each room at its layout rect, as a share of the building", () => {
        const layout = LAYOUTS["2f"]
        const root = mapRoot(render(<FloorMap layout={layout} />))
        const rooms = parts(root, "room")
        expect(rooms).toHaveLength(layout.rooms.length)

        rooms.forEach((room, i) => {
            const { rect } = layout.rooms[i]
            const box = room.parentElement!
            expect(percent(box.style.left), "left").toBeCloseTo(
                (rect.x / layout.building.w) * 100,
                3
            )
            expect(percent(box.style.top), "top").toBeCloseTo(
                (rect.y / layout.building.h) * 100,
                3
            )
            expect(percent(box.style.width), "width").toBeCloseTo(
                (rect.w / layout.building.w) * 100,
                3
            )
            expect(percent(box.style.height), "height").toBeCloseTo(
                (rect.h / layout.building.h) * 100,
                3
            )
        })
    })

    it("draws a door for every room on 2F, and no deck or entrance step", () => {
        const layout = LAYOUTS["2f"]
        const root = mapRoot(render(<FloorMap layout={layout} />))
        expect(parts(root, "door")).toHaveLength(layout.rooms.length)
        expect(parts(root, "deck")).toHaveLength(0)
        expect(parts(root, "entrance-step")).toHaveLength(0)
    })

    it("draws the entrance, the exit, the deck and the entrance step on 1F", () => {
        const layout = LAYOUTS["1f"]
        const root = mapRoot(render(<FloorMap layout={layout} />))
        expect(parts(root, "door"), "room doors + entrance + exit").toHaveLength(
            layout.rooms.length + 2
        )
        expect(parts(root, "deck")).toHaveLength(1)
        expect(parts(root, "entrance-step")).toHaveLength(1)
    })

    it("draws a corridor door and an outside door for every rooftop room", () => {
        const layout = LAYOUTS.rf
        const root = mapRoot(render(<FloorMap layout={layout} />))
        expect(parts(root, "door")).toHaveLength(layout.rooms.length * 2)
        expect(parts(root, "deck")).toHaveLength(0)
    })

    it("keeps the labels outside the transformed plane, untilted", () => {
        const root = mapRoot(render(<FloorMap layout={LAYOUTS["2f"]} />))
        const plane = parts(root, "plane")[0]
        const labels = parts(root, "label")
        expect(labels.length).toBeGreaterThan(0)
        for (const label of labels) {
            expect(plane.contains(label), "label is not inside the plane").toBe(false)
            expect(
                label.getAttribute("aria-hidden"),
                "label is decoration; the button carries the name"
            ).toBe("true")
            for (const el of [label, ...ancestors(label, root), root]) {
                expect(
                    el.style.transform,
                    "no rotation on the label or its frame"
                ).not.toMatch(/rotate|skew|matrix/)
            }
        }
    })

    it("aligns room labels with the projected centers in the map frame", () => {
        const layout = LAYOUTS["1f"]
        const root = mapRoot(render(<FloorMap layout={layout} />))
        const plane = parts(root, "plane")[0]
        const labels = parts(root, "label")
        const scaleX = percent(plane.style.width) / layout.building.w
        const scaleY = percent(plane.style.height) / layout.building.h
        const planeCenterX = percent(plane.style.left) + percent(plane.style.width) / 2
        const planeCenterY = percent(plane.style.top) + percent(plane.style.height) / 2

        layout.rooms.forEach(({ name, rect }, index) => {
            const center = projectTopDown({
                x: rect.x + rect.w / 2,
                y: rect.y + rect.h / 2,
            })
            expect(labels[index].textContent).toBe(name)
            expect(percent(labels[index].style.left)).toBeCloseTo(
                planeCenterX + center.x * scaleX
            )
            expect(percent(labels[index].style.top)).toBeCloseTo(
                planeCenterY + center.y * scaleY
            )
        })
    })

    it("uses only --ds-map-* colors for the fills of the drawing", () => {
        for (const id of FLOOR_IDS) {
            const plane = parts(
                mapRoot(render(<FloorMap layout={LAYOUTS[id]} />)),
                "plane"
            )[0]
            const fills = Array.from(plane.querySelectorAll("[class]")).flatMap((el) =>
                Array.from(el.classList).filter((c) => /^bg-/.test(c))
            )
            expect(fills.length, id).toBeGreaterThan(0)
            expect(
                fills.filter((c) => !c.startsWith("bg-ds-map-")),
                `${id}: fills outside --ds-map-*`
            ).toEqual([])
        }
    })

    it("does not import the modules that load markdown", () => {
        const source = fs.readFileSync(
            path.resolve(__dirname, "../FloorMap.tsx"),
            "utf-8"
        )
        const specifiers = [...source.matchAll(/from\s+["']([^"']+)["']/g)].map(
            (m) => m[1]
        )
        for (const specifier of specifiers) {
            expect(specifier).not.toMatch(
                /(^|\/)(skills|profile|portfolio|entries)$|\.md$/
            )
        }
    })

    it("renders without CSS gradients", () => {
        for (const id of FLOOR_IDS) {
            expect(
                renderToStaticMarkup(<FloorMap layout={LAYOUTS[id]} />),
                id
            ).not.toMatch(/gradient/i)
        }
    })
})

describe("FloorMap materials", () => {
    const FLOOR_FILL = {
        wood: "bg-ds-map-wood",
        stone: "bg-ds-map-stone",
        deck: "bg-ds-map-deck",
    } as const
    const JOINT = {
        wood: "border-ds-map-wood-joint",
        stone: "border-ds-map-stone-joint",
        deck: "border-ds-map-deck-joint",
    } as const

    it.each(FLOOR_IDS)("draws %s in its floor material", (id) => {
        const material = MATERIAL_OF[id]
        const root = mapRoot(render(<FloorMap layout={LAYOUTS[id]} />))
        expect(root.getAttribute("data-floor")).toBe(id)
        expect(root.getAttribute("data-material")).toBe(material)

        for (const room of parts(root, "room")) {
            expect(
                has(room, FLOOR_FILL[material]),
                `${id} room floor ${FLOOR_FILL[material]}`
            ).toBe(true)
            expect(
                withClass(room, JOINT[material]).length,
                `${id} room joints`
            ).toBeGreaterThan(1)
            for (const other of Object.values(JOINT).filter(
                (j) => j !== JOINT[material]
            )) {
                expect(withClass(room, other), `${id}: no ${other}`).toHaveLength(0)
            }
        }
    })

    it.each(FLOOR_IDS.filter((id) => MATERIAL_OF[id] !== "deck"))(
        "raises the back walls of every %s room in three solid steps",
        (id) => {
            const material = MATERIAL_OF[id]
            const root = mapRoot(render(<FloorMap layout={LAYOUTS[id]} />))
            for (const room of parts(root, "room")) {
                const walls = parts(room.parentElement!, "wall")
                expect(walls, `${id} wall steps`).toHaveLength(3)
                for (const wall of walls) {
                    expect(
                        has(wall, `bg-ds-map-${material}-wall`),
                        `${id} wall color`
                    ).toBe(true)
                }
            }
        }
    )

    it("gives the rooftop terrace rooms a single low rim instead of walls", () => {
        const root = mapRoot(render(<FloorMap layout={LAYOUTS.rf} />))
        for (const room of parts(root, "room")) {
            expect(parts(room.parentElement!, "wall"), "rim").toHaveLength(1)
        }
    })
})

describe("FloorMap states (static)", () => {
    const layout = LAYOUTS["2f"]
    const [first, second, third] = layout.rooms

    it("marks only the selected room with aria-pressed and the thick prompt frame", () => {
        const root = mapRoot(render(<FloorMap layout={layout} selected={second.id} />))
        const buttons = Array.from(root.querySelectorAll("button"))
        buttons.forEach((button, i) => {
            const isSelected = layout.rooms[i].id === second.id
            expect(button.getAttribute("aria-pressed"), layout.rooms[i].name).toBe(
                String(isSelected)
            )
            expect(button.getAttribute("data-selected") === "true", "data-selected").toBe(
                isSelected
            )
            expect(has(button, "border-ds-prompt"), "prompt frame").toBe(isSelected)
            expect(has(button, "border-4"), "thick frame").toBe(isSelected)
        })
    })

    it("has no selected room when selected is not given", () => {
        const root = mapRoot(render(<FloorMap layout={layout} />))
        for (const button of Array.from(root.querySelectorAll("button"))) {
            expect(button.getAttribute("aria-pressed")).toBe("false")
            expect(has(button, "border-ds-prompt")).toBe(false)
            expect(has(button, "border-2"), "normal frame").toBe(true)
            expect(has(button, "border-ds-fg"), "normal frame color").toBe(true)
        }
    })

    it("lights the lit rooms with the accent frame, the lit fill and a ● after the label", () => {
        const lit = [first.id, third.id]
        const root = mapRoot(render(<FloorMap layout={layout} lit={lit} />))
        const rooms = parts(root, "room")
        rooms.forEach((room, i) => {
            const isLit = lit.includes(layout.rooms[i].id)
            expect(
                room.getAttribute("data-lit") === "true",
                `${layout.rooms[i].name} data-lit`
            ).toBe(isLit)
            expect(has(room, "border-ds-accent"), "accent frame").toBe(isLit)
            expect(has(room, "bg-ds-map-lit"), "lit fill").toBe(isLit)
            expect(has(room, "bg-ds-map-wood"), "material fill when not lit").toBe(!isLit)
        })

        const labels = parts(root, "label").map((l) => l.textContent)
        const expected = layout.rooms.map((r) =>
            lit.includes(r.id) ? `${r.name} ●` : r.name
        )
        expect([...labels].sort()).toEqual([...expected].sort())
    })

    it("changes only background and border colors over time", () => {
        const root = mapRoot(render(<FloorMap layout={layout} />))
        for (const room of parts(root, "room")) {
            const transition = room.style.transition
            expect(transition, "a color transition").not.toBe("")
            const properties = transition.split(",").map((t) => t.trim().split(/\s+/)[0])
            expect([...properties].sort()).toEqual(["background-color", "border-color"])
        }
    })

    it("relies on the global reduced-motion rule that stops transitions", () => {
        const css = fs.readFileSync(
            path.resolve(__dirname, "../../../app/globals.css"),
            "utf-8"
        )
        const block = css.match(
            /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\n\}/
        )
        expect(block, "reduced-motion block").not.toBeNull()
        expect(block![0]).toMatch(/transition-duration:\s*0\.01ms\s*!important/)
    })
})

describe("FloorMap size", () => {
    const layout = LAYOUTS["2f"]
    const [first, , third] = layout.rooms

    it("is the normal size by default, with labels", () => {
        const root = mapRoot(render(<FloorMap layout={layout} />))
        expect(root.getAttribute("data-size")).toBe("normal")
        expect(has(root, "max-w-ds-map")).toBe(true)
        expect(has(root, "max-w-ds-map-small")).toBe(false)
        expect(parts(root, "label")).toHaveLength(layout.rooms.length)
        expect(parts(root, "mark")).toHaveLength(0)
    })

    it("small: draws a smaller map without labels, marking only the selected and lit rooms", () => {
        const root = mapRoot(
            render(
                <FloorMap
                    layout={layout}
                    size="small"
                    selected={first.id}
                    lit={[third.id]}
                />
            )
        )
        expect(root.getAttribute("data-size")).toBe("small")
        expect(has(root, "max-w-ds-map-small")).toBe(true)
        expect(has(root, "max-w-ds-map")).toBe(false)

        expect(parts(root, "label"), "no labels").toHaveLength(0)
        for (const room of layout.rooms) {
            expect(root.textContent, `no name for ${room.name}`).not.toContain(room.name)
        }
        const marks = parts(root, "mark")
        expect(marks, "one mark per selected or lit room").toHaveLength(2)
        for (const mark of marks) expect(mark.textContent).toBe("●")
    })

    it("small: a room both selected and lit gets a single mark", () => {
        const root = mapRoot(
            render(
                <FloorMap
                    layout={layout}
                    size="small"
                    selected={first.id}
                    lit={[first.id]}
                />
            )
        )
        expect(parts(root, "mark")).toHaveLength(1)
        const room = parts(root, "room")[0]
        expect(has(room, "border-ds-prompt")).toBe(true)
        expect(has(room, "border-ds-accent")).toBe(false)
        expect(has(room, "bg-ds-map-lit")).toBe(true)
    })

    it("small: rooms stay buttons and keep the selected and lit states", () => {
        const root = mapRoot(
            render(
                <FloorMap
                    layout={layout}
                    size="small"
                    selected={first.id}
                    lit={[third.id]}
                />
            )
        )
        expect(root.querySelectorAll("button")).toHaveLength(layout.rooms.length)
        expect(root.querySelectorAll('button[aria-pressed="true"]')).toHaveLength(1)
        expect(root.querySelectorAll('[data-lit="true"]')).toHaveLength(1)
    })
})

describe("FloorMap interactive={false}", () => {
    const layout = LAYOUTS["2f"]

    it("draws rooms without buttons and hides the whole map from assistive technology", () => {
        const root = mapRoot(render(<FloorMap layout={layout} interactive={false} />))
        expect(root.getAttribute("aria-hidden")).toBe("true")
        expect(root.querySelectorAll("button")).toHaveLength(0)
        const rooms = parts(root, "room")
        expect(rooms).toHaveLength(layout.rooms.length)
        for (const room of rooms) expect(room.tagName).toBe("SPAN")
    })

    it("keeps the selected and lit states visible", () => {
        const root = mapRoot(
            render(
                <FloorMap
                    layout={layout}
                    interactive={false}
                    selected={layout.rooms[0].id}
                    lit={[layout.rooms[1].id]}
                />
            )
        )
        const rooms = parts(root, "room")
        expect(has(rooms[0], "border-ds-prompt")).toBe(true)
        expect(rooms[1].getAttribute("data-lit")).toBe("true")
    })

    it("is exposed to assistive technology when interactive (the default)", () => {
        const root = mapRoot(render(<FloorMap layout={layout} />))
        expect(root.hasAttribute("aria-hidden")).toBe(false)
    })
})

describe("FloorMap keyboard order", () => {
    it("keeps every room button in the tab order, in layout order", () => {
        for (const id of FLOOR_IDS) {
            const layout = LAYOUTS[id]
            const root = mapRoot(render(<FloorMap layout={layout} />))
            const buttons = Array.from(root.querySelectorAll("button"))
            expect(
                buttons.map((b) => b.getAttribute("aria-label")),
                id
            ).toEqual(layout.rooms.map((r) => r.name))
            for (const button of buttons) {
                expect(button.hasAttribute("disabled"), `${id} disabled`).toBe(false)
                const tabindex = button.getAttribute("tabindex")
                expect(tabindex === null || Number(tabindex) >= 0, `${id} tabindex`).toBe(
                    true
                )
            }
        }
    })
})

describe("FloorMap input", () => {
    const layout = LAYOUTS["2f"]

    it("rejects a selected id that is not a room of the layout", () => {
        expect(() =>
            renderToStaticMarkup(<FloorMap layout={layout} selected="no-such-room" />)
        ).toThrow(FloorMapInputError)
    })

    it("rejects a lit id that is not a room of the layout", () => {
        expect(() =>
            renderToStaticMarkup(
                <FloorMap layout={layout} lit={[layout.rooms[0].id, "no-such-room"]} />
            )
        ).toThrow(FloorMapInputError)
    })

    it("names the error FloorMapInputError", () => {
        const error = new FloorMapInputError("x")
        expect(error).toBeInstanceOf(Error)
        expect(error.name).toBe("FloorMapInputError")
    })
})

describe("FloorMap selection (interactive)", () => {
    const layout = LAYOUTS["2f"]
    let container: HTMLDivElement
    let root: Root

    const buttonFor = (name: string): HTMLButtonElement => {
        const found = container.querySelector<HTMLButtonElement>(
            `button[aria-label="${name}"]`
        )
        expect(found, name).not.toBeNull()
        return found!
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

    it("calls onSelect once with the room id when a room is clicked", async () => {
        const onSelect = vi.fn()
        await act(async () =>
            root.render(<FloorMap layout={layout} onSelect={onSelect} />)
        )
        await act(async () => buttonFor(layout.rooms[1].name).click())
        expect(onSelect).toHaveBeenCalledTimes(1)
        expect(onSelect).toHaveBeenCalledWith(layout.rooms[1].id)
    })

    it("calls onSelect once with the room id on Enter, and prevents the native click", async () => {
        const onSelect = vi.fn()
        await act(async () =>
            root.render(<FloorMap layout={layout} onSelect={onSelect} />)
        )
        const button = buttonFor(layout.rooms[2].name)
        button.focus()
        expect(document.activeElement).toBe(button)

        const event = new KeyboardEvent("keydown", {
            key: "Enter",
            bubbles: true,
            cancelable: true,
        })
        await act(async () => {
            button.dispatchEvent(event)
        })
        expect(onSelect).toHaveBeenCalledTimes(1)
        expect(onSelect).toHaveBeenCalledWith(layout.rooms[2].id)
        expect(event.defaultPrevented, "Enter must not also fire the native click").toBe(
            true
        )
    })

    it("ignores keys other than Enter", async () => {
        const onSelect = vi.fn()
        await act(async () =>
            root.render(<FloorMap layout={layout} onSelect={onSelect} />)
        )
        await act(async () => {
            buttonFor(layout.rooms[0].name).dispatchEvent(
                new KeyboardEvent("keydown", {
                    key: "ArrowDown",
                    bubbles: true,
                    cancelable: true,
                })
            )
        })
        expect(onSelect).not.toHaveBeenCalled()
    })

    it("moves the selection within the same map when a parent keeps the selected id", async () => {
        function Parent() {
            const [selected, setSelected] = useState<string | null>(null)
            return <FloorMap layout={layout} selected={selected} onSelect={setSelected} />
        }
        await act(async () => root.render(<Parent />))
        const a = buttonFor(layout.rooms[0].name)
        const b = buttonFor(layout.rooms[1].name)
        expect(container.querySelectorAll('button[aria-pressed="true"]')).toHaveLength(0)

        await act(async () => a.click())
        expect(a.getAttribute("aria-pressed")).toBe("true")
        expect(a.classList.contains("border-ds-prompt")).toBe(true)
        expect(b.getAttribute("aria-pressed")).toBe("false")

        await act(async () => {
            b.dispatchEvent(
                new KeyboardEvent("keydown", {
                    key: "Enter",
                    bubbles: true,
                    cancelable: true,
                })
            )
        })
        expect(buttonFor(layout.rooms[1].name), "same button element").toBe(b)
        expect(b.getAttribute("aria-pressed")).toBe("true")
        expect(b.classList.contains("border-ds-prompt")).toBe(true)
        expect(a.getAttribute("aria-pressed")).toBe("false")
        expect(a.classList.contains("border-ds-prompt")).toBe(false)
    })

    it("moves the lit fill and mark with updated results in the same map", async () => {
        const [first, second] = layout.rooms
        await act(async () => root.render(<FloorMap layout={layout} lit={[first.id]} />))
        const a = buttonFor(first.name)
        const b = buttonFor(second.name)
        const labels = parts(mapRoot(container), "label")
        expect(a.classList.contains("bg-ds-map-lit")).toBe(true)
        expect(labels[0].textContent).toBe(`${first.name} ●`)

        await act(async () => root.render(<FloorMap layout={layout} lit={[second.id]} />))
        expect(buttonFor(first.name)).toBe(a)
        expect(buttonFor(second.name)).toBe(b)
        expect(a.classList.contains("bg-ds-map-lit")).toBe(false)
        expect(b.classList.contains("bg-ds-map-lit")).toBe(true)
        expect(labels[0].textContent).toBe(first.name)
        expect(labels[1].textContent).toBe(`${second.name} ●`)
    })

    it("does not fail when a room is clicked without onSelect", async () => {
        await act(async () => root.render(<FloorMap layout={layout} />))
        await act(async () => buttonFor(layout.rooms[0].name).click())
        expect(container.querySelectorAll("button")).toHaveLength(layout.rooms.length)
    })
})
