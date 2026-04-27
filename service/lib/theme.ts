/**
 * Theme constants mirroring docs/design/shared/shell.js so React/Tailwind
 * can drive `<html data-theme="...">` exactly like the prototype.
 */
export const THEME_STORAGE_KEY = "onclimb-theme"

export const THEMES = ["dark", "light"] as const
export type Theme = (typeof THEMES)[number]

export const DEFAULT_THEME: Theme = "dark"

export function isTheme(value: unknown): value is Theme {
    return typeof value === "string" && (THEMES as readonly string[]).includes(value)
}
