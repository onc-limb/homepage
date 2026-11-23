// @vitest-environment jsdom
import fs from "node:fs"
import path from "node:path"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { Planks } from "../Planks"
import { render } from "./render"

/**
 * Planks contract tests.
 *
 * Plan: DoorButton の中にあった Planks を共有の部品に切り出し、DoorButton と FloorMap の両方が使う。
 *   木（既定）・石・テラスの 3 種類を持ち、目地の色だけが素材で変わる。CSS のグラデーションは使わない。
 *
 * Reference: order.md 作るもの「板の目地」, Issue #339
 */

const JOINTS = {
    wood: "border-ds-map-wood-joint",
    stone: "border-ds-map-stone-joint",
    deck: "border-ds-map-deck-joint",
} as const

const MATERIALS = Object.keys(JOINTS) as Array<keyof typeof JOINTS>

const withClass = (root: HTMLElement, cls: string): HTMLElement[] =>
    Array.from(root.querySelectorAll<HTMLElement>("*")).filter((el) =>
        el.classList.contains(cls)
    )

describe("Planks", () => {
    it("draws wood planks by default, hidden from assistive technology", () => {
        const root = render(<Planks />)
        const wrapper = root.firstElementChild as HTMLElement
        expect(wrapper.getAttribute("aria-hidden")).toBe("true")
        expect(
            withClass(root, JOINTS.wood),
            "existing wood joints on the door"
        ).toHaveLength(24)
        expect(root.textContent).toBe("")
    })

    it("extends the same board pattern across wider surfaces", () => {
        const root = render(<Planks material="deck" count={32} />)
        expect(withClass(root, JOINTS.deck)).toHaveLength(32)
    })

    it.each(MATERIALS)("draws the %s joints in the %s joint color only", (material) => {
        const root = render(<Planks material={material} />)
        expect(
            withClass(root, JOINTS[material]).length,
            `${material} joints`
        ).toBeGreaterThan(1)
        for (const other of MATERIALS.filter((m) => m !== material)) {
            expect(withClass(root, JOINTS[other]), `no ${other} joints`).toHaveLength(0)
        }
    })

    it.each(MATERIALS)("draws the %s planks without CSS gradients", (material) => {
        const html = renderToStaticMarkup(<Planks material={material} />)
        expect(html).not.toMatch(/gradient/i)
    })

    // 描き方を 2 つ作らない（order.md）: DoorButton と FloorMap は同じ Planks を import する
    it.each(["DoorButton.tsx", "FloorMap.tsx"])(
        "%s draws its planks with the shared Planks",
        (file) => {
            const source = fs.readFileSync(path.resolve(__dirname, "..", file), "utf-8")
            expect(source).toMatch(
                /import\s*\{[^}]*\bPlanks\b[^}]*\}\s*from\s*["']\.\/Planks["']/
            )
            expect(source, "no local Planks definition").not.toMatch(
                /function\s+Planks\b|const\s+Planks\b/
            )
            expect(source, "no local plank count").not.toMatch(/PLANK_COUNT/)
        }
    )
})
