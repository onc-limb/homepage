// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { PREFERS_DARK_QUERY, THEME_STORAGE_KEY, resolveTheme } from "@/lib/theme"
import { themeBootScript } from "../ThemeProvider"

/** Stubs the OS colour scheme; only the dark-scheme query can match. */
function stubOsDark(dark: boolean) {
    vi.stubGlobal("matchMedia", (query: string) => ({ matches: dark && query === PREFERS_DARK_QUERY, media: query }))
}

/** Runs the inline script the way the browser does: as standalone source, without module scope. */
function runBoot() {
    new Function(themeBootScript)()
}
const applied = () => document.documentElement.getAttribute("data-theme")

beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute("data-theme")
})
afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    localStorage.clear()
    document.documentElement.removeAttribute("data-theme")
})

describe("themeBootScript", () => {
    it("is built from the resolveTheme definition", () => {
        expect(themeBootScript).toContain(resolveTheme.toString())
    })

    it.each([
        [true, "dark"],
        [false, "light"],
    ])("follows the OS setting when nothing is saved (prefers dark: %s)", (dark, expected) => {
        stubOsDark(dark)
        runBoot()
        expect(applied()).toBe(expected)
    })

    it.each([
        ["light", true],
        ["dark", false],
    ])("prefers the saved choice %s over the OS setting", (saved, dark) => {
        localStorage.setItem(THEME_STORAGE_KEY, saved)
        stubOsDark(dark)
        runBoot()
        expect(applied()).toBe(saved)
    })

    it("ignores an invalid saved value and follows the OS setting", () => {
        localStorage.setItem(THEME_STORAGE_KEY, "auto")
        stubOsDark(false)
        runBoot()
        expect(applied()).toBe("light")
    })

    it("follows the OS setting when localStorage throws", () => {
        vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
            throw new Error("blocked")
        })
        stubOsDark(false)
        runBoot()
        expect(applied()).toBe("light")
    })
})
