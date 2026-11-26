// @vitest-environment jsdom
import { describe, expect, it } from "vitest"

import { FLOORS, findFloor } from "@/lib/building/floors"
import { layoutFloor, projectTopDown, TOP_DOWN_TRANSFORM, type Point } from "@/lib/building/layout"

import { LodgeExterior } from "../LodgeExterior"
import { TRIANGLE_CLIP } from "../surface-styles"
import { render } from "./render"

/**
 * LodgeExterior contract tests.
 *
 * Plan: components/ds/LodgeExterior.tsx は山荘を外から見た絵を、地図と同じ見下ろしの角度で CSS の変形だけで描く。
 *   屋上のテラス（板張り）・壁を持つ階ごとの 2 面の壁（木は窓あり、B1 は石で窓なし）・1F の入口の扉・階段の塔屋、
 *   奥の山の稜線 3 つと、奥 10 本・手前 6 本の針葉樹。props は door（closed / open）と size（desktop / narrow）。
 *   全体を aria-hidden にする。寸法・式はモック Maze.dc.html の X と定数 TREES / HILLS から。
 *
 * DOM の目印（計画で決めたもの）:
 *   外枠: data-part="lodge-exterior" / data-size / data-door / aria-hidden
 *   data-part: hill, tree（data-row=back|front）, terrace, wall（data-floor, data-face=light|shade）, window,
 *              tower-wall（data-face）, tower-top, door, door-leaf
 *
 * Reference: order.md やること 1〜4・受け入れ条件・守ること, Issue #355
 */

// ---- モック（docs/design-system/mock/Maze.dc.html）から写した値 ----

// [x, y, 大きさ, 手前か]（画面の幅・高さに対する割合）
const TREES: ReadonlyArray<readonly [number, number, number, 0 | 1]> = [
    [0.06, 0.3, 1.0, 0], [0.14, 0.18, 0.8, 0], [0.22, 0.07, 0.9, 0], [0.31, 0.02, 0.7, 0],
    [0.66, 0.01, 0.75, 0], [0.76, 0.07, 0.95, 0], [0.86, 0.19, 0.8, 0], [0.92, 0.32, 1.0, 0],
    [0.01, 0.48, 0.85, 0], [0.93, 0.5, 0.9, 0],
    [0.04, 0.7, 1.1, 1], [0.13, 0.8, 0.9, 1], [0.23, 0.86, 0.75, 1], [0.78, 0.86, 0.8, 1],
    [0.86, 0.76, 1.0, 1], [0.93, 0.68, 0.85, 1],
]
// [x, y, 幅, 高さ]（画面の幅・高さに対する割合）
const HILLS: ReadonlyArray<readonly [number, number, number, number]> = [
    [-0.06, 0.04, 0.52, 0.56],
    [0.28, -0.03, 0.5, 0.5],
    [0.6, 0.06, 0.5, 0.52],
]

const SIZES = {
    desktop: { width: 1000, height: 780, scale: 0.8, floorHeight: 96, treeWidth: 70, treeHeight: 120 },
    narrow: { width: 358, height: 400, scale: 0.36, floorHeight: 46, treeWidth: 30, treeHeight: 52 },
} as const
type Size = keyof typeof SIZES
const SIZE_NAMES = Object.keys(SIZES) as Size[]

const WALL_SKEW = "26.565deg"
const TOWER_HEIGHT_RATIO = 0.55

// ---- 期待値は定義から作る ----

const WALLED = [...FLOORS].reverse().filter((f) => f.material !== "deck")
const MATERIAL_FILL = {
    wood: { light: "bg-ds-map-wood-wall", shade: "bg-ds-map-wood-shade", windows: { light: 4, shade: 3 } },
    stone: { light: "bg-ds-map-stone-wall", shade: "bg-ds-map-stone-shade", windows: { light: 0, shade: 0 } },
} as const
const { building, stairs } = layoutFloor(findFloor("1f"), [])

