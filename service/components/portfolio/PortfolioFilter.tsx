"use client"

import { useState } from "react"

export type PortfolioFilter = "all" | "personal" | "work"

interface PortfolioFilterBarProps {
    onChange: (next: PortfolioFilter) => void
    initial?: PortfolioFilter
}

export function PortfolioFilterBar({
    onChange,
    initial = "all",
}: PortfolioFilterBarProps) {
    const [value, setValue] = useState<PortfolioFilter>(initial)

    function pick(next: PortfolioFilter) {
        setValue(next)
        onChange(next)
    }

    const options: { key: PortfolioFilter; label: string }[] = [
        { key: "all", label: "All" },
        { key: "personal", label: "Personal" },
        { key: "work", label: "Work" },
    ]

    return (
        <div className="mx-auto mt-6 flex max-w-[1080px] flex-wrap items-center gap-2 px-6">
            <span className="mr-2 font-mono text-[11px] uppercase tracking-[0.16em] text-fg-dim">
                FILTER —
            </span>
            {options.map((opt) => {
                const active = value === opt.key
                return (
                    <button
                        type="button"
                        key={opt.key}
                        onClick={() => pick(opt.key)}
                        className={
                            "rounded-full border px-3.5 py-1.5 font-mono text-[13px] tracking-[0.04em] transition-all duration-200 " +
                            (active
                                ? "border-accent bg-accent text-white"
                                : "border-hairline-strong bg-transparent text-fg-muted hover:border-fg-muted hover:text-fg")
                        }
                    >
                        {opt.label}
                    </button>
                )
            })}
        </div>
    )
}
