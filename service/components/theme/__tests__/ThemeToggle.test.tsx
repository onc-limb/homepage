// @vitest-environment jsdom
import { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { NARROW_SCREEN_ONLY, WIDE_SCREEN_ONLY_INLINE } from "@/components/ds/screen-styles"
import { PREFERS_DARK_QUERY, THEME_STORAGE_KEY } from "@/lib/theme"
import { ThemeProvider } from "../ThemeProvider"
import { ThemeToggle } from "../ThemeToggle"

let container: HTMLDivElement
let root: Root

/** Stubs the OS colour scheme; only the dark-scheme query can match. */
function stubOsDark(dark: boolean) {
    vi.stubGlobal("matchMedia", (query: string) => ({ matches: dark && query === PREFERS_DARK_QUERY, media: query }))
}

function button(): HTMLButtonElement {
    const buttons = container.querySelectorAll("button")
    expect(buttons).toHaveLength(1)
    return buttons[0]
}

/** The single element under the button carrying every class of `classes`. */
function withClasses(classes: string): HTMLElement {
    const tokens = classes.split(/\s+/).filter(Boolean)
    const found = Array.from(button().querySelectorAll<HTMLElement>("*")).filter((el) =>
        tokens.every((t) => el.classList.contains(t))
    )
    expect(found, classes).toHaveLength(1)
    return found[0]
}
const wideLabel = () => withClasses(WIDE_SCREEN_ONLY_INLINE).textContent
const narrowLabel = () => withClasses(NARROW_SCREEN_ONLY).textContent

async function renderToggle() {
    await act(async () =>
        root.render(
            <ThemeProvider>
                <ThemeToggle />
            </ThemeProvider>
        )
    )
}

beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true)
    localStorage.clear()
    document.documentElement.removeAttribute("data-theme")
    stubOsDark(false)
    container = document.createElement("div")
    document.body.append(container)
    root = createRoot(container)
})
afterEach(async () => {
    await act(async () => root.unmount())
    container.remove()
    localStorage.clear()
    document.documentElement.removeAttribute("data-theme")
    vi.unstubAllGlobals()
})

describe("ThemeToggle label", () => {
    it.each([
        ["light", "表示: ライト", "ライト"],
        ["dark", "表示: ダーク", "ダーク"],
    ])("shows the current theme %s as a small door with wide and narrow texts", async (theme, wide, narrow) => {
        document.documentElement.setAttribute("data-theme", theme)
        await renderToggle()
        expect(button().getAttribute("type")).toBe("button")
        const doorClasses = [button(), ...Array.from(button().querySelectorAll("*"))].flatMap((e) =>
            Array.from(e.classList)
        )
        expect(doorClasses.filter((c) => c === "border-ds-door"), "small door frame").toHaveLength(1)
        expect(doorClasses, "not the large door").not.toContain("border-ds-door-lg")
        expect(button().querySelector("svg"), "no icons").toBeNull()
        expect(button().hasAttribute("aria-label")).toBe(false)
        expect(wideLabel()).toBe(wide)
        expect(narrowLabel()).toBe(narrow)
        expect(withClasses(WIDE_SCREEN_ONLY_INLINE).classList.contains(NARROW_SCREEN_ONLY)).toBe(false)
    })

    it("no longer uses the theme-toggle class", async () => {
        await renderToggle()
        expect(container.querySelector('[class*="theme-toggle"]')).toBeNull()
    })
})

describe("ThemeToggle switching", () => {
    it("switches data-theme, saves the choice and updates the label", async () => {
        document.documentElement.setAttribute("data-theme", "dark")
        await renderToggle()
        await act(async () => button().click())
        expect(document.documentElement.getAttribute("data-theme")).toBe("light")
        expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light")
        expect(narrowLabel()).toBe("ライト")
        expect(wideLabel()).toBe("表示: ライト")
        await act(async () => button().click())
        expect(document.documentElement.getAttribute("data-theme")).toBe("dark")
        expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark")
        expect(narrowLabel()).toBe("ダーク")
    })
})

describe("ThemeProvider without a saved choice", () => {
    it.each([
        [false, "ライト"],
        [true, "ダーク"],
    ])("follows the OS setting (prefers dark: %s)", async (dark, narrow) => {
        stubOsDark(dark)
        await renderToggle()
        expect(narrowLabel()).toBe(narrow)
    })
})
