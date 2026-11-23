"use client"

import { DoorButton } from "@/components/ds/DoorButton"
import { NARROW_SCREEN_ONLY, WIDE_SCREEN_ONLY_INLINE } from "@/components/ds/screen-styles"
import type { Theme } from "@/lib/theme"
import { useTheme } from "./ThemeProvider"

const THEME_LABELS: Record<Theme, string> = {
    dark: "ダーク",
    light: "ライト",
}

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme()
    const label = THEME_LABELS[theme]

    return (
        <DoorButton onClick={toggleTheme}>
            <span className={WIDE_SCREEN_ONLY_INLINE}>表示: {label}</span>
            <span className={NARROW_SCREEN_ONLY}>{label}</span>
        </DoorButton>
    )
}
