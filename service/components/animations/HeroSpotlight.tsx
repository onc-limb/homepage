"use client"

import { useEffect, useRef } from "react"

/**
 * docs/design/top.html の `.hero__spotlight` を React 化。
 * 親要素 (.hero) の mousemove で `--mx` `--my` を更新し、radial gradient を追従させる。
 */
export function HeroSpotlight() {
    const ref = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const el = ref.current
        if (!el) return
        const hero = el.parentElement
        if (!hero) return

        function onMove(e: MouseEvent) {
            if (!hero || !el) return
            const rect = hero.getBoundingClientRect()
            const x = ((e.clientX - rect.left) / rect.width) * 100
            const y = ((e.clientY - rect.top) / rect.height) * 100
            el.style.setProperty("--mx", `${x}%`)
            el.style.setProperty("--my", `${y}%`)
        }

        hero.addEventListener("mousemove", onMove)
        return () => hero.removeEventListener("mousemove", onMove)
    }, [])

    return (
        <div
            ref={ref}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[1] transition-[background] duration-200"
            style={{
                background:
                    "radial-gradient(600px circle at var(--mx, 50%) var(--my, 40%), color-mix(in srgb, var(--accent) 12%, transparent), transparent 70%)",
            }}
        />
    )
}
