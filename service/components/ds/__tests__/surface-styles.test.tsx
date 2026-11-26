// @vitest-environment jsdom
import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

import { FloorGuide } from "../FloorGuide"
import { MAP_EDGE, TRIANGLE_CLIP } from "../surface-styles"
import { render } from "./render"

/**
 * Shared surface class contract tests.
 *
 * Plan: 三角形の clip-path（FloorGuide の屋根）と地図の枠（FloorMap の MAP_EDGE）は LodgeExterior が 2 か所目になるので、
 *   surface-styles.ts の 1 か所で定義し、FloorGuide・FloorMap・LodgeExterior が import する。
 *   移しても最終的なクラスの文字列は変えない。
 *
 * Reference: order.md 守ること（同じクラスの組を 2 か所以上に書かない）, Issue #355
 */

const DS_DIR = path.resolve(__dirname, "..")
const SHARED = { MAP_EDGE, TRIANGLE_CLIP }
// Values before the move (FloorMap.tsx and FloorGuide.tsx), kept so the rendered classes do not change.
const BEFORE = {
    MAP_EDGE: "border-2 border-ds-fg",
    TRIANGLE_CLIP: "[clip-path:polygon(50%_0,100%_100%,0_100%)]",
} as const

const sources = fs
    .readdirSync(DS_DIR)
    .filter((file) => /\.tsx?$/.test(file))
    .map((file) => ({ file, source: fs.readFileSync(path.join(DS_DIR, file), "utf-8") }))

const importsShared = (source: string, name: string) =>
    new RegExp(`import\\s*\\{[^}]*\\b${name}\\b[^}]*\\}\\s*from\\s*["']\\./surface-styles["']`).test(source)

describe("shared surface classes", () => {
    it.each(Object.keys(BEFORE) as Array<keyof typeof BEFORE>)("keeps %s as the class string it was", (name) => {
        expect(SHARED[name]).toBe(BEFORE[name])
    })

    it.each(Object.keys(BEFORE) as Array<keyof typeof BEFORE>)(
        "writes the %s classes only in surface-styles.ts",
        (name) => {
            const writers = sources.filter(({ source }) => source.includes(BEFORE[name])).map(({ file }) => file)
            expect(writers).toEqual(["surface-styles.ts"])
        }
    )

    it.each([
        ["FloorMap.tsx", "MAP_EDGE"],
        ["LodgeExterior.tsx", "MAP_EDGE"],
        ["FloorGuide.tsx", "TRIANGLE_CLIP"],
        ["LodgeExterior.tsx", "TRIANGLE_CLIP"],
    ])("%s imports %s from surface-styles", (file, name) => {
        const found = sources.find((s) => s.file === file)
        expect(found, file).toBeDefined()
        expect(importsShared(found!.source, name)).toBe(true)
        expect(found!.source, `no local ${name}`).not.toMatch(new RegExp(`const\\s+${name}\\b`))
    })

    it("still cuts the FloorGuide roof into a triangle", () => {
        const roof = render(<FloorGuide />).querySelector('[data-part="roof"]')
        expect(roof?.classList.contains(BEFORE.TRIANGLE_CLIP)).toBe(true)
    })
})
