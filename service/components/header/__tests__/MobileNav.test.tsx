// @vitest-environment jsdom
import React, { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { MobileNav } from "../MobileNav"

vi.mock("next/link", () => ({
    default: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}))
vi.mock("@/lib/constants", () => ({
    NAV_ITEMS: [{ label: "Fixture", href: "/fixture" }],
}))
let container: HTMLDivElement
let root: Root
const toggle = () => container.querySelector("button")!
async function click(element: HTMLElement) {
    await act(async () => element.click())
}
async function key(element: HTMLElement, value: string) {
    await act(async () => {
        element.dispatchEvent(new KeyboardEvent("keydown", { key: value, bubbles: true }))
    })
}
beforeEach(async () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true)
    container = document.createElement("div")
    document.body.append(container)
    root = createRoot(container)
    await act(async () => root.render(<MobileNav pathname="/" />))
})
afterEach(async () => {
    await act(async () => root.unmount())
    container.remove()
    vi.unstubAllGlobals()
})

describe("MobileNav disclosure", () => {
    it("exposes the expanded state and associates the open panel", async () => {
        expect(toggle().getAttribute("aria-expanded")).toBe("false")
        expect(toggle().getAttribute("aria-label")).toBe("open menu")
        await click(toggle())
        expect(toggle().getAttribute("aria-expanded")).toBe("true")
        expect(toggle().getAttribute("aria-label")).toBe("close menu")
        const panel = document.getElementById(toggle().getAttribute("aria-controls")!)!
        expect(panel.contains(container.querySelector("a"))).toBe(true)
        await click(toggle())
        expect(toggle().getAttribute("aria-expanded")).toBe("false")
        expect(container.querySelector("a")).toBeNull()
    })

    it("closes from a focused link on Escape and restores focus on every opening", async () => {
        for (let attempt = 0; attempt < 2; attempt++) {
            await click(toggle())
            const link = container.querySelector("a")!
            link.focus()
            await key(link, "ArrowDown")
            expect(container.querySelector("a")).not.toBeNull()
            await key(link, "Escape")
            expect(container.querySelector("a")).toBeNull()
            expect(document.activeElement).toBe(toggle())
            expect(toggle().getAttribute("aria-expanded")).toBe("false")
        }
    })

    it("supports Escape on the trigger and still closes when a link is selected", async () => {
        await click(toggle())
        await key(toggle(), "Escape")
        expect(container.querySelector("a")).toBeNull()
        await click(toggle())
        const link = container.querySelector("a")!
        link.addEventListener("click", (event) => event.preventDefault())
        await click(link)
        expect(container.querySelector("a")).toBeNull()
    })
})