/** モックの pe(x, y): 部品の中での点の位置（px）。 */
function place(size: Size, point: Point): Point {
    const s = SIZES[size]
    const top = (s.height - WALLED.length * s.floorHeight) / 2
    const p = projectTopDown(point)
    return { x: s.width / 2 + p.x * s.scale, y: top + p.y * s.scale }
}

// ---- DOM の読み取り ----

function exterior(container: HTMLElement): HTMLElement {
    const root = container.querySelector<HTMLElement>('[data-part="lodge-exterior"]')
    if (!root) throw new Error("no lodge-exterior root")
    return root
}

function parts(root: Element, part: string): HTMLElement[] {
    return Array.from(root.querySelectorAll<HTMLElement>(`[data-part="${part}"]`))
}

function box(el: HTMLElement) {
    return {
        left: parseFloat(el.style.left),
        top: parseFloat(el.style.top),
        width: parseFloat(el.style.width),
        height: parseFloat(el.style.height),
    }
}

const has = (el: Element, cls: string) => el.classList.contains(cls)
const near = (actual: number, expected: number, label: string, tolerance = 0.5) =>
    expect(Math.abs(actual - expected), `${label}: ${actual} vs ${expected}`).toBeLessThanOrEqual(tolerance)

const draw = (props: Parameters<typeof LodgeExterior>[0] = {}) => exterior(render(<LodgeExterior {...props} />))

// ---- テスト ----

describe("LodgeExterior frame", () => {
    it.each(SIZE_NAMES)("sizes the %s drawing to the mock's width and height", (size) => {
        const root = draw({ size })
        expect(root.getAttribute("data-size")).toBe(size)
        expect(parseFloat(root.style.width), "width").toBe(SIZES[size].width)
        expect(parseFloat(root.style.height), "height").toBe(SIZES[size].height)
    })

    it("draws the desktop size with a closed door by default", () => {
        const root = draw()
        expect(root.getAttribute("data-size")).toBe("desktop")
        expect(root.getAttribute("data-door")).toBe("closed")
    })

    it("hides the whole drawing from assistive tech and has nothing to read or press", () => {
        const container = render(<LodgeExterior />)
        const root = exterior(container)
        expect(container.firstElementChild, "aria-hidden on the outermost element").toBe(root)
        expect(root.getAttribute("aria-hidden")).toBe("true")
        expect(root.querySelector("button, a, input, [tabindex], [role]"), "interactive").toBeNull()
        expect(root.textContent?.trim(), "text").toBe("")
    })
})

