"use client"

import { useEffect, useRef } from "react"

interface ParticleTitleProps {
    text: string
}

interface ParticleNode {
    tx: number
    ty: number
    x: number
    y: number
    vx: number
    vy: number
    d: number
    f: number
    s: number
    c: boolean
}

/**
 * docs/design/top.html の particle title を React 化。
 * テキストをオフスクリーンに描いてピクセルサンプリングし、粒子の collapse target にする。
 */
export function HeroParticleTitle({ text }: ParticleTitleProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        let w = 0
        let h = 0
        let particles: ParticleNode[] = []
        const mouse = { x: -9999, y: -9999, active: false }
        let rafId = 0
        let resizeT: ReturnType<typeof setTimeout> | null = null

        function getColors() {
            const rs = getComputedStyle(document.documentElement)
            const accent = rs.getPropertyValue("--accent-strong").trim() || "#7BA4F5"
            const fg = rs.getPropertyValue("--fg-strong").trim() || "#FFFFFF"
            return { accent, fg }
        }

        function build() {
            if (!canvas || !ctx) return
            const rect = canvas.getBoundingClientRect()
            w = rect.width
            h = rect.height
            canvas.width = w * dpr
            canvas.height = h * dpr
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

            const off = document.createElement("canvas")
            off.width = w
            off.height = h
            const octx = off.getContext("2d")
            if (!octx) return
            octx.fillStyle = "#fff"
            octx.textAlign = "center"
            octx.textBaseline = "middle"
            const fontSize = Math.min(w * 0.22, h * 1.0)
            octx.font = `700 ${fontSize}px "Geist", "Space Grotesk", "Noto Sans JP", sans-serif`
            octx.fillText(text, w / 2, h / 2)
            const data = octx.getImageData(0, 0, w, h).data

            const targets: { x: number; y: number }[] = []
            const step = Math.max(3, Math.floor(w / 320))
            for (let y = 0; y < h; y += step) {
                for (let x = 0; x < w; x += step) {
                    const a = data[(y * w + x) * 4 + 3]
                    if (a > 128) targets.push({ x, y })
                }
            }
            particles = targets.map((t) => {
                const angle = Math.random() * Math.PI * 2
                const r = Math.max(w, h) * (0.4 + Math.random() * 0.5)
                return {
                    tx: t.x,
                    ty: t.y,
                    x: w / 2 + Math.cos(angle) * r,
                    y: h / 2 + Math.sin(angle) * r,
                    vx: 0,
                    vy: 0,
                    d: Math.random() * 0.05 + 0.04,
                    f: Math.random() * 0.86 + 0.04,
                    s: Math.random() * 1.2 + 0.4,
                    c: Math.random() < 0.18,
                }
            })
        }

        function frame() {
            if (!ctx || !canvas) return
            ctx.clearRect(0, 0, w, h)
            const { accent, fg } = getColors()
            for (const p of particles) {
                if (mouse.active) {
                    const dx = p.x - mouse.x
                    const dy = p.y - mouse.y
                    const d2 = dx * dx + dy * dy
                    if (d2 < 80 * 80) {
                        const f = (1 - Math.sqrt(d2) / 80) * 1.2
                        p.vx += (dx / Math.sqrt(d2 + 1)) * f
                        p.vy += (dy / Math.sqrt(d2 + 1)) * f
                    }
                }
                p.vx += (p.tx - p.x) * p.d
                p.vy += (p.ty - p.y) * p.d
                p.vx *= p.f
                p.vy *= p.f
                p.x += p.vx
                p.y += p.vy

                ctx.fillStyle = p.c ? accent : fg
                ctx.beginPath()
                ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2)
                ctx.fill()
            }
            rafId = requestAnimationFrame(frame)
        }

        function onMouseMove(e: MouseEvent) {
            if (!canvas) return
            const r = canvas.getBoundingClientRect()
            mouse.x = e.clientX - r.left
            mouse.y = e.clientY - r.top
            mouse.active = true
        }
        function onMouseLeave() {
            mouse.active = false
        }
        function onResize() {
            if (resizeT) clearTimeout(resizeT)
            resizeT = setTimeout(build, 200)
        }

        let started = false
        function start() {
            if (started) return
            started = true
            build()
            rafId = requestAnimationFrame(frame)
        }

        let fallback: ReturnType<typeof setTimeout> | null = null
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(start)
            fallback = setTimeout(start, 1500)
        } else {
            start()
        }

        canvas.addEventListener("mousemove", onMouseMove)
        canvas.addEventListener("mouseleave", onMouseLeave)
        window.addEventListener("resize", onResize)

        return () => {
            if (fallback) clearTimeout(fallback)
            if (resizeT) clearTimeout(resizeT)
            cancelAnimationFrame(rafId)
            canvas.removeEventListener("mousemove", onMouseMove)
            canvas.removeEventListener("mouseleave", onMouseLeave)
            window.removeEventListener("resize", onResize)
        }
    }, [text])

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full"
            aria-label={text}
        />
    )
}
