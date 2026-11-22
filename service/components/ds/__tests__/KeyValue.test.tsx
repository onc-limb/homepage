// @vitest-environment jsdom
import { describe, expect, it } from "vitest"

import { KeyValue } from "../KeyValue"
import { render } from "./render"

const ITEMS = [
    { key: "name", value: "onclimb" },
    { key: "role", value: <strong>エンジニア</strong> },
    { key: "stack", value: "TypeScript" },
]

describe("KeyValue", () => {
    it("renders each item as a dt / dd pair in order inside a dl", () => {
        const root = render(<KeyValue items={ITEMS} />)
        const dl = root.querySelector("dl")
        expect(dl).not.toBeNull()
        expect(root.querySelectorAll("ul, ol, li")).toHaveLength(0)

        const cells = Array.from(dl!.querySelectorAll("dt, dd")).map(
            (el) => `${el.tagName.toLowerCase()}:${el.textContent}`
        )
        expect(cells).toEqual([
            "dt:name",
            "dd:onclimb",
            "dt:role",
            "dd:エンジニア",
            "dt:stack",
            "dd:TypeScript",
        ])
        expect(dl!.querySelector("dd strong")?.textContent).toBe("エンジニア")
    })

    it("stacks on narrow screens and aligns the key column from md up", () => {
        const root = render(<KeyValue items={ITEMS} />)
        const dl = root.querySelector("dl")!
        expect(dl.classList.contains("grid"), "grid").toBe(true)
        expect(dl.classList.contains("grid-cols-1"), "grid-cols-1").toBe(true)
        expect(dl.classList.contains("md:grid-cols-ds-kv"), "md:grid-cols-ds-kv").toBe(true)
    })
})
