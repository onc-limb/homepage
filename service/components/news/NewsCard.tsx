"use client"

import type { NewsArticle } from "@/lib/news"
import type { CSSProperties } from "react"
import { useRef } from "react"

export type NewsVariant = "default" | "feat" | "mono"

interface NewsCardProps {
    article: NewsArticle
    variant?: NewsVariant
    tags?: string[]
}

const FEAT_BG: CSSProperties = {
    background:
        "radial-gradient(circle at 90% 0%, var(--accent-soft), transparent 60%), var(--surface-strong)",
}
const MONO_BG: CSSProperties = { background: "var(--bg-elev)" }

export function NewsCard({
    article,
    variant = "default",
    tags = [],
}: NewsCardProps) {
    const ref = useRef<HTMLAnchorElement | null>(null)

    function onMouseMove(e: React.MouseEvent<HTMLAnchorElement>) {
        const el = ref.current
        if (!el) return
        const r = el.getBoundingClientRect()
        const glow = el.querySelector<HTMLElement>("[data-glow]")
        if (!glow) return
        glow.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`)
        glow.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`)
    }

    const time = formatTime(article.publishedAt)

    const baseClass =
        "ncard relative flex min-h-[220px] flex-col overflow-hidden rounded-[var(--radius-lg)] border border-hairline px-5 pb-[60px] pt-5 transition-[transform,border-color] duration-[350ms] backdrop-blur-[8px]"
    const featClass =
        variant === "feat"
            ? "[grid-column:1/-1] [@media(min-width:720px)]:[grid-column:span_2]"
            : ""

    const containerStyle: CSSProperties =
        variant === "feat"
            ? FEAT_BG
            : variant === "mono"
              ? MONO_BG
              : { background: "var(--surface)" }

    const titleClass =
        variant === "feat"
            ? "mb-2.5 text-[22px] font-semibold leading-[1.4] tracking-[-0.005em] text-fg-strong"
            : variant === "mono"
              ? "mb-2.5 font-mono text-[14.5px] font-semibold leading-[1.4] text-fg-strong"
              : "mb-2.5 text-base font-semibold leading-[1.4] tracking-[-0.005em] text-fg-strong"

    return (
        <a
            ref={ref}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            onMouseMove={onMouseMove}
            className={`${baseClass} ${featClass} hover:-translate-y-1.5 hover:rotate-[-0.4deg]`}
            style={containerStyle}
            data-tags={tags.join(",")}
        >
            <span
                aria-hidden="true"
                data-glow
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-[250ms] hover:opacity-100"
                style={{
                    background:
                        "radial-gradient(400px circle at var(--mx, 50%) var(--my, 50%), var(--accent-soft), transparent 50%)",
                }}
            />
            <div className="mb-3.5 flex items-center justify-between font-mono text-[11px] tracking-[0.1em] text-fg-dim">
                <span className="inline-flex items-center gap-1.5 before:block before:h-1 before:w-1 before:rounded-full before:bg-accent">
                    {article.source}
                </span>
                <span>{time}</span>
            </div>
            <h3 className={titleClass}>{article.title}</h3>
            <p className="flex-1 text-[13.5px] leading-[1.7] text-fg-muted">
                {article.summary || "要約なし"}
            </p>
            {tags.length > 0 && (
                <div className="absolute bottom-4 left-5 right-5 flex flex-wrap gap-1.5">
                    {tags.map((t) => (
                        <span
                            key={t}
                            className="rounded-[3px] border border-hairline-strong px-1.5 py-0.5 font-mono text-[10px] text-fg"
                        >
                            {t}
                        </span>
                    ))}
                </div>
            )}
        </a>
    )
}

function formatTime(publishedAt: string): string {
    if (!publishedAt) return ""
    const d = new Date(publishedAt)
    if (isNaN(d.getTime())) return publishedAt.slice(11, 16)
    const pad = (n: number) => String(n).padStart(2, "0")
    return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`
}
