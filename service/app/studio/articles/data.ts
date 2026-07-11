// 記事管理 (studio) 向けの読み取り専用データアクセス。
// 書き込み系 (createArticle / updateArticle / deleteArticle / setArticleStatus) は
// @/lib/articles に実装済みだが、読み取り系 (getArticles / getArticleById /
// getAllTags) は未提供だったため、既存 drizzle スキーマ (@/lib/db/schema) を
// 直接引いてここで補う。
// ASSUMPTION: @/lib/db は既存 books のデータアクセスと同様に drizzle インスタンスを
//             `db` として named export している前提（books.ts と同じ DB レイヤーを共有）。
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

    return rows.map((row) => ({
        id: row.id,
        title: row.title,
        slug: row.slug,
        // status は text カラムのため string 型。DB の check 制約で 2 状態に限定済み。
        status: row.status as ArticleStatus,
        updatedAt: row.updatedAt,
    }))
}

// 編集用：本文・タグ込みの単一記事。存在しなければ null。
export async function getArticleById(
    id: number
): Promise<ArticleDetail | null> {
    const [row] = await db
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

    if (!row) {
        return null
    }

    // 記事に紐づくタグを article_tags 経由で取得する。
    const tagRows = await db
        .select({ id: tags.id, name: tags.name })
        .from(articleTags)
        .innerJoin(tags, eq(articleTags.tagId, tags.id))
        .where(eq(articleTags.articleId, id))

    return {
        id: row.id,
        title: row.title,
        slug: row.slug,
        body: row.body,
        status: row.status as ArticleStatus,
        updatedAt: row.updatedAt,
        tags: tagRows,
    }
}
