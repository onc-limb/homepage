// @vitest-environment jsdom
import React, { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { ContactFormState } from "@/lib/contact-form-state"

const mock = vi.hoisted(() => ({
    state: { status: "idle" } as ContactFormState,
    action: vi.fn(),
}))
vi.mock("react", async (importOriginal) => ({
    ...(await importOriginal<typeof import("react")>()),
    useActionState: () => [mock.state, mock.action, false],
}))
vi.mock("@/app/contact/actions", () => ({ submitContactAction: mock.action }))

import { ContactForm } from "@/app/contact/ContactForm"

let container: HTMLDivElement
let root: Root
beforeEach(async () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true)
    mock.state = { status: "idle" }
    mock.action.mockClear()
    container = document.createElement("div")
    document.body.append(container)
    root = createRoot(container)
    await act(async () => root.render(<ContactForm />))
})
afterEach(async () => {
    await act(async () => root.unmount())
    container.remove()
    vi.unstubAllGlobals()
})
const textarea = () => container.querySelector("textarea")!
const description = () =>
    textarea()
        .getAttribute("aria-describedby")!
        .split(" ")
        .map((id) => document.getElementById(id)!.textContent)
        .join(" ")
async function input(value: string) {
    await act(async () => {
        Object.getOwnPropertyDescriptor(
            HTMLTextAreaElement.prototype,
            "value"
        )!.set!.call(textarea(), value)
        textarea().dispatchEvent(new Event("input", { bubbles: true }))
    })
}

describe("contact message guidance", () => {
    it("associates the limits and initial count with the textarea", () => {
        expect(textarea().maxLength).toBe(2000)
        expect(description()).toContain("10〜2000文字")
        expect(description()).toContain("入力文字数: 0 / 2000")
        expect(container.querySelector('[role="status"]')!.textContent).toBe("")
    })

    it("counts UTF-16 input like maxlength, announces the limit, and recovers after editing", async () => {
        await input("あ😀")
        expect(description()).toContain("入力文字数: 3 / 2000")
        await input("あ".repeat(2000))
        expect(description()).toContain("入力文字数: 2000 / 2000")
        expect(container.querySelector('[role="status"]')!.textContent).toContain(
            "上限に達しました"
        )
        await input("修正した合成データ")
        expect(description()).toContain(`入力文字数: ${textarea().value.length} / 2000`)
        expect(container.querySelector('[role="status"]')!.textContent).toBe("")
        expect(mock.action).not.toHaveBeenCalled()
    })

    it("restores returned input and keeps both hint and error descriptions", async () => {
        await input("編集中の合成データ")
        mock.state = {
            status: "error",
            message: "合成エラー",
            fieldErrors: { message: ["合成の本文エラー"] },
            values: {
                name: "Fixture",
                email: "test@example.invalid",
                company: "",
                category: "work",
                message: "あ".repeat(2001),
            },
        }
        await act(async () => root.render(<ContactForm />))
        expect(textarea().value).toHaveLength(2001)
        expect(textarea().getAttribute("aria-invalid")).toBe("true")
        expect(description()).toContain("10〜2000文字")
        expect(description()).toContain("入力文字数: 2001 / 2000")
        expect(description()).toContain("合成の本文エラー")
        await input("修正後の合成テキスト")
        await act(async () => root.render(<ContactForm />))
        expect(textarea().value).toBe("修正後の合成テキスト")
        expect(mock.action).not.toHaveBeenCalled()
    })
})
