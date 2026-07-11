// 記事の読み取りデータアクセス（articles-data-access の一部）。
// 書き込み系（createArticle / updateArticle / deleteArticle / setArticleStatus）と同じ
// data-access レイヤに属し、DB (drizzle + libsql/Turso) へのアクセスはこの層に閉じる。
// studio (app) 層は本モジュールの読み取り関数のみを利用し、DB へ直接触れない。
// ASSUMPTION: @/lib/db は drizzle インスタンスを `db` として export する
//             （既存 books と同じ「drizzle + libsql (Turso)」レイヤの慣例）。
import { desc, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { articles, articleTags, tags } from "@/lib/db/schema"
import type {
    ArticleDetail,
    ArticleListItem,
    ArticleStatus,
    TagOption,
} from "@/components/studio/articles"

// タグ選択候補（既存 tags テーブルを再利用する）。
export async function getAllTags(): Promise<TagOption[]> {
    return db
        .select({ id: tags.id, name: tags.name })
        .from(tags)
        .orderBy(tags.name)
}

// 一覧用：下書きも含めた全記事を、更新日時の新しい順で返す。
export async function getArticles(): Promise<ArticleListItem[]> {
    const rows = await db
        .select({
            id: articles.id,
            title: articles.title,
            slug: articles.slug,
            status: articles.status,
            updatedAt: articles.updatedAt,
        })
        .from(articles)
        .orderBy(desc(articles.updatedAt))

    // status は DB 上 text。UI 型 (ArticleStatus) は 'draft' | 'published' に絞る
    // （schema の check 制約でこの 2 値に限定済み）。
    return rows.map((row) => ({
        id: row.id,
        title: row.title,
        slug: row.slug,
        status: row.status as ArticleStatus,
        updatedAt: row.updatedAt,
    }))
}

// 編集用：本文・タグ込みの単一記事。存在しなければ null。
export async function getArticleById(
    id: number
): Promise<ArticleDetail | null> {
    const rows = await db
        .select({
            id: articles.id,
            title: articles.title,
            slug: articles.slug,
            body: articles.body,
            status: articles.status,
            updatedAt: articles.updatedAt,
        })
        .from(articles)
        .where(eq(articles.id, id))
        .limit(1)

    const article = rows[0]
    if (!article) {
        return null
    }

    // 中間テーブル article_tags 経由で既存 tags を引く。
    const tagRows = await db
        .select({ id: tags.id, name: tags.name })
        .from(articleTags)
        .innerJoin(tags, eq(articleTags.tagId, tags.id))
        .where(eq(articleTags.articleId, id))

    return {
        id: article.id,
        title: article.title,
        slug: article.slug,
        body: article.body,
        status: article.status as ArticleStatus,
        updatedAt: article.updatedAt,
        tags: tagRows,
    }
}
