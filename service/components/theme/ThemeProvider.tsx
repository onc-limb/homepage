"use client"

import {
    createContext,
    useCallback,
    useContext,
    useSyncExternalStore,
} from "react"
import {
    DEFAULT_THEME,
    PREFERS_DARK_QUERY,
    THEMES,
    THEME_STORAGE_KEY,
    isTheme,
    resolveTheme,
    type Theme,
} from "@/lib/theme"

interface ThemeContextValue {
    theme: Theme
    setTheme: (theme: Theme) => void
    toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

/**
 * `<html data-theme>` に適用済みのテーマを購読する。
 * themeBootScript が hydration 前に初期テーマを適用するので、
 * effect で state を同期し直す必要がない（React 19 の
 * react-hooks/set-state-in-effect が禁じるカスケードレンダーを避ける）。
 */
function subscribeToTheme(onStoreChange: () => void): () => void {
    document.addEventListener("themechange", onStoreChange)
    window.addEventListener("storage", onStoreChange)
    return () => {
        document.removeEventListener("themechange", onStoreChange)
        window.removeEventListener("storage", onStoreChange)
    }
}

function readSavedTheme(): Theme | null {
    try {
        const saved = window.localStorage.getItem(THEME_STORAGE_KEY)
        return isTheme(saved) ? saved : null
    } catch {
        // Storage may be blocked; the OS preference still supplies a default.
        return null
    }
}

function getThemeSnapshot(): Theme {
    const applied = document.documentElement.getAttribute("data-theme")
    return isTheme(applied)
        ? applied
        : resolveTheme(readSavedTheme(), window.matchMedia(PREFERS_DARK_QUERY).matches)
}

function getThemeServerSnapshot(): Theme {
    return DEFAULT_THEME
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const theme = useSyncExternalStore(
        subscribeToTheme,
        getThemeSnapshot,
        getThemeServerSnapshot,
    )

    const setTheme = useCallback((next: Theme) => {
        // applyTheme が themechange を発火し、購読側が再レンダーを起こす。
        applyTheme(next)
        window.localStorage.setItem(THEME_STORAGE_KEY, next)
    }, [])

    const toggleTheme = useCallback(() => {
        setTheme(theme === "dark" ? "light" : "dark")
    }, [theme, setTheme])

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme(): ThemeContextValue {
    const ctx = useContext(ThemeContext)
    if (!ctx) {
        throw new Error("useTheme must be used within a ThemeProvider")
    }
    return ctx
}

function applyTheme(theme: Theme): void {
    document.documentElement.setAttribute("data-theme", theme)
    document.dispatchEvent(new CustomEvent("themechange", { detail: theme }))
}

/**
 * `<head>` に直接埋め込む inline script。
 * React hydration 前に保存値または OS 設定で `<html data-theme>` を設定して FOUC を防ぐ。
 */
export const themeBootScript = `(function () {
    var resolveTheme = ${resolveTheme.toString()};
    var saved = null;
    try {
        saved = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    } catch {
        // Storage may be blocked; the OS preference still supplies a default.
    }
    if (${JSON.stringify(THEMES)}.indexOf(saved) < 0) saved = null;
    var prefersDark = window.matchMedia(${JSON.stringify(PREFERS_DARK_QUERY)}).matches;
    document.documentElement.setAttribute("data-theme", resolveTheme(saved, prefersDark));
})();`
