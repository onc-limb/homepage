// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest"

import { render } from "./render"

// Observe how Prose hands code blocks to CodeBlock.
const { codeBlock } = vi.hoisted(() => ({
    codeBlock: vi.fn(({ code }: { code: string; prompt?: string }) => (
        <pre data-part="codeblock">
            <code>{code}</code>
        </pre>
    )),
}))
vi.mock("../CodeBlock", () => ({ CodeBlock: codeBlock }))

import { Prose } from "../Prose"

const renderProse = (markdown: string) => render(<Prose markdown={markdown} />)

/** The `code` prop of every CodeBlock call, in order. */
const codeBlockCodes = () => codeBlock.mock.calls.map(([props]) => props.code)

beforeEach(() => {
    codeBlock.mockClear()
})

describe("Prose", () => {
    describe("styling", () => {
        it("sets the prose font, line height and measure on the root", () => {
            const root = renderProse("本文")
            const prose = root.firstElementChild!
            for (const cls of ["font-ds-prose", "leading-ds-prose", "max-w-ds-measure"]) {
                expect(prose.classList.contains(cls), cls).toBe(true)
            }
            expect(prose.classList.contains("prose")).toBe(false)
            expect(root.querySelector("p")?.textContent).toBe("本文")
        })

        it("renders headings with the ds font", () => {
            const root = renderProse("# 見出し\n\n## 小見出し")
            const h1 = root.querySelector("h1")
            const h2 = root.querySelector("h2")
            expect(h1?.textContent).toBe("見出し")
            expect(h2?.textContent).toBe("# 小見出し")
            expect(h1!.classList.contains("font-ds"), "h1 font-ds").toBe(true)
            expect(h2!.classList.contains("font-ds"), "h2 font-ds").toBe(true)
        })

        it("marks h2-h4 with #, ## and ###, hidden from screen readers", () => {
            const root = renderProse("## 概要\n\n### コンポーネント\n\n#### Frontend")
            const marks = ["h2", "h3", "h4"].map((tagName) => {
                const marker = root.querySelector(`${tagName} > span[aria-hidden="true"]`)
                return marker?.textContent
            })
            expect(marks).toEqual(["# ", "## ", "### "])
            expect(root.querySelector("h4")!.classList.contains("text-ds-fg")).toBe(true)
        })

        it("renders lists with visible markers", () => {
            const root = renderProse("- a\n- b\n\n1. x\n2. y")
            const ul = root.querySelector("ul")
            const ol = root.querySelector("ol")
            expect(ul?.classList.contains("list-disc")).toBe(true)
            expect(ol?.classList.contains("list-decimal")).toBe(true)
            expect(Array.from(ul!.querySelectorAll("li")).map((li) => li.textContent)).toEqual([
                "a",
                "b",
            ])
        })

        it("renders a blockquote with a ds border", () => {
            const root = renderProse("> 引用")
            const quote = root.querySelector("blockquote")
            expect(quote).not.toBeNull()
            expect(quote!.textContent).toContain("引用")
            expect(quote!.classList.contains("border"), "border").toBe(true)
            expect(quote!.classList.contains("border-ds-border"), "border-ds-border").toBe(true)
        })

        it("renders GFM tables and strikethrough (remark-gfm is enabled)", () => {
            const root = renderProse("| 名前 | 年数 |\n| --- | --- |\n| Rust | 2 |\n\n~~古い~~")
            const table = root.querySelector("table")
            expect(table).not.toBeNull()
            expect(Array.from(table!.querySelectorAll("thead th")).map((th) => th.textContent)).toEqual(
                ["名前", "年数"]
            )
            expect(table!.parentElement!.classList.contains("overflow-x-auto")).toBe(true)
            for (const cell of Array.from(table!.querySelectorAll("th, td"))) {
                expect(cell.classList.contains("border-ds-border"), "cell border").toBe(true)
            }
            expect(root.querySelector("del")?.textContent).toBe("古い")
        })
    })

    describe("code", () => {
        it("passes fenced, indented and unclosed code blocks to CodeBlock as text", () => {
            const cases: Array<[string, string]> = [
                ["```ts\nconst a = 1\n```", "const a = 1"],
                ["    ls -l", "ls -l"],
                ["```\nunclosed", "unclosed"],
            ]
            for (const [markdown, code] of cases) {
                codeBlock.mockClear()
                renderProse(markdown)
                expect(codeBlock, markdown).toHaveBeenCalledTimes(1)
                expect(codeBlockCodes(), markdown).toEqual([code])
            }
        })

        it("keeps inline code in the paragraph without using CodeBlock", () => {
            const root = renderProse("run `pnpm test` now")
            expect(codeBlock).not.toHaveBeenCalled()
            expect(root.querySelector("p code")?.textContent).toBe("pnpm test")
            expect(root.querySelector("pre")).toBeNull()
        })
    })

    describe("raw HTML", () => {
        it("does not render HTML tags written in the text as elements", () => {
            const root = renderProse(
                'a <b>bold</b> c\n\n<div class="x">y</div>\n\n<script>alert(1)</script>\n\n<!-- c -->\n\n**strong**'
            )
            expect(root.querySelector("b"), "b").toBeNull()
            expect(root.querySelector("div.x"), "div.x").toBeNull()
            expect(root.querySelector("script"), "script").toBeNull()
            expect(root.querySelectorAll("strong")).toHaveLength(1)

            const walker = document.createTreeWalker(root, NodeFilter.SHOW_COMMENT)
            const comments: string[] = []
            while (walker.nextNode()) comments.push(walker.currentNode.nodeValue ?? "")
            expect(comments.map((c) => c.trim()).filter(Boolean)).toEqual([])
        })

        it("keeps HTML tags inside code as text", () => {
            const root = renderProse("```html\n<b>x</b>\n```\n\n~~~\n<i>y</i>\n~~~\n\n`<u>z</u>`")
            expect(codeBlockCodes()).toEqual(["<b>x</b>", "<i>y</i>"])
            expect(root.querySelector("p code")?.textContent).toBe("<u>z</u>")
            expect(root.querySelector("b, i, u"), "b / i / u").toBeNull()
        })
    })
})
