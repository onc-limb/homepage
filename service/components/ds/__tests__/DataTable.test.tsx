// @vitest-environment jsdom
import { describe, expect, it } from "vitest"

import { DataTable } from "../DataTable"
import { render } from "./render"

const COLUMNS = [
    { key: "name", header: "名前" },
    { key: "level", header: "レベル" },
    { key: "years", header: "年数" },
] as const

// Row keys are deliberately in a different order from the columns.
const ROWS = [
    { years: "5", level: "上級", name: "TypeScript" },
    { years: "2", level: "中級", name: "Rust" },
]

describe("DataTable", () => {
    it("renders the column headers as th in thead, in column order", () => {
        const root = render(<DataTable columns={COLUMNS} rows={ROWS} />)
        const table = root.querySelector("table")
        expect(table).not.toBeNull()

        const headers = Array.from(table!.querySelectorAll("thead th"))
        expect(headers.map((th) => th.textContent)).toEqual(["名前", "レベル", "年数"])
        for (const th of headers) expect(th.getAttribute("scope")).toBe("col")
        expect(table!.querySelectorAll("thead td")).toHaveLength(0)
    })

    it("renders one tbody row per data row with cells in column order", () => {
        const root = render(<DataTable columns={COLUMNS} rows={ROWS} />)
        const rows = Array.from(root.querySelectorAll("table > tbody > tr"))
        expect(rows.map((tr) => Array.from(tr.children).map((td) => td.textContent))).toEqual([
            ["TypeScript", "上級", "5"],
            ["Rust", "中級", "2"],
        ])
        expect(root.querySelectorAll("tbody td")).toHaveLength(ROWS.length * COLUMNS.length)
        expect(root.querySelectorAll("tbody th")).toHaveLength(0)
    })

    it("draws 1px ds borders on every cell without decoration", () => {
        const root = render(<DataTable columns={COLUMNS} rows={ROWS} />)
        for (const cell of Array.from(root.querySelectorAll("th, td"))) {
            expect(cell.classList.contains("border"), "border").toBe(true)
            expect(cell.classList.contains("border-ds-border"), "border-ds-border").toBe(true)
        }
        const classes = Array.from(root.querySelectorAll("[class]")).flatMap((el) =>
            Array.from(el.classList)
        )
        expect(classes.filter((cls) => /^(rounded|shadow)/.test(cls))).toEqual([])
    })

    it("scrolls horizontally inside the table's own wrapper only", () => {
        const root = render(<DataTable columns={COLUMNS} rows={ROWS} />)
        const table = root.querySelector("table")!
        const wrapper = table.parentElement!
        expect(wrapper).not.toBe(root)
        expect(wrapper.classList.contains("overflow-x-auto"), "overflow-x-auto").toBe(true)
        expect(wrapper.classList.contains("w-full"), "w-full").toBe(true)
        expect(table.classList.contains("overflow-x-auto")).toBe(false)
    })
})
