"use client"

import {
    createContext,
    useCallback,
    useContext,
    useSyncExternalStore,
} from "react"
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

/**
 * `<html data-theme>` を唯一の情報源として購読する。
 * 属性は hydration 前に themeBootScript が localStorage から復元しているので、
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

function getThemeSnapshot(): Theme {
    const applied = document.documentElement.getAttribute("data-theme")
    return isTheme(applied) ? applied : DEFAULT_THEME
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
 * SSR 直後 (React hydration 前) に `<html data-theme>` を設定して FOUC を防ぐ。
 */
export const themeBootScript = `(function(){try{var k='${THEME_STORAGE_KEY}';var s=localStorage.getItem(k);var t=(s==='dark'||s==='light')?s:'${DEFAULT_THEME}';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','${DEFAULT_THEME}');}})();`
