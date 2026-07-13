import { count, countDistinct, eq } from "drizzle-orm"

import { db } from "./db"
import { articles, bookTags, books } from "./db/schema"

/**
 * トップ STATS 4 枠の実績指標。すべて既存スキーマ（books / articles / book_tags）
 * からの集計値で、私的指標（書籍予算・curiosity）は含まない。
 *
 * - readBooksCount:        読了書籍数（books.is_read = true）
 * - publishedArticlesCount: 公開記事数（articles.status = 'published'）
 * - usedTagCount:          実際に使用されているユニークタグ数
 * - totalBooksCount:       総書籍数（4 枠目）
 */
export type HomeStats = {
    readBooksCount: number
    publishedArticlesCount: number
    usedTagCount: number
    totalBooksCount: number
}

/**
 * `select({ value: count()/countDistinct() })` の結果（1 行）から数値を取り出す。
 * 対象が 0 件のときは空配列になり得るため 0 にフォールバックする。
 */
async function scalar(query: PromiseLike<Array<{ value: number }>>): Promise<number> {
    const rows = await query
    return rows[0]?.value ?? 0
}

/** 読了書籍数。未読（is_read = false）はカウントしない。 */
export async function countReadBooks(): Promise<number> {
    return scalar(db.select({ value: count() }).from(books).where(eq(books.isRead, true)))
}

/** 総書籍数（読了・未読を問わない全件）。 */
export async function countTotalBooks(): Promise<number> {
    return scalar(db.select({ value: count() }).from(books))
}

/** 公開記事数。下書き（draft）はカウントしない。 */
export async function countPublishedArticles(): Promise<number> {
    return scalar(
        db.select({ value: count() }).from(articles).where(eq(articles.status, "published"))
    )
}

/**
 * 実際に使用されているユニークタグ数。book_tags に紐づくタグのみを数え、
 * 未使用タグ（tags にあるが book_tags から参照されていないもの）は含めない。
 *
 * ASSUMPTION: 集計対象は親 issue の厳密定義に従い book_tags 由来のユニークタグに限定する。
 * 記事タグ（article_tags）も「扱った技術領域」に含めたい場合は countDistinct を
 * article_tags との UNION に拡張すればよいが、本実装では対象外とする。
 */
export async function countUsedTags(): Promise<number> {
    return scalar(db.select({ value: countDistinct(bookTags.tagId) }).from(bookTags))
}

/**
 * トップ STATS 4 枠をリクエスト時に動的集計する（SSR）。
 *
 * 呼び出し側ページを動的レンダリングにしておくことで、/studio から本を読了にする／
 * 記事を公開すると再デプロイなしで次回アクセス時のトップに反映される。読取消費を
 * 抑えたい場合は呼び出し側で軽い再検証（revalidate）を掛ける。
 */
export async function getHomeStats(): Promise<HomeStats> {
    const [readBooksCount, publishedArticlesCount, usedTagCount, totalBooksCount] =
        await Promise.all([
            countReadBooks(),
            countPublishedArticles(),
            countUsedTags(),
            countTotalBooks(),
        ])

    return {
        readBooksCount,
        publishedArticlesCount,
        usedTagCount,
        totalBooksCount,
    }
}
