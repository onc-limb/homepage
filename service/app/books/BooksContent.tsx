"use client"

import {
    filterBooks,
    getBookTags,
    type Book,
    type SortKey,
    type SortOrder,
} from "@/lib/books"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { BookOpen, ExternalLink, ArrowUpDown } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { useCallback, useMemo, useState } from "react"

function BookCard({
    book,
    ogpImage,
}: {
    book: Book
    ogpImage: string | null
}) {
    const [memoExpanded, setMemoExpanded] = useState(false)
    return (
        <div className="border border-turquoise-200/60 bg-white/70 rounded-lg shadow-card hover:shadow-soft transition-all duration-200 overflow-hidden flex flex-row">
            {/* サムネイル */}
            <div className="w-28 md:w-32 shrink-0 bg-turquoise-50 flex items-center justify-center border-r border-turquoise-200/40 relative">
                {ogpImage ? (
                    <Image
                        src={ogpImage}
                        alt={book.title}
                        fill
                        className="object-contain p-2"
                        sizes="128px"
                    />
                ) : (
                    <BookOpen className="w-10 h-10 text-turquoise-300" />
                )}
            </div>
            {/* 情報 */}
            <div className="p-4 flex flex-col flex-1 min-w-0">
                {/* タイトル */}
                <h3 className="text-lg font-medium text-foreground tracking-elegant leading-snug mb-1">
                    {book.officialUrl ? (
                        <Link
                            href={book.officialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-turquoise-600 transition-colors inline-flex items-center gap-1"
                        >
                            {book.title}
                            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                        </Link>
                    ) : (
                        book.title
                    )}
                </h3>
                {/* 著者・出版年 */}
                <p className="text-sm text-muted-foreground mb-3">
                    {book.author}
                    {book.publishedYear && ` (${book.publishedYear})`}
                </p>
                {/* タグ */}
                {book.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {book.tags.map((tag) => (
                            <span
                                key={tag}
                                className="text-xs px-2 py-0.5 bg-turquoise-100 text-turquoise-700 rounded"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
                {/* メモ */}
                {book.memo && (
                    <div className="mt-auto">
                        <p
                            className={`text-sm text-foreground/70 leading-relaxed ${memoExpanded ? "" : "line-clamp-3"}`}
                        >
                            {book.memo}
                        </p>
                        <button
                            onClick={() => setMemoExpanded(!memoExpanded)}
                            className="text-xs text-turquoise-600 hover:text-turquoise-700 mt-1 transition-colors"
                        >
                            {memoExpanded ? "閉じる" : "続きを読む"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function BooksContent({
    ogpImages,
}: {
    ogpImages: Record<number, string | null>
}) {
    const searchParams = useSearchParams()
    const router = useRouter()

    const q = searchParams.get("q") ?? ""
    const tag = searchParams.get("tag") ?? ""
    const sort = (searchParams.get("sort") as SortKey) ?? "title"
    const order = (searchParams.get("order") as SortOrder) ?? "asc"

    const allTags = useMemo(() => getBookTags(), [])
    const books = useMemo(
        () =>
            filterBooks({
                q: q || undefined,
                tag: tag || undefined,
                sort,
                order,
            }),
        [q, tag, sort, order]
    )

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
        [searchParams, router]
    )

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

    return (
        <>
            {/* 検索・フィルタ・ソート */}
            <section className="w-full py-8">
                <div className="container px-4 md:px-6 mx-auto max-w-5xl">
                    <div className="flex flex-col gap-4">
                        {/* 検索 + ソート */}
                        <div className="flex gap-3 items-center">
                            <Input
                                placeholder="タイトル・著者・メモで検索..."
                                value={q}
                                onChange={(e) => updateParam("q", e.target.value)}
                                className="flex-1"
                            />
                            <button
                                onClick={toggleSort}
                                className="flex items-center gap-1.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-md transition-colors whitespace-nowrap"
                            >
                                <ArrowUpDown className="w-4 h-4" />
                                {sort === "title" ? "タイトル順" : "出版年順"}
                            </button>
                        </div>
                        {/* タグフィルタ */}
                        {allTags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                <Badge
                                    variant={tag === "" ? "default" : "outline"}
                                    className="cursor-pointer"
                                    onClick={() => updateParam("tag", "")}
                                >
                                    すべて
                                </Badge>
                                {allTags.map((t) => (
                                    <Badge
                                        key={t}
                                        variant={tag === t ? "default" : "outline"}
                                        className="cursor-pointer"
                                        onClick={() => updateParam("tag", t)}
                                    >
                                        {t}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>
            {/* Divider */}
            <div className="w-full border-t border-turquoise-200/50" />
            {/* 書籍一覧 */}
            <section className="w-full py-16 md:py-20">
                <div className="container px-4 md:px-6 mx-auto max-w-5xl">
                    {books.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2">
                            {books.map((book) => (
                                <BookCard
                                    key={book.id}
                                    book={book}
                                    ogpImage={ogpImages[book.id] ?? null}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">
                                条件に一致する書籍が見つかりません
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </>
    )
}
