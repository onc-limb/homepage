import { db } from "@/lib/db"
import { news } from "@/lib/db/schema"
import { eq, and, desc, count } from "drizzle-orm"

export interface NewsArticle {
    title: string
    source: string
    url: string
    summary: string | null
    publishedAt: string
}

/**
 * 公開済みニュースの日付一覧と各日の記事数を取得
 */
export async function getNewsDates(): Promise<{ date: string; count: number }[]> {
    const results = await db
        .select({
            date: news.crawlDate,
            count: count(),
        })
        .from(news)
        .where(eq(news.isPublished, true))
        .groupBy(news.crawlDate)
        .orderBy(desc(news.crawlDate))

    return results
}

/**
 * 指定日の公開済みニュース記事リストを取得
 */
export async function getNewsByDate(date: string): Promise<NewsArticle[]> {
    const results = await db
        .select({
            title: news.title,
            source: news.source,
            url: news.url,
            summary: news.summary,
            publishedAt: news.publishedAt,
        })
        .from(news)
        .where(
            and(
                eq(news.isPublished, true),
                eq(news.crawlDate, date),
            ),
        )

    return results
}

/**
 * 全公開済みニュース日付一覧を取得（generateStaticParams 用）
 */
export async function getAllNewsDates(): Promise<string[]> {
    const results = await db
        .selectDistinct({ crawlDate: news.crawlDate })
        .from(news)
        .where(eq(news.isPublished, true))

    return results.map((r) => r.crawlDate)
}
