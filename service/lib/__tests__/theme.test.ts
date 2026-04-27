import { describe, it, expect } from "vitest"
import {
    THEME_STORAGE_KEY,
    DEFAULT_THEME,
    THEMES,
    isTheme,
    type Theme,
} from "@/lib/theme"

/**
 * Theme module contract tests.
 *
 * The new lib/theme.ts module mirrors the constants from
 * docs/design/shared/shell.js so the React + Tailwind site can drive
 * `<html data-theme="...">` exactly like the prototype.
 *
 * Reference: docs/design/shared/shell.js:6-15, docs/design/shared/tokens.css
 */
describe("lib/theme", () => {
    it("uses 'onclimb-theme' as the localStorage key", () => {
        // Given existing prototype users may have a theme persisted under this key
        // When THEME_STORAGE_KEY is read
        // Then it matches the value used by the design prototype
        expect(THEME_STORAGE_KEY).toBe("onclimb-theme")
    })

    it("defaults to dark theme to match the design draft", () => {
        // Given the design tokens establish dark as the default scheme
        // When DEFAULT_THEME is read
        // Then it is "dark"
        expect(DEFAULT_THEME).toBe("dark")
    })

    it("exposes exactly the two supported themes", () => {
        // Given the prototype only switches between dark and light
        // When THEMES is enumerated
        // Then it lists "dark" and "light" without any third value
        expect([...THEMES].sort()).toEqual(["dark", "light"].sort())
        expect(THEMES).toHaveLength(2)
    })

    describe("isTheme()", () => {
        it("returns true for a supported theme value", () => {
            // Given "dark" is a supported theme
            // When isTheme is called
            // Then it returns true
            expect(isTheme("dark")).toBe(true)
            expect(isTheme("light")).toBe(true)
        })

        it("returns false for unknown values", () => {
            // Given a value outside the THEMES tuple
            // When isTheme is called
            // Then it returns false
            expect(isTheme("auto")).toBe(false)
            expect(isTheme("Dark")).toBe(false)
            expect(isTheme("")).toBe(false)
            expect(isTheme(null)).toBe(false)
            expect(isTheme(undefined)).toBe(false)
            expect(isTheme(0 as unknown as string)).toBe(false)
        })

        it("narrows the input type to Theme on success", () => {
            // Given TypeScript narrowing is the main reason for isTheme to exist
            // When the guard succeeds inside an `if`
            // Then the value is typed as Theme without further casts
            const candidate: unknown = "light"
            if (isTheme(candidate)) {
                const theme: Theme = candidate
                expect(theme).toBe("light")
            } else {
                throw new Error("isTheme should accept 'light'")
            }
        })
    })
})
