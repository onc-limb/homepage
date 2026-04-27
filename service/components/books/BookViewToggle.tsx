"use client"

export type BookView = "graph" | "list"

interface BookViewToggleProps {
    value: BookView
    onChange: (next: BookView) => void
}

const GraphIcon = () => (
    <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
    >
        <circle cx="6" cy="6" r="2" />
        <circle cx="18" cy="6" r="2" />
        <circle cx="12" cy="18" r="2" />
        <path d="M7.5 7.5l3.5 9M16.5 7.5L13 16.5" />
    </svg>
)

const ListIcon = () => (
    <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
    >
        <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
)

export function BookViewToggle({ value, onChange }: BookViewToggleProps) {
    const baseBtn =
        "inline-flex items-center gap-1.5 rounded-full px-4 py-2 font-mono text-xs tracking-[0.06em] transition-all duration-200"
    const activeBtn = "bg-accent text-white"
    const inactiveBtn = "bg-transparent text-fg-muted"
    return (
        <div
            className="inline-flex rounded-full border border-hairline-strong p-1"
            style={{ background: "var(--bg-elev)" }}
        >
            <button
                type="button"
                onClick={() => onChange("graph")}
                className={`${baseBtn} ${value === "graph" ? activeBtn : inactiveBtn}`}
            >
                <GraphIcon />
                GRAPH
            </button>
            <button
                type="button"
                onClick={() => onChange("list")}
                className={`${baseBtn} ${value === "list" ? activeBtn : inactiveBtn}`}
            >
                <ListIcon />
                LIST
            </button>
        </div>
    )
}
