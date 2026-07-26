"use client"

import { useMemo, useState } from "react"
import type { Book } from "@/lib/types/book"
import {
    assignBooksToClusters,
    deriveTopClusters,
    type PositionedBook,
} from "./BookCluster"

/**
 * docs/design/book.html の Graph view を React 化。
 * cluster ノード + book ノード + edge をレンダリングし、
 * クリックで detail パネルを開く。
 */
export function BookGraph({ books }: { books: Book[] }) {
    const clusters = useMemo(() => deriveTopClusters(books), [books])
    const positioned = useMemo(
        () => assignBooksToClusters(books, clusters),
        [books, clusters],
    )
    const [activeId, setActiveId] = useState<string | null>(null)
    const [hoverId, setHoverId] = useState<string | null>(null)

    const focusId = activeId ?? hoverId
    const adjacency = useMemo(() => buildAdjacency(positioned, clusters), [
        positioned,
        clusters,
    ])

    const active = activeId
        ? positioned.find((p) => p.id === activeId) ?? null
        : null
    const activeCluster = active
        ? clusters.find((c) => c.id === active.cluster) ?? null
        : null

    return (
        <div
            className="relative h-[640px] overflow-hidden rounded-[var(--radius-lg)] border border-hairline"
            style={{
                // グラデーション廃止・単色化: 放射状グラデーションの背景を単色サーフェスに置換
                background: "var(--surface-solid)",
            }}
        >
            <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="absolute inset-0 h-full w-full"
                aria-hidden="true"
            >
                {clusters.flatMap((c) =>
                    positioned
                        .filter((b) => b.cluster === c.id)
                        .map((b) => {
                            const hi =
                                focusId !== null &&
                                (focusId === `cluster-${c.id}` ||
                                    focusId === b.id)
                            return (
                                <line
                                    key={`edge-c-${c.id}-${b.id}`}
                                    x1={c.x}
                                    y1={c.y}
                                    x2={b.x}
                                    y2={b.y}
                                    stroke={
                                        hi ? "var(--accent)" : "var(--hairline-strong)"
                                    }
                                    strokeWidth={hi ? 0.4 : 0.2}
                                    opacity={hi ? 1 : 0.6}
                                />
                            )
                        }),
                )}
                {positioned.flatMap((b) =>
                    b.related
                        .filter((rid) => b.id < rid)
                        .map((rid) => {
                            const r = positioned.find((p) => p.id === rid)
                            if (!r) return null
                            const hi =
                                focusId !== null &&
                                (focusId === b.id || focusId === rid)
                            return (
                                <line
                                    key={`edge-r-${b.id}-${rid}`}
                                    x1={b.x}
                                    y1={b.y}
                                    x2={r.x}
                                    y2={r.y}
                                    stroke={
                                        hi ? "var(--accent)" : "var(--hairline-strong)"
                                    }
                                    strokeWidth={hi ? 0.4 : 0.15}
                                    opacity={hi ? 1 : 0.45}
                                />
                            )
                        }),
                )}
            </svg>

            {clusters.map((c) => (
                <ClusterNode
                    key={c.id}
                    id={`cluster-${c.id}`}
                    label={c.label}
                    x={c.x}
                    y={c.y}
                    onMouseEnter={setHoverId}
                    onMouseLeave={() => setHoverId(null)}
                    faded={
                        focusId !== null &&
                        focusId !== `cluster-${c.id}` &&
                        !adjacency.get(focusId)?.has(`cluster-${c.id}`)
                    }
                />
            ))}
            {positioned.map((b) => (
                <BookNode
                    key={b.id}
                    book={b}
                    active={activeId === b.id}
                    faded={
                        focusId !== null &&
                        focusId !== b.id &&
                        !adjacency.get(focusId)?.has(b.id)
                    }
                    onMouseEnter={setHoverId}
                    onMouseLeave={() => setHoverId(null)}
                    onClick={() => setActiveId(b.id)}
                />
            ))}

            <div
                className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-hairline bg-bg-elev px-3.5 py-2 font-mono text-[11px] tracking-[0.06em] text-fg-dim"
            >
                click node to focus · hover to highlight
            </div>

            <div
                className="absolute bottom-4 left-4 inline-flex gap-4 rounded-full border border-hairline bg-bg-elev px-4 py-2 font-mono text-[11px]"
            >
                <Legend dotClassName="bg-accent">read</Legend>
                <Legend dotClassName="bg-amber">reading</Legend>
                <Legend dotClassName="bg-transparent">queue</Legend>
            </div>

            {active && (
                <div
                    role="dialog"
                    aria-label={active.title}
                    className="absolute right-4 top-4 z-20 w-[min(340px,calc(100%-32px))] rounded-[var(--radius-lg)] border border-accent bg-bg-elev p-5 text-[13.5px] shadow-card-lg"
                >
                    <button
                        type="button"
                        onClick={() => setActiveId(null)}
                        className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full text-fg-muted hover:bg-bg-elev-2 hover:text-fg"
                        aria-label="close"
                    >
                        ✕
                    </button>
                    <div className="mb-1.5 font-mono text-[10px] tracking-[0.16em] text-accent">
                        {activeCluster?.label.toUpperCase()}
                    </div>
                    <div className="mb-1 text-[17px] font-semibold leading-[1.35]">
                        {active.title}
                    </div>
                    <div className="mb-3.5 text-xs text-fg-muted">
                        {active.author}
                    </div>
                    <span
                        className="mb-3.5 inline-flex items-center gap-1.5 rounded-full px-2 py-1 font-mono text-[11px]"
                        style={
                            active.status === "read"
                                ? {
                                      background: "var(--accent-soft)",
                                      color: "var(--accent)",
                                  }
                                : {
                                      background: "var(--bg-elev-2)",
                                      color: "var(--fg-muted)",
                                  }
                        }
                    >
                        {active.status.toUpperCase()}
                    </span>
                    {active.notes && (
                        <div
                            className="mb-3.5 rounded-r-[6px] border-l-2 border-accent px-3 py-2.5 text-[13px] leading-[1.7] text-fg"
                            style={{ background: "var(--accent-soft)" }}
                        >
                            {active.notes}
                        </div>
                    )}
                    <div className="mb-1.5 font-mono text-[11px] tracking-[0.1em] text-fg-dim">
                        RELATED
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {active.related.length === 0 && (
                            <span className="text-xs text-fg-dim">—</span>
                        )}
                        {active.related.map((rid) => {
                            const r = positioned.find((p) => p.id === rid)
                            if (!r) return null
                            const display =
                                r.title.length > 16
                                    ? r.title.slice(0, 16) + "…"
                                    : r.title
                            return (
                                <button
                                    type="button"
                                    key={rid}
                                    onClick={() => setActiveId(rid)}
                                    className="rounded-[4px] border border-hairline-strong px-2 py-0.5 font-mono text-[11px] text-fg transition-colors hover:border-accent hover:text-accent"
                                >
                                    {display}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

function ClusterNode({
    id,
    label,
    x,
    y,
    onMouseEnter,
    onMouseLeave,
    faded,
}: {
    id: string
    label: string
    x: number
    y: number
    onMouseEnter: (id: string) => void
    onMouseLeave: () => void
    faded: boolean
}) {
    return (
        <div
            className={
                "absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer select-none transition-opacity duration-200 " +
                (faded ? "opacity-20" : "opacity-100")
            }
            style={{ left: `${x}%`, top: `${y}%` }}
            onMouseEnter={() => onMouseEnter(id)}
            onMouseLeave={onMouseLeave}
        >
            <div
                className="h-[22px] w-[22px] rounded-full border-2"
                style={{
                    background: "var(--accent)",
                    borderColor: "var(--bg)",
                }}
            />
            <div
                className="absolute left-1/2 top-[24px] -translate-x-1/2 whitespace-nowrap rounded-[3px] border px-1.5 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-[0.04em]"
                style={{
                    color: "var(--accent)",
                    borderColor: "var(--accent)",
                    background: "var(--accent-soft)",
                }}
            >
                {label}
            </div>
        </div>
    )
}

function BookNode({
    book,
    active,
    faded,
    onMouseEnter,
    onMouseLeave,
    onClick,
}: {
    book: PositionedBook
    active: boolean
    faded: boolean
    onMouseEnter: (id: string) => void
    onMouseLeave: () => void
    onClick: () => void
}) {
    const dotStyle =
        book.status === "read"
            ? {
                  background: "var(--accent)",
                  borderColor: "var(--accent)",
              }
            : {
                  background: "transparent",
                  borderColor: "var(--accent)",
              }
    return (
        <div
            className={
                "absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer select-none transition-transform duration-250 hover:z-10 hover:scale-[1.4] " +
                (faded ? "opacity-20" : "opacity-100") +
                (active ? " z-20 scale-[1.5]" : "")
            }
            style={{ left: `${book.x}%`, top: `${book.y}%` }}
            onMouseEnter={() => onMouseEnter(book.id)}
            onMouseLeave={onMouseLeave}
            onClick={onClick}
        >
            <div
                className="h-[14px] w-[14px] rounded-full border-2"
                style={{
                    ...dotStyle,
                    boxShadow: active ? "0 0 0 4px var(--accent-soft)" : undefined,
                }}
            />
            <div
                className="absolute left-1/2 top-[18px] -translate-x-1/2 whitespace-nowrap rounded-[3px] border border-hairline px-1.5 py-0.5 font-mono text-[10.5px] text-fg-muted"
                style={{ background: "var(--bg)" }}
            >
                {book.title.length > 14
                    ? book.title.slice(0, 14) + "…"
                    : book.title}
            </div>
        </div>
    )
}

function Legend({
    children,
    dotClassName,
}: {
    children: React.ReactNode
    dotClassName: string
}) {
    return (
        <div className="flex items-center gap-1.5 text-fg-muted">
            <span
                className={
                    "block h-2 w-2 rounded-full border-2 border-accent " +
                    dotClassName
                }
            />
            {children}
        </div>
    )
}

function buildAdjacency(
    books: PositionedBook[],
    clusters: { id: string }[],
): Map<string, Set<string>> {
    const adj = new Map<string, Set<string>>()
    function add(a: string, b: string) {
        if (!adj.has(a)) adj.set(a, new Set())
        adj.get(a)!.add(b)
    }
    for (const cluster of clusters) {
        const clusterId = `cluster-${cluster.id}`
        for (const b of books.filter((p) => p.cluster === cluster.id)) {
            add(clusterId, b.id)
            add(b.id, clusterId)
        }
    }
    for (const b of books) {
        for (const rid of b.related) {
            add(b.id, rid)
            add(rid, b.id)
        }
    }
    return adj
}
