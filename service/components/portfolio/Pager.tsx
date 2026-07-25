import Link from "next/link"

interface PagerProps {
    prev?: { id: string; title: string; number: string } | null
    next?: { id: string; title: string; number: string } | null
}

const Arrow = ({ rotated = false }: { rotated?: boolean }) => (
    <div
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-white transition-transform duration-[300ms] group-hover:scale-110"
        style={rotated ? { transform: "rotate(180deg)" } : undefined}
    >
        <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path d="M5 12h14M13 5l7 7-7 7" />
        </svg>
    </div>
)

export function Pager({ prev, next }: PagerProps) {
    return (
        <nav className="mx-auto my-10 mb-20 grid max-w-[980px] grid-cols-1 gap-3 px-6 [@media(min-width:720px)]:grid-cols-2">
            {prev ? (
                <Link
                    href={`/portfolio/${prev.id}`}
                    className="group flex items-center justify-between rounded-[var(--radius-lg)] border border-hairline-strong bg-surface-solid px-7 py-6 text-left transition-all duration-[250ms] hover:-translate-y-0.5 hover:border-accent"
                >
                    <Arrow rotated />
                    <div>
                        <div className="mb-1 font-mono text-[10px] tracking-[0.18em] text-fg-dim">
                            BACK
                        </div>
                        <div className="text-base font-semibold text-fg-strong">
                            {prev.title}
                        </div>
                    </div>
                </Link>
            ) : (
                <Link
                    href="/portfolio"
                    className="group flex items-center justify-between rounded-[var(--radius-lg)] border border-hairline-strong bg-surface-solid px-7 py-6 text-left transition-all duration-[250ms] hover:-translate-y-0.5 hover:border-accent"
                >
                    <Arrow rotated />
                    <div>
                        <div className="mb-1 font-mono text-[10px] tracking-[0.18em] text-fg-dim">
                            BACK
                        </div>
                        <div className="text-base font-semibold text-fg-strong">
                            All Portfolio
                        </div>
                    </div>
                </Link>
            )}
            {next && (
                <Link
                    href={`/portfolio/${next.id}`}
                    className="group flex flex-row-reverse items-center justify-between rounded-[var(--radius-lg)] border border-hairline-strong bg-surface-solid px-7 py-6 text-right transition-all duration-[250ms] hover:-translate-y-0.5 hover:border-accent"
                >
                    <Arrow />
                    <div>
                        <div className="mb-1 font-mono text-[10px] tracking-[0.18em] text-fg-dim">
                            NEXT — {next.number}
                        </div>
                        <div className="text-base font-semibold text-fg-strong">
                            {next.title}
                        </div>
                    </div>
                </Link>
            )}
        </nav>
    )
}
