import { Suspense } from "react"
import type { Metadata } from "next"
import BooksContent from "./BooksContent"
import { getBooks, getBookTags } from "@/lib/books"
import { Reveal } from "@/components/animations"
import { createPageMetadata } from "@/lib/seo"

export const metadata: Metadata = createPageMetadata({
    title: "Books",
    description:
        "技術書を中心に、読んだ本と読みたい本を記録し、関連するテーマや知識のつながりを紹介します。",
    path: "/books",
})

export const revalidate = 60

export default async function BooksPage() {
    const [readBooks, allTags] = await Promise.all([
        getBooks({ isRead: true, sort: "title", order: "asc" }),
        getBookTags(),
    ])

    return (
        <main className="page flex-1">
            {/* page-hero */}
            <section className="px-0 pb-8 pt-20">
                <div className="mx-auto max-w-[1200px] px-6">
                    <Reveal className="mb-4 flex gap-1.5 font-mono text-xs uppercase tracking-[0.16em] text-fg-dim">
                        <span>onclimb</span>
                        <span>/</span>
                        <b className="font-medium text-accent">books</b>
                    </Reveal>
                    <div className="mb-2 flex flex-wrap items-end justify-between gap-6">
                        <Reveal delay={80}>
                            <h1 className="text-[clamp(40px,5.6vw,64px)] font-semibold leading-[1.05] tracking-[-0.03em]">
                                読んだ・読みたい
                                <br />
                                本のグラフ。
                            </h1>
                        </Reveal>
                    </div>
                    <Reveal delay={160}>
                        <p className="max-w-[640px] text-[17px] leading-[1.7] text-fg">
                            技術書を中心とした個人ライブラリ。本同士のつながりをグラフで眺め、深掘りはノートで。
                        </p>
                    </Reveal>
                </div>
            </section>

            <Suspense fallback={null}>
                <BooksContent initialBooks={readBooks} allTags={allTags} />
            </Suspense>
        </main>
    )
}
