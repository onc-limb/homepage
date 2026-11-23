// @vitest-environment jsdom
import React, { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { ContactFormState } from "@/lib/contact-form-state"

const mock = vi.hoisted(() => ({
    state: { status: "idle" } as ContactFormState,
    action: vi.fn(),
    pending: false,
}))
vi.mock("react", async (importOriginal) => ({
    ...(await importOriginal<typeof import("react")>()),
    useActionState: () => [mock.state, mock.action, mock.pending],
}))
vi.mock("@/app/1f/contact/actions", () => ({ submitContactAction: mock.action }))

import { ContactForm } from "@/app/1f/contact/ContactForm"

let container: HTMLDivElement
let root: Root
beforeEach(async () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true)
    mock.state = { status: "idle" }
    mock.pending = false
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

const ERROR_STATE: ContactFormState = {
    status: "error",
    message: "合成エラー",
    fieldErrors: {
        name: ["合成の名前エラー"],
        email: ["合成のメールエラー"],
        company: ["合成の組織名エラー"],
        category: ["合成の種別エラー"],
        message: ["合成の本文エラー"],
    },
    values: { name: "", email: "", company: "", category: "work", message: "" },
}

async function renderState(state: ContactFormState, pending = false) {
    mock.state = state
    mock.pending = pending
    await act(async () => root.render(<ContactForm />))
}

/** Self-and-descendant class names under `el`. */
function allClasses(el: Element): string[] {
    return [el, ...Array.from(el.querySelectorAll("*"))].flatMap((e) => Array.from(e.classList))
}

// Old-design tokens, shadcn looks, decoration, opacity, and raw values instead of --ds-* tokens.
const BANNED_CLASS =
    /hairline|bg-elev|surface-solid|rounded|shadow|gradient|backdrop|red-|^btn|^text-fg|^text-accent$|ring-|opacity|\/\d+$|\[|^-?[mp][xytrbl]?-\d|^gap(-[xy])?-\d|^text-(xs|sm|base|lg|xl)$|^leading-(relaxed|\d)/

const submitButton = () => container.querySelector<HTMLButtonElement>('button[type="submit"]')!

describe("contact form look", () => {
    it.each([
        ["idle", { status: "idle" } as ContactFormState],
        ["error", ERROR_STATE],
        ["success", { status: "success" } as ContactFormState],
    ])("draws the %s state with ds tokens only and no decoration", async (_name, state) => {
        await renderState(state)
        const banned = allClasses(container).filter((c) => BANNED_CLASS.test(c))
        expect(banned).toEqual([])
        expect(container.querySelector("[style]"), "no inline styles").toBeNull()
        expect(container.querySelector("svg"), "no icons").toBeNull()
    })

    it("shows the form-level error and every field error in the error state", async () => {
        await renderState(ERROR_STATE)
        expect(container.querySelector('[role="alert"]')!.textContent).toBe("合成エラー")
        for (const field of ["name", "email", "company", "category", "message"]) {
            const message = ERROR_STATE.status === "error" ? ERROR_STATE.fieldErrors![field]![0] : ""
            expect(container.textContent, field).toContain(message)
        }
    })

    it("shows the sent message in the success state without the form", async () => {
        await renderState({ status: "success" })
        expect(container.querySelector("form")).toBeNull()
        expect(container.querySelector('[role="status"]')!.textContent).toContain("送信しました")
    })
})

describe("contact form submit door", () => {
    it("is a small primary DoorButton with the accent frame", () => {
        const button = submitButton()
        expect(button).not.toBeNull()
        expect(button.getAttribute("data-primary")).toBe("true")
        expect(button.classList.contains("border-ds-door")).toBe(true)
        expect(button.classList.contains("border-ds-accent")).toBe(true)
        expect(container.querySelector(".border-ds-door-lg")).toBeNull()
        expect(button.disabled).toBe(false)
        expect(button.textContent).toContain("送信する")
    })

    it("cannot be pressed and reads 送信中... while the action is pending", async () => {
        await renderState({ status: "idle" }, true)
        const button = submitButton()
        expect(button.disabled).toBe(true)
        expect(button.textContent).toContain("送信中...")
        expect(button.textContent).not.toContain("送信する")
        expect(button.getAttribute("data-primary")).toBe("true")
    })
})
