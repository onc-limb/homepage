"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"
import {
    DEFAULT_THEME,
    THEME_STORAGE_KEY,
    isTheme,
    type Theme,
} from "@/lib/theme"

interface ThemeContextValue {
    theme: Theme
    setTheme: (theme: Theme) => void
    toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME)

    // Sync client state with what the inline boot script already wrote to <html>.
    useEffect(() => {
        const stored =
            typeof window !== "undefined"
                ? window.localStorage.getItem(THEME_STORAGE_KEY)
                : null
        const initial: Theme = isTheme(stored) ? stored : DEFAULT_THEME
        setThemeState(initial)
        applyTheme(initial)
    }, [])

    const setTheme = useCallback((next: Theme) => {
        setThemeState(next)
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
 * SSR 直後 (React hydration 前) に `<html data-theme>` を設定して FOUC を防ぐ。
 */
export const themeBootScript = `(function(){try{var k='${THEME_STORAGE_KEY}';var s=localStorage.getItem(k);var t=(s==='dark'||s==='light')?s:'${DEFAULT_THEME}';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','${DEFAULT_THEME}');}})();`
