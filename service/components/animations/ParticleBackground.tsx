"use client"

import { useEffect, useRef } from "react"
import { DEFAULT_THEME, THEME_STORAGE_KEY, isTheme, type Theme } from "@/lib/theme"

interface Particle {
    x: number
    y: number
    vx: number
    vy: number
    z: number
}

/**
 * docs/design/shared/shell.js:131-218 を React 化したもの。
 * - canvas.clientWidth/Height で resize
 * - dpr は Math.min(devicePixelRatio, 2)
 * - mouse 反応で粒子を引き寄せ + glow
 * - themechange イベント追従でアクセント色を切替
 */
export function ParticleBackground() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        let w = 0
        let h = 0
        let particles: Particle[] = []
        let theme: Theme = readTheme()
        const mouse = { x: -9999, y: -9999, active: false }
        let rafId = 0

        function resize() {
            if (!canvas || !ctx) return
            w = canvas.clientWidth
            h = canvas.clientHeight
            canvas.width = w * dpr
            canvas.height = h * dpr
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
            const target = Math.floor((w * h) / 14000)
            particles = Array.from({ length: target }, () => ({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.18,
                vy: (Math.random() - 0.5) * 0.18,
                z: Math.random() * 0.7 + 0.3,
            }))
        }

        function onThemeChange(e: Event) {
            const detail = (e as CustomEvent<Theme>).detail
            if (isTheme(detail)) theme = detail
        }
        function onMouseMove(e: MouseEvent) {
            mouse.x = e.clientX
            mouse.y = e.clientY
            mouse.active = true
        }
        function onMouseLeave() {
            mouse.active = false
        }

        function frame() {
            if (!ctx) return
            const accent =
                theme === "light" ? [47, 107, 224] : [123, 164, 245]
            const alphaBase = theme === "light" ? 0.45 : 0.7
            ctx.clearRect(0, 0, w, h)
            if (mouse.active) {
                const grad = ctx.createRadialGradient(
                    mouse.x,
                    mouse.y,
                    0,
                    mouse.x,
                    mouse.y,
                    280,
                )
                grad.addColorStop(
                    0,
                    `rgba(${accent[0]},${accent[1]},${accent[2]},${theme === "light" ? 0.1 : 0.18})`,
                )
                grad.addColorStop(1, "rgba(0,0,0,0)")
                ctx.fillStyle = grad
                ctx.fillRect(0, 0, w, h)
            }
            for (const p of particles) {
                if (mouse.active) {
                    const dx = mouse.x - p.x
                    const dy = mouse.y - p.y
                    const d2 = dx * dx + dy * dy
                    if (d2 < 200 * 200) {
                        const f = (1 - Math.sqrt(d2) / 200) * 0.06
                        p.vx += (dx / Math.sqrt(d2 + 1)) * f
                        p.vy += (dy / Math.sqrt(d2 + 1)) * f
                    }
                }
                p.vx *= 0.96
                p.vy *= 0.96
                p.x += p.vx
                p.y += p.vy
                if (p.x < 0) p.x = w
                if (p.x > w) p.x = 0
                if (p.y < 0) p.y = h
                if (p.y > h) p.y = 0
                ctx.fillStyle = `rgba(${accent[0]},${accent[1]},${accent[2]},${alphaBase * p.z * 0.35})`
                ctx.beginPath()
                ctx.arc(p.x, p.y, p.z * 1.6, 0, Math.PI * 2)
                ctx.fill()
            }
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const a = particles[i]
                    const b = particles[j]
                    const dx = a.x - b.x
                    const dy = a.y - b.y
                    const d = dx * dx + dy * dy
                    if (d < 110 * 110) {
                        const o = (1 - Math.sqrt(d) / 110) * 0.18 * alphaBase
                        ctx.strokeStyle = `rgba(${accent[0]},${accent[1]},${accent[2]},${o})`
                        ctx.lineWidth = 0.6
                        ctx.beginPath()
                        ctx.moveTo(a.x, a.y)
                        ctx.lineTo(b.x, b.y)
                        ctx.stroke()
                    }
                }
            }
            rafId = requestAnimationFrame(frame)
        }

        resize()
        rafId = requestAnimationFrame(frame)
        window.addEventListener("resize", resize)
        document.addEventListener("themechange", onThemeChange)
        window.addEventListener("mousemove", onMouseMove)
        window.addEventListener("mouseleave", onMouseLeave)

        return () => {
            cancelAnimationFrame(rafId)
            window.removeEventListener("resize", resize)
            document.removeEventListener("themechange", onThemeChange)
            window.removeEventListener("mousemove", onMouseMove)
            window.removeEventListener("mouseleave", onMouseLeave)
        }
    }, [])

    return <canvas ref={canvasRef} className="site-bg-canvas" aria-hidden="true" />
}

function readTheme(): Theme {
    if (typeof window === "undefined") return DEFAULT_THEME
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    return isTheme(stored) ? stored : DEFAULT_THEME
}
