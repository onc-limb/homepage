import type { Book } from "@/lib/types/book"
import { Reveal } from "@/components/animations"
import {
    assignBooksToClusters,
    deriveTopClusters,
    type PositionedBook,
} from "./BookCluster"

const TONE_GRADIENTS: Record<string, string> = {
    "0": "linear-gradient(135deg, var(--cyan), var(--accent))",
    "1": "linear-gradient(135deg, #0F172A, var(--accent))",
    "2": "linear-gradient(135deg, var(--indigo), var(--violet))",
    "3": "linear-gradient(135deg, var(--rose), var(--amber))",
}

/**
 * docs/design/book.html の List view を React 化。
 * cluster 単位で bcard を並べる。
 */
export function BookListView({ books }: { books: Book[] }) {
    const clusters = deriveTopClusters(books)
    const positioned = assignBooksToClusters(books, clusters)

    return (
        <div>
            {clusters.map((cluster, idx) => {
                const items = positioned.filter((b) => b.cluster === cluster.id)
                if (items.length === 0) return null
                const tone = TONE_GRADIENTS[String(idx % 4)]
                return (
                    <section key={cluster.id} className="mb-9">
                        <Reveal
                            as="header"
                            className="mb-3.5 flex items-baseline gap-3.5 border-b border-hairline pb-2.5"
                        >
                            <span className="font-mono text-xs tracking-[0.18em] text-accent">
                                /{String(idx + 1).padStart(2, "0")}
                            </span>
                            <h2 className="text-[20px] font-semibold">
                                {cluster.label}
                            </h2>
                            <span className="ml-auto font-mono text-[11px] tracking-[0.16em] text-fg-dim">
                                {items.length} books
                            </span>
                        </Reveal>
                        <div className="grid grid-cols-1 gap-3 [@media(min-width:720px)]:grid-cols-2">
                            {items.map((b) => (
                                <Reveal key={b.id} as="article" className="bcard">
                                    <BookCardItem book={b} tone={tone} />
                                </Reveal>
                            ))}
                        </div>
                    </section>
                )
            })}
        </div>
    )
}

function BookCardItem({
    book,
    tone,
}: {
    book: PositionedBook
    tone: string
}) {
    const statusStyle =
        book.status === "read"
            ? { background: "var(--accent-soft)", color: "var(--accent)" }
            : { background: "var(--bg-elev-2)", color: "var(--fg-muted)" }
    return (
        <div className="grid grid-cols-[60px_1fr] items-start gap-4 rounded-[var(--radius)] border border-hairline bg-bg-elev px-4 py-4 transition-all duration-200 hover:translate-x-1 hover:border-accent">
            <div
                className="grid aspect-[2/3] place-items-center rounded-[4px] p-1 text-center font-mono text-[9px] leading-[1.2] tracking-[0.04em]"
                style={{
                    background: tone,
                    color: "rgba(255,255,255,0.85)",
                    boxShadow: "2px 2px 0 var(--hairline-strong)",
                }}
            >
                {book.title.split(" ").slice(0, 3).join(" ")}
            </div>
            <div>
                <div className="mb-1 text-sm font-semibold leading-[1.4]">
                    {book.title}
                </div>
                <div className="mb-2 font-mono text-[11.5px] text-fg-dim">
                    {book.author}
                </div>
                <span
                    className="inline-block rounded-[3px] px-1.5 py-0.5 font-mono text-[10px]"
                    style={statusStyle}
                >
                    {book.status}
                </span>
            </div>
        </div>
    )
}
