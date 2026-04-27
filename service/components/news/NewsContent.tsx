"use client"

import { useState } from "react"
import type { NewsArticle } from "@/lib/news"
import { Reveal } from "@/components/animations"
import { DayHead } from "./DayHead"
import { NewsCard, type NewsVariant } from "./NewsCard"
import { NewsTagFilter, type NewsTag } from "./NewsTagFilter"
import { Ticker } from "./Ticker"

export interface NewsDayGroup {
    date: string
    label: string
    articles: NewsArticle[]
}

interface NewsContentProps {
    days: NewsDayGroup[]
}

const MONO_SOURCES = new Set(["GitHub Trending", "GitHub Blog"])

function variantFor(article: NewsArticle, indexInDay: number): NewsVariant {
    if (MONO_SOURCES.has(article.source)) return "mono"
    if (indexInDay === 0) return "feat"
    return "default"
}

export function NewsContent({ days }: NewsContentProps) {
    const [tag, setTag] = useState<NewsTag>("all")

    return (
        <>
            <Ticker />
            <NewsTagFilter onChange={setTag} />
            <section className="pb-14 pt-7">
                <div className="mx-auto max-w-[1200px] px-6">
                    {days.map((day) => (
                        <div key={day.date}>
                            <Reveal>
                                <DayHead
                                    date={day.date}
                                    label={day.label}
                                    count={day.articles.length}
                                />
                            </Reveal>
                            <div className="grid grid-cols-1 gap-3.5 [@media(min-width:720px)]:grid-cols-2 [@media(min-width:1100px)]:grid-cols-3">
                                {day.articles.map((article, i) => {
                                    // ASSUMPTION: news.tags 列が無いため source から推定タグを 1 つ振る。
                                    const inferred = inferTags(article.source)
                                    if (
                                        tag !== "all" &&
                                        !inferred.includes(tag as string)
                                    ) {
                                        return null
                                    }
                                    return (
                                        <Reveal key={article.url} delay={i * 40}>
                                            <NewsCard
                                                article={article}
                                                variant={variantFor(article, i)}
                                                tags={inferred}
                                            />
                                        </Reveal>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </>
    )
}

function inferTags(source: string): string[] {
    // ASSUMPTION: 暫定で source 名の部分一致からタグを推定する。
    const s = source.toLowerCase()
    const tags: string[] = []
    if (
        s.includes("react") ||
        s.includes("next") ||
        s.includes("vercel") ||
        s.includes("tailwind") ||
        s.includes("biome")
    )
        tags.push("frontend")
    if (
        s.includes("aws") ||
        s.includes("cloudflare") ||
        s.includes("kubernetes") ||
        s.includes("github") ||
        s.includes("vercel")
    )
        tags.push("infra")
    if (
        s.includes("openai") ||
        s.includes("anthropic") ||
        s.includes("arxiv") ||
        s.includes("ml") ||
        s.includes("ai")
    )
        tags.push("ai")
    if (
        s.includes("typescript") ||
        s.includes("rust") ||
        s.includes("swift") ||
        s.includes("tc39")
    )
        tags.push("lang")
    if (
        s.includes("postgres") ||
        s.includes("graphql") ||
        s.includes("bun") ||
        s.includes("backend")
    )
        tags.push("backend")
    // タグ未確定のときはフォールバックせず空配列。NewsContent 側で all 以外のフィルタ時に非表示になる。
    return tags
}
