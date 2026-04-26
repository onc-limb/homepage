interface DayHeadProps {
    date: string
    label: string
    count: number
}

export function DayHead({ date, label, count }: DayHeadProps) {
    return (
        <header
            className="my-5 flex items-baseline gap-3.5 border-b border-dashed pb-2.5"
            style={{ borderColor: "var(--hairline-strong)" }}
        >
            <span className="font-mono text-[13px] tracking-[0.06em] text-accent">
                {date}
            </span>
            <span className="text-lg font-semibold">{label}</span>
            <span className="ml-auto font-mono text-[11px] tracking-[0.16em] text-fg-dim">
                {count} stories
            </span>
        </header>
    )
}
