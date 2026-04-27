"use client"

import type { Book, SortKey, SortOrder } from "@/lib/types/book"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { BookOpen, ExternalLink, ArrowUpDown } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import {
    BookGraph,
    BookListView,
    BookViewToggle,
    type BookView,
} from "@/components/books"

function BookCard({
    book,
    onOpenMemo,
}: {
    book: Book
    onOpenMemo: (book: Book) => void
}) {
    return (
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-hairline bg-surface backdrop-blur-[8px] transition-all duration-200 hover:border-accent hover:shadow-card-soft">
            <div className="flex flex-row">
                <div
                    className="relative flex w-28 shrink-0 items-center justify-center border-r border-hairline md:w-32"
                    style={{ background: "var(--bg-elev)" }}
                >
                    {book.ogpImage ? (
                        <Image
                            src={book.ogpImage}
                            alt={book.title}
                            fill
                            className="object-contain p-2"
                            sizes="128px"
                        />
                    ) : (
                        <BookOpen className="h-10 w-10 text-fg-dim" />
                    )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col p-4">
                    <h3 className="mb-1 text-base font-semibold leading-snug text-fg-strong">
                        {book.officialUrl ? (
                            <Link
                                href={book.officialUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 transition-colors hover:text-accent"
                            >
                                {book.title}
                                <ExternalLink className="h-3.5 w-3.5 text-fg-dim" />
                            </Link>
                        ) : (
                            book.title
                        )}
                    </h3>
                    <p className="mb-3 font-mono text-xs text-fg-dim">
                        {book.author}
                        {book.publishedYear && ` (${book.publishedYear})`}
                    </p>
                    {book.tags.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-1.5">
                            {book.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="rounded-[3px] border border-hairline-strong px-1.5 py-0.5 font-mono text-[10px] text-fg-muted"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                    {book.memo && (
                        <div className="mt-auto">
                            <div className="prose prose-sm prose-invert line-clamp-3 max-w-none text-[13px] leading-relaxed text-fg-muted">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {book.memo}
                                </ReactMarkdown>
                            </div>
                            <button
                                type="button"
                                onClick={() => onOpenMemo(book)}
                                className="mt-1 font-mono text-[11px] text-accent transition-colors hover:text-accent-strong"
                            >
                                続きを読む →
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function useDebounce(value: string, delay: number): string {
    const [debounced, setDebounced] = useState(value)
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay)
        return () => clearTimeout(timer)
    }, [value, delay])
    return debounced
}

export default function BooksContent({
    initialBooks,
    allTags,
}: {
    initialBooks: Book[]
    allTags: string[]
}) {
    const searchParams = useSearchParams()
    const router = useRouter()

    const tab = searchParams.get("tab") ?? "read"
    const q = searchParams.get("q") ?? ""
    const tag = searchParams.get("tag") ?? ""
    const sort = (searchParams.get("sort") as SortKey) ?? "title"
    const order = (searchParams.get("order") as SortOrder) ?? "asc"

    const [books, setBooks] = useState<Book[]>(initialBooks)
    const [searchInput, setSearchInput] = useState(q)
    const debouncedQuery = useDebounce(searchInput, 300)
    const [memoBook, setMemoBook] = useState<Book | null>(null)
    const [view, setView] = useState<BookView>("graph")

    const isRead = tab !== "unread"

    const updateParam = useCallback(
        (key: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString())
            if (value) {
                params.set(key, value)
            } else {
                params.delete(key)
            }
            router.push(`/books?${params.toString()}`, { scroll: false })
        },
        [searchParams, router],
    )

    const isInitialRender = useRef(true)

    useEffect(() => {
        if (isInitialRender.current) return
        updateParam("q", debouncedQuery)
    }, [debouncedQuery, updateParam])

    useEffect(() => {
        if (isInitialRender.current) {
            isInitialRender.current = false
            return
        }

        const params = new URLSearchParams()
        params.set("tab", tab)
        if (q) params.set("q", q)
        if (tag) params.set("tag", tag)
        params.set("sort", sort)
        params.set("order", order)

        fetch(`/api/books?${params.toString()}`)
            .then((res) => res.json())
            .then((data: Book[]) => setBooks(data))
            .catch(() => setBooks([]))
    }, [tab, q, tag, sort, order])

    const toggleSort = useCallback(() => {
        const params = new URLSearchParams(searchParams.toString())
        if (sort === "title") {
            params.set("sort", "publishedYear")
            params.set("order", "desc")
        } else {
            params.delete("sort")
            params.delete("order")
        }
        router.push(`/books?${params.toString()}`, { scroll: false })
    }, [sort, searchParams, router])

    const graphBooks = useMemo(
        () => books.filter((b) => b.tags.length > 0),
        [books],
    )

    return (
        <>
            {/* View toggle (graph/list) */}
            <section className="px-0 py-2">
                <div className="mx-auto flex max-w-[1200px] items-center justify-end px-6">
                    <BookViewToggle value={view} onChange={setView} />
                </div>
            </section>

            {/* Graph or grouped-list rendering */}
            <section className="px-0 pb-10 pt-2">
                <div className="mx-auto max-w-[1200px] px-6">
                    {view === "graph" ? (
                        graphBooks.length > 0 ? (
                            <BookGraph books={graphBooks} />
                        ) : (
                            <div
                                className="rounded-[var(--radius-lg)] border border-hairline px-6 py-10 text-center text-fg-muted"
                                style={{ background: "var(--surface)" }}
                            >
                                グラフ表示にはタグ付きの書籍が必要です。
                            </div>
                        )
                    ) : graphBooks.length > 0 ? (
                        <BookListView books={graphBooks} />
                    ) : (
                        <div
                            className="rounded-[var(--radius-lg)] border border-hairline px-6 py-10 text-center text-fg-muted"
                            style={{ background: "var(--surface)" }}
                        >
                            タグ付きの書籍がありません。
                        </div>
                    )}
                </div>
            </section>

            {/* Existing search / read-unread tabs / tag filter / memo modal — apply tokens only */}
            <section className="border-t border-hairline px-0 py-10">
                <div className="mx-auto max-w-[1200px] px-6">
                    <div className="mb-6 flex items-baseline gap-3.5 border-b border-hairline pb-3.5">
                        <span className="font-mono text-xs tracking-[0.18em] text-accent">
                            /05
                        </span>
                        <h2 className="text-[20px] font-semibold tracking-[-0.01em]">
                            検索 ・ 積読
                        </h2>
                        <span className="ml-auto font-mono text-[11px] tracking-[0.16em] text-fg-dim">
                            full library
                        </span>
                    </div>

                    {/* Tab toggle (read / unread) */}
                    <div className="mb-6 inline-flex rounded-full border border-hairline-strong p-1" style={{ background: "var(--bg-elev)" }}>
                        {[
                            { key: "read", label: "書籍一覧" },
                            { key: "unread", label: "積読一覧" },
                        ].map((opt) => {
                            const active = tab === opt.key
                            return (
                                <button
                                    key={opt.key}
                                    type="button"
                                    onClick={() => updateParam("tab", opt.key)}
                                    className={
                                        "rounded-full px-4 py-2 font-mono text-xs tracking-[0.06em] transition-all duration-200 " +
                                        (active
                                            ? "bg-accent text-white"
                                            : "bg-transparent text-fg-muted hover:text-fg")
                                    }
                                >
                                    {opt.label}
                                </button>
                            )
                        })}
                    </div>

                    <div className="mb-6 flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <Input
                                placeholder="タイトル・著者・メモで検索..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="flex-1"
                            />
                            <button
                                type="button"
                                onClick={toggleSort}
                                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-hairline-strong bg-bg-elev px-3 py-2 font-mono text-xs text-fg-muted transition-colors hover:border-accent hover:text-accent"
                            >
                                <ArrowUpDown className="h-4 w-4" />
                                {sort === "title" ? "タイトル順" : "出版年順"}
                            </button>
                        </div>
                        {allTags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => updateParam("tag", "")}
                                    className={
                                        "rounded-full border px-3 py-1 font-mono text-[11px] tracking-[0.04em] transition-all duration-200 " +
                                        (tag === ""
                                            ? "border-accent bg-accent text-white"
                                            : "border-hairline-strong bg-transparent text-fg-muted hover:border-fg-muted hover:text-fg")
                                    }
                                >
                                    すべて
                                </button>
                                {allTags.map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => updateParam("tag", t)}
                                        className={
                                            "rounded-full border px-3 py-1 font-mono text-[11px] tracking-[0.04em] transition-all duration-200 " +
                                            (tag === t
                                                ? "border-accent bg-accent text-white"
                                                : "border-hairline-strong bg-transparent text-fg-muted hover:border-fg-muted hover:text-fg")
                                        }
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {books.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2">
                            {books.map((book) => (
                                <BookCard
                                    key={book.id}
                                    book={book}
                                    onOpenMemo={setMemoBook}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center text-fg-muted">
                            {isRead
                                ? "条件に一致する書籍が見つかりません"
                                : "積読はありません"}
                        </div>
                    )}
                </div>
            </section>

            <Dialog
                open={memoBook !== null}
                onOpenChange={(open) => {
                    if (!open) setMemoBook(null)
                }}
            >
                <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{memoBook?.title}</DialogTitle>
                        <DialogDescription>
                            {memoBook?.author}
                            {memoBook?.publishedYear &&
                                ` (${memoBook.publishedYear})`}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="prose prose-sm prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {memoBook?.memo ?? ""}
                        </ReactMarkdown>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