describe("LodgeExterior walls", () => {
    it("draws a light and a shade wall for each floor with walls, from the top floor down", () => {
        const root = draw()
        const walls = parts(root, "wall")
        expect(walls, "two faces per walled floor").toHaveLength(2 * WALLED.length)
        expect(walls.map((w) => w.getAttribute("data-floor"))).toEqual(
            WALLED.flatMap((f) => [f.id, f.id])
        )
        WALLED.forEach((floor) => {
            const faces = walls
                .filter((w) => w.getAttribute("data-floor") === floor.id)
                .map((w) => w.getAttribute("data-face"))
            expect([...faces].sort(), floor.id).toEqual(["light", "shade"])
        })
    })

    it("paints wood floors with the wood colours and the stone floor with the stone colours", () => {
        const root = draw()
        for (const wall of parts(root, "wall")) {
            const floor = WALLED.find((f) => f.id === wall.getAttribute("data-floor"))!
            const face = wall.getAttribute("data-face") as "light" | "shade"
            const fill = MATERIAL_FILL[floor.material as "wood" | "stone"]
            expect(has(wall, fill[face]), `${floor.id} ${face}: ${fill[face]}`).toBe(true)
            const other = Object.values(MATERIAL_FILL).flatMap((m) => [m.light, m.shade]).filter((c) => c !== fill[face])
            for (const cls of other) expect(has(wall, cls), `${floor.id} ${face} not ${cls}`).toBe(false)
            expect(has(wall, "border-2") && has(wall, "border-ds-fg"), `${floor.id} ${face} edge`).toBe(true)
        }
    })

    it("puts lit windows on the wood walls only: four on the light face, three on the shade face", () => {
        const root = draw()
        for (const wall of parts(root, "wall")) {
            const floor = WALLED.find((f) => f.id === wall.getAttribute("data-floor"))!
            const face = wall.getAttribute("data-face") as "light" | "shade"
            const windows = parts(wall, "window")
            expect(windows, `${floor.id} ${face} windows`).toHaveLength(
                MATERIAL_FILL[floor.material as "wood" | "stone"].windows[face]
            )
            for (const w of windows) {
                expect(has(w, "bg-ds-map-lit"), "lit window").toBe(true)
                expect(has(w, "bg-ds-accent"), "window is not the door colour").toBe(false)
            }
        }
        expect(parts(root, "window"), "no windows outside the walls").toHaveLength(
            parts(root, "wall").reduce((n, w) => n + parts(w, "window").length, 0)
        )
    })

    it.each(SIZE_NAMES)("places the %s walls on the building's corners, one floor height apart", (size) => {
        const s = SIZES[size]
        const left = place(size, { x: building.x, y: building.y + building.h })
        const corner = place(size, { x: building.x + building.w, y: building.y + building.h })
        const right = place(size, { x: building.x + building.w, y: building.y })
        const walls = parts(draw({ size }), "wall")
        WALLED.forEach((floor, k) => {
            const light = walls.find((w) => w.dataset.floor === floor.id && w.dataset.face === "light")!
            const shade = walls.find((w) => w.dataset.floor === floor.id && w.dataset.face === "shade")!
            const lb = box(light)
            near(lb.left, left.x, `${floor.id} light left`)
            near(lb.top, left.y + k * s.floorHeight, `${floor.id} light top`)
            near(lb.width, corner.x - left.x, `${floor.id} light width`)
            near(lb.height, s.floorHeight, `${floor.id} light height`)
            const sb = box(shade)
            near(sb.left, corner.x, `${floor.id} shade left`)
            near(sb.top, corner.y + k * s.floorHeight, `${floor.id} shade top`)
            near(sb.width, right.x - corner.x, `${floor.id} shade width`)
            near(sb.height, s.floorHeight, `${floor.id} shade height`)
            expect(light.style.transform, "light skew").toBe(`skewY(${WALL_SKEW})`)
            expect(shade.style.transform, "shade skew").toBe(`skewY(-${WALL_SKEW})`)
        })
    })
})

describe("LodgeExterior terrace and stair tower", () => {
    it("lays the rooftop terrace as deck planks with joints, seen from above", () => {
        const root = draw()
        const terraces = parts(root, "terrace")
        expect(terraces).toHaveLength(1)
        const terrace = terraces[0]
        expect(has(terrace, "bg-ds-map-deck"), "deck fill").toBe(true)
        expect(terrace.querySelector(".border-ds-map-deck-joint"), "deck joints").not.toBeNull()
        expect(terrace.style.transform).toBe(TOP_DOWN_TRANSFORM)
    })

    it.each(SIZE_NAMES)("sizes the %s terrace to the building scaled down", (size) => {
        const s = SIZES[size]
        const center = place(size, { x: building.x + building.w / 2, y: building.y + building.h / 2 })
        const b = box(parts(draw({ size }), "terrace")[0])
        near(b.width, building.w * s.scale, "width")
        near(b.height, building.h * s.scale, "height")
        near(b.left, center.x - (building.w * s.scale) / 2, "left")
        near(b.top, center.y - (building.h * s.scale) / 2, "top")
    })

    it("draws the stair tower with a light wall, a shade wall and a wood top", () => {
        const root = draw()
        const towerWalls = parts(root, "tower-wall")
        expect(towerWalls.map((w) => w.getAttribute("data-face"))).toEqual(["light", "shade"])
        expect(has(towerWalls[0], "bg-ds-map-wood-wall"), "light").toBe(true)
        expect(has(towerWalls[1], "bg-ds-map-wood-shade"), "shade").toBe(true)
        expect(towerWalls[0].style.transform).toBe(`skewY(${WALL_SKEW})`)
        expect(towerWalls[1].style.transform).toBe(`skewY(-${WALL_SKEW})`)
        const tops = parts(root, "tower-top")
        expect(tops).toHaveLength(1)
        expect(has(tops[0], "bg-ds-map-wood-wall"), "top").toBe(true)
        expect(tops[0].style.transform).toBe(TOP_DOWN_TRANSFORM)
    })

    it.each(SIZE_NAMES)("stands the %s stair tower on the stairs of the building", (size) => {
        const s = SIZES[size]
        const towerHeight = s.floorHeight * TOWER_HEIGHT_RATIO
        const left = place(size, { x: stairs.x, y: stairs.y + stairs.h })
        const corner = place(size, { x: stairs.x + stairs.w, y: stairs.y + stairs.h })
        const right = place(size, { x: stairs.x + stairs.w, y: stairs.y })
        const root = draw({ size })
        const [light, shade] = parts(root, "tower-wall").map(box)
        near(light.left, left.x, "light left")
        near(light.top, left.y - towerHeight, "light top")
        near(light.width, corner.x - left.x, "light width")
        near(light.height, towerHeight, "light height")
        near(shade.left, corner.x, "shade left")
        near(shade.top, corner.y - towerHeight, "shade top")
        near(shade.width, right.x - corner.x, "shade width")
        const center = place(size, { x: stairs.x + stairs.w / 2, y: stairs.y + stairs.h / 2 })
        const top = box(parts(root, "tower-top")[0])
        near(top.width, stairs.w * s.scale, "top width")
        near(top.height, stairs.h * s.scale, "top height")
        near(top.left, center.x - (stairs.w * s.scale) / 2, "top left")
        near(top.top, center.y - towerHeight - (stairs.h * s.scale) / 2, "top top")
    })
})

