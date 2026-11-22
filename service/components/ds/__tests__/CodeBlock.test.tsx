// @vitest-environment jsdom
import { describe, expect, it } from "vitest"

import { CodeBlock } from "../CodeBlock"
import { closestClass, elementWithText, render } from "./render"

const TEXT_COLOR = /^text-ds-(?!(sm|base|lg|xl)$)/
const WRAPPING = /^(whitespace-pre-wrap|whitespace-normal|break-all|break-words)$/

describe("CodeBlock", () => {
    it("renders the code inside pre > code, keeping line breaks", () => {
        const root = render(<CodeBlock code={"line 1\n  line 2"} />)
        const code = root.querySelector("pre > code")
        expect(code).not.toBeNull()
        expect(code!.textContent).toBe("line 1\n  line 2")
    })

    it("shows the prompt once, muted, at the start of the code", () => {
        const root = render(<CodeBlock prompt="$ " code="pnpm --dir service test" />)
        const code = root.querySelector("pre > code")!
        expect(code.textContent).toBe("$ pnpm --dir service test")

        const prompt = elementWithText(code, "$ ")
        expect(prompt, "element holding the prompt").toBeDefined()
        expect(closestClass(prompt!, TEXT_COLOR, root)).toBe("text-ds-fg-muted")
    })

    it("renders no prompt element when no prompt is given", () => {
        const root = render(<CodeBlock code="ls -l" />)
        const code = root.querySelector("pre > code")!
        expect(code.textContent).toBe("ls -l")
        expect(code.children).toHaveLength(0)
    })

    it("scrolls long lines inside the pre instead of wrapping", () => {
        const root = render(<CodeBlock code={"x".repeat(400)} />)
        const pre = root.querySelector("pre")!
        expect(pre.classList.contains("overflow-x-auto"), "overflow-x-auto").toBe(true)
        const classes = Array.from(root.querySelectorAll("[class]")).flatMap((el) =>
            Array.from(el.classList)
        )
        expect(classes.filter((cls) => WRAPPING.test(cls))).toEqual([])
    })
})
