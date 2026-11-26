// @vitest-environment jsdom
import fs from "node:fs"
import path from "node:path"
import { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { FLOORS, findFloor, type FloorId } from "@/lib/building/floors"

import { FloorGuide } from "../FloorGuide"
import { LIT_MARK } from "../lit-mark"
import { precedes, render } from "./render"

/**
 * FloorGuide contract tests.
 *
 * Issue #341 との対応:
 *   やること 1（屋上→B1 の順に縦に並べ、番号と名前を出す） → "lists the five floors from the rooftop down to B1 ..."
 *   やること 2（selected / counts / onSelect）            → "marks only the selected floor ...", "shows ●n ...", "calls onSelect ..."
 *   やること 3（屋根の形、B1 は石の色）                    → "puts a roof above the floors", "gives B1 the stone fill ..."
 *   やること 4（狭い画面は横一列で、番号と件数だけ）        → "lays the floors in one row on narrow screens ..."
 *   やること 5（テストと /design の見本）                  → このファイル、app/design/samples/components.test.tsx
 *   受け入れ 1（5 つの階が屋上から B1 の順・選んだ階が分かる） → 順と selected のテスト
 *   受け入れ 2（件数を渡した階に件数が出る）                → counts のテスト
 *   受け入れ 3（tsc / test / lint）                        → 関門
 *
 * Reference: order.md やること 1・受け入れ条件, Issue #341
 */

const ROOFTOP_FIRST = [...FLOORS].reverse()

function floorGroup(root: Element): HTMLElement {
    const group = root.querySelector<HTMLElement>('[role="group"][aria-label="階"]')
    expect(group, "floor group").not.toBeNull()
    return group!
}

function floorButtons(root: Element): HTMLButtonElement[] {
    return Array.from(floorGroup(root).querySelectorAll<HTMLButtonElement>("button"))
}

function buttonOf(root: Element, id: FloorId): HTMLButtonElement {
    const found = floorGroup(root).querySelector<HTMLButtonElement>(`button[data-floor="${id}"]`)
    expect(found, id).not.toBeNull()
    return found!
}

describe("FloorGuide (static)", () => {
    it("lists the five floors from the rooftop down to B1, each with its label and name", () => {
        const buttons = floorButtons(render(<FloorGuide />))
        expect(buttons).toHaveLength(5)
        expect(buttons.map((b) => b.getAttribute("data-floor"))).toEqual(ROOFTOP_FIRST.map((f) => f.id))
        for (const [index, floor] of ROOFTOP_FIRST.entries()) {
            const button = buttons[index]
            expect(button.getAttribute("type"), floor.id).toBe("button")
            const texts = Array.from(button.querySelectorAll("span")).map((s) => s.textContent)
            expect(texts, `${floor.id} label`).toContain(floor.label)
            expect(texts, `${floor.id} name`).toContain(floor.name)
        }
    })

    it("marks only the selected floor with aria-pressed and the pressed frame", () => {
        const root = render(<FloorGuide selected="2f" />)
        for (const floor of FLOORS) {
            const button = buttonOf(root, floor.id)
            const pressed = floor.id === "2f"
            expect(button.getAttribute("aria-pressed"), floor.id).toBe(String(pressed))
            expect(button.classList.contains("border-ds-fg"), `${floor.id} border-ds-fg`).toBe(pressed)
            expect(button.classList.contains("bg-ds-surface"), `${floor.id} bg-ds-surface`).toBe(pressed)
            expect(button.classList.contains("border-ds-border"), `${floor.id} border-ds-border`).toBe(!pressed)
        }
    })

    it("marks no floor as pressed when nothing is selected", () => {
        for (const props of [{}, { selected: null }]) {
            const buttons = floorButtons(render(<FloorGuide {...props} />))
            expect(buttons.map((b) => b.getAttribute("aria-pressed"))).toEqual(Array(5).fill("false"))
        }
    })

    it("shows ●n in accent inside the button of each floor given a count, and nothing for the others", () => {
        const root = render(<FloorGuide counts={{ "2f": 3, b1: 1 }} />)
        const expected: Partial<Record<FloorId, string>> = { "2f": `${LIT_MARK}3`, b1: `${LIT_MARK}1` }
        for (const floor of FLOORS) {
            const button = buttonOf(root, floor.id)
            const marks = Array.from(button.querySelectorAll("span")).filter((s) =>
                s.textContent?.startsWith(LIT_MARK)
            )
            const want = expected[floor.id]
            if (want === undefined) {
                expect(button.textContent, floor.id).not.toContain(LIT_MARK)
                continue
            }
            expect(marks.map((m) => m.textContent), floor.id).toEqual([want])
            expect(marks[0].classList.contains("text-ds-accent"), `${floor.id} accent`).toBe(true)
        }
    })

    it("does not show a count for a floor whose count is zero", () => {
        const root = render(<FloorGuide counts={{ "3f": 0 }} />)
        expect(buttonOf(root, "3f").textContent).not.toContain(LIT_MARK)
    })

    it("puts a roof above the floors, hidden from assistive tech, in the wood wall colour", () => {
        const root = render(<FloorGuide />)
        const roof = root.querySelector<HTMLElement>('[data-part="roof"]')
        expect(roof, "roof").not.toBeNull()
        expect(roof!.getAttribute("aria-hidden")).toBe("true")
        expect(roof!.classList.contains("bg-ds-map-wood-wall")).toBe(true)
        expect(precedes(roof!, floorGroup(root)), "roof before the floors").toBe(true)
    })

    it("gives B1 the stone fill and the other floors the page fill while not pressed", () => {
        const root = render(<FloorGuide />)
        for (const floor of FLOORS) {
            const button = buttonOf(root, floor.id)
            const stone = floor.material === "stone"
            expect(button.classList.contains("bg-ds-map-stone"), `${floor.id} stone`).toBe(stone)
            expect(button.classList.contains("bg-ds-bg"), `${floor.id} bg`).toBe(!stone)
        }
        expect(findFloor("b1").material).toBe("stone")
    })

    it("lays the floors in one row on narrow screens, showing only the label and the count", () => {
        const root = render(<FloorGuide counts={{ "1f": 2 }} />)
        const group = floorGroup(root)
        expect(group.classList.contains("flex-row-reverse"), "row on narrow").toBe(true)
        expect(group.classList.contains("md:flex-col"), "column on wide").toBe(true)

        const roof = root.querySelector<HTMLElement>('[data-part="roof"]')!
        expect(roof.classList.contains("hidden"), "roof hidden on narrow").toBe(true)
        expect(roof.classList.contains("md:block"), "roof shown on wide").toBe(true)

        const button = buttonOf(root, "1f")
        const spans = Array.from(button.querySelectorAll("span"))
        const name = spans.find((s) => s.textContent === findFloor("1f").name)!
        expect(name.classList.contains("hidden"), "name hidden on narrow").toBe(true)
        expect(name.classList.contains("md:inline"), "name shown on wide").toBe(true)

        for (const text of [findFloor("1f").label, `${LIT_MARK}2`]) {
            const span = spans.find((s) => s.textContent === text)!
            expect(span, text).toBeDefined()
            expect(span.classList.contains("hidden"), `${text} visible on narrow`).toBe(false)
        }
    })

    it("uses only ds tokens and no decoration", () => {
        const root = render(<FloorGuide selected="1f" counts={{ "2f": 3 }} />)
        const classes = Array.from(root.querySelectorAll("[class]")).flatMap((el) => Array.from(el.classList))
        const bare = classes.map((c) => c.replace(/^(md|focus-visible):/, ""))
        const tokenised = /^(bg|text|border|font|p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|h|w|outline)-/
        const offenders = bare.filter(
            (c) =>
                tokenised.test(c) &&
                !/-ds(-|$)|^font-bold$|^text-left$|^outline(-offset)?-\d$/.test(c)
        )
        expect(offenders).toEqual([])
        expect(bare.filter((c) => /gradient|shadow|rounded|opacity|blur/.test(c))).toEqual([])
        expect(root.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(/)
    })

    it("does not import the modules that load markdown", () => {
        const source = fs.readFileSync(path.resolve(__dirname, "../FloorGuide.tsx"), "utf-8")
        const specifiers = [...source.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1])
        for (const specifier of specifiers) {
            expect(specifier).not.toMatch(/(^|\/)(skills|profile|portfolio|entries)$|\.md$/)
        }
    })

    it("takes the lit mark from the shared definition instead of writing it again", () => {
        for (const file of ["../FloorGuide.tsx", "../FloorMap.tsx"]) {
            const source = fs.readFileSync(path.resolve(__dirname, file), "utf-8")
            expect(source, file).not.toContain(LIT_MARK)
        }
    })
})

describe("FloorGuide selection (interactive)", () => {
    let container: HTMLDivElement
    let root: Root

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

    it("calls onSelect once with the floor id when a floor is clicked", async () => {
        const onSelect = vi.fn()
        await act(async () => root.render(<FloorGuide onSelect={onSelect} />))
        await act(async () => buttonOf(container, "3f").click())
        expect(onSelect).toHaveBeenCalledTimes(1)
        expect(onSelect).toHaveBeenCalledWith("3f")
    })

    it("does not throw when a floor is clicked without onSelect", async () => {
        await act(async () => root.render(<FloorGuide />))
        await act(async () => buttonOf(container, "rf").click())
        expect(buttonOf(container, "rf").getAttribute("aria-pressed")).toBe("false")
    })
})
