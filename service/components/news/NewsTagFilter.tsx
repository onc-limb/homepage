"use client"

import { useState } from "react"

const TAGS = ["all", "frontend", "backend", "infra", "ai", "lang"] as const
export type NewsTag = (typeof TAGS)[number]

interface NewsTagFilterProps {
    onChange: (tag: NewsTag) => void
}

export function NewsTagFilter({ onChange }: NewsTagFilterProps) {
    const [active, setActive] = useState<NewsTag>("all")

    function pick(t: NewsTag) {
        setActive(t)
        onChange(t)
    }

    return (
        <div className="mx-auto mb-4 mt-7 flex max-w-[1200px] flex-wrap items-center gap-2 px-6">
            <span className="mr-2 font-mono text-[11px] uppercase tracking-[0.16em] text-fg-dim">
                FILTER —
            </span>
            {TAGS.map((t) => (
                <button
                    key={t}
                    type="button"
                    onClick={() => pick(t)}
                    className={
                        "rounded-full border px-3.5 py-1.5 font-mono text-xs tracking-[0.04em] transition-all duration-200 " +
                        (active === t
                            ? "border-accent bg-accent text-white"
                            : "border-hairline-strong bg-transparent text-fg-muted hover:border-fg-muted hover:text-fg")
                    }
                >
                    {t === "all" ? "All" : t}
                </button>
            ))}
        </div>
    )
}