describe("LodgeExterior door", () => {
    it.each([
        ["closed", "none"],
        ["open", /^scaleX\(/],
    ] as const)("draws the %s door", (door, leaf) => {
        const root = draw({ door })
        expect(root.getAttribute("data-door")).toBe(door)
        const doors = parts(root, "door")
        expect(doors).toHaveLength(1)
        const leaves = parts(doors[0], "door-leaf")
        expect(leaves).toHaveLength(1)
        expect(has(leaves[0], "bg-ds-accent"), "accent leaf").toBe(true)
        expect(leaves[0].style.transform).toMatch(leaf)
    })

    it("draws the open door differently from the closed door", () => {
        const leafOf = (door: "closed" | "open") => parts(draw({ door }), "door-leaf")[0].style.transform
        expect(leafOf("open")).not.toBe(leafOf("closed"))
    })

    it.each(SIZE_NAMES)("puts the %s door on the shade face of 1F", (size) => {
        const root = draw({ size })
        const wall = parts(root, "wall").find((w) => w.dataset.floor === findFloor("1f").id && w.dataset.face === "shade")!
        const door = parts(root, "door")[0]
        const w = box(wall)
        const d = box(door)
        expect(d.left, "door inside the wall (left)").toBeGreaterThan(w.left)
        expect(d.left + d.width, "door inside the wall (right)").toBeLessThan(w.left + w.width)
        // The shade face is skewed by tan(26.565°) = 0.5, so a point dx into the face sits dx / 2 higher.
        const expectedTop = w.top + w.height * 0.3 - (d.left - w.left) * 0.5
        near(d.top, expectedTop, "door top on the 1F row", 1)
        expect(d.height, "door shorter than a floor").toBeLessThan(w.height)
        expect(door.style.transform).toBe(`skewY(-${WALL_SKEW})`)
    })
})

describe("LodgeExterior hills and trees", () => {
    it("draws three hill ridges and sixteen trees, ten behind and six in front", () => {
        const root = draw()
        const hills = parts(root, "hill")
        expect(hills).toHaveLength(3)
        for (const hill of hills) {
            expect(has(hill, "bg-ds-map-hill"), "hill fill").toBe(true)
            expect(has(hill, TRIANGLE_CLIP), "hill triangle").toBe(true)
        }
        const trees = parts(root, "tree")
        expect(trees).toHaveLength(16)
        expect(trees.filter((t) => t.dataset.row === "back"), "back").toHaveLength(10)
        expect(trees.filter((t) => t.dataset.row === "front"), "front").toHaveLength(6)
    })

    it("draws each tree as a trunk under two triangular tiers in the two tree colours", () => {
        for (const tree of parts(draw(), "tree")) {
            expect(tree.querySelector(".bg-ds-map-trunk"), "trunk").not.toBeNull()
            const tiers = Array.from(tree.querySelectorAll<HTMLElement>(".bg-ds-map-tree-1, .bg-ds-map-tree-2"))
            expect(tiers, "two tiers").toHaveLength(2)
            expect(tiers.every((t) => has(t, TRIANGLE_CLIP)), "triangular tiers").toBe(true)
            expect(
                new Set(tiers.map((t) => (has(t, "bg-ds-map-tree-1") ? 1 : 2))).size,
                "two different colours"
            ).toBe(2)
        }
    })

    it.each(SIZE_NAMES)("places the %s hills and trees at the mock's positions and sizes", (size) => {
        const s = SIZES[size]
        const root = draw({ size })
        parts(root, "hill").forEach((hill, i) => {
            const [x, y, w, h] = HILLS[i]
            const b = box(hill)
            near(b.left, x * s.width, `hill ${i} left`)
            near(b.top, y * s.height, `hill ${i} top`)
            near(b.width, w * s.width, `hill ${i} width`)
            near(b.height, h * s.height, `hill ${i} height`)
        })
        const expected = [...TREES.filter((t) => t[3] === 0), ...TREES.filter((t) => t[3] === 1)]
        parts(root, "tree").forEach((tree, i) => {
            const [x, y, scale, front] = expected[i]
            expect(tree.dataset.row, `tree ${i} row`).toBe(front ? "front" : "back")
            const b = box(tree)
            near(b.left, x * s.width, `tree ${i} left`)
            near(b.top, y * s.height, `tree ${i} top`)
            near(b.width, s.treeWidth * scale, `tree ${i} width`)
            near(b.height, s.treeHeight * scale, `tree ${i} height`)
        })
    })

    it("stacks hills, back trees, terrace, walls, tower walls, door, tower top and front trees in that order", () => {
        const LAYERS = ["hill", "tree", "terrace", "wall", "tower-wall", "door", "tower-top"]
        const selector = LAYERS.map((p) => `[data-part="${p}"]`).join(", ")
        const labels = Array.from(draw().querySelectorAll<HTMLElement>(selector)).map((el) =>
            el.dataset.part === "tree" ? `tree:${el.dataset.row}` : el.dataset.part!
        )
        const layers = labels.filter((label, i) => label !== labels[i - 1])
        expect(layers).toEqual([
            "hill",
            "tree:back",
            "terrace",
            "wall",
            "tower-wall",
            "door",
            "tower-top",
            "tree:front",
        ])
    })
})

describe("LodgeExterior design tokens", () => {
    it.each(SIZE_NAMES.flatMap((size) => (["closed", "open"] as const).map((door) => [size, door] as const)))(
        "colours the %s drawing with a %s door through ds tokens only, without decoration",
        (size, door) => {
            const root = draw({ size, door })
            const elements = [root, ...Array.from(root.querySelectorAll<HTMLElement>("*"))]
            for (const el of elements) {
                const style = el.getAttribute("style") ?? ""
                expect(style, "no colour in style").not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(|var\(|color/i)
                expect(style, "no decoration in style").not.toMatch(/gradient|shadow|opacity|radius|transition|animation|filter/i)
            }
            const classes = elements.flatMap((el) => Array.from(el.classList))
            const colourClasses = classes.filter((c) => /^(bg|text|border|fill|stroke)-/.test(c) && !/^border(-[trblxy])?(-\d+)?$/.test(c))
            expect(colourClasses.filter((c) => !/-ds-/.test(c)), "non-ds colours").toEqual([])
            expect(
                classes.filter((c) => /gradient|shadow|rounded|opacity|blur|transition|animate|duration/.test(c)),
                "decoration classes"
            ).toEqual([])
        }
    )
})
