import { and, desc, eq, inArray, sql } from "drizzle-orm"

import { db } from "../db"
import { articles, articleTags, tags } from "../db/schema"

// ASSUMPTION: 記事のデータアクセスは既存 books（service/lib/books.ts）と同じく、
// 共有 drizzle インスタンス（service/lib/db の `db`）を直接使うモジュール関数として実装する。
// books.ts が単一ファイルなのに対し、本 issue の対象パスは service/lib/articles/** のため、
// ディレクトリ配下の index.ts に配置する。

// 記事の公開状態。schema.ts の check("articles_status_check") と対応する 2 状態。
export type ArticleStatus = "draft" | "published"

// ASSUMPTION: タグの join 表現は「id + name の配列」とする（tags テーブルは id/name のみを持つため）。
export type ArticleTag = {
    id: number
    name: string
}

export type Article = typeof articles.$inferSelect

export type ArticleWithTags = Article & {
    tags: ArticleTag[]
}

export type CreateArticleInput = {
    slug: string
    title: string
    body: string
    status?: ArticleStatus
    // 関連付けるタグ（既存 tags の id 配列）。
    tagIds?: number[]
}

export type UpdateArticleInput = {
    slug?: string
    title?: string
    body?: string
    status?: ArticleStatus
    // 指定された場合のみタグ関連を置き換える（undefined は「変更なし」）。
    tagIds?: number[]
}

// ASSUMPTION: tags テーブルに slug カラムは無いため、公開一覧のタグ絞り込みで言う「tag slug」は
// タグの一意な name を指すものと解釈する（tagId での絞り込みも併せて提供する）。
export type ArticleTagFilter = { tagId: number } | { tagSlug: string }

// 単一記事に紐づくタグを id/name の配列で取得する。
async function getTagsForArticle(articleId: number): Promise<ArticleTag[]> {
    return db
        .select({ id: tags.id, name: tags.name })
        .from(articleTags)
        .innerJoin(tags, eq(articleTags.tagId, tags.id))
        .where(eq(articleTags.articleId, articleId))
}

// 複数記事に対してタグをまとめて取得し、各記事へ join した形に整形する。
async function attachTags(rows: Article[]): Promise<ArticleWithTags[]> {
    if (rows.length === 0) {
        return []
    }

    const ids = rows.map((row) => row.id)
    const joined = await db
        .select({
            articleId: articleTags.articleId,
            id: tags.id,
            name: tags.name,
        })
        .from(articleTags)
        .innerJoin(tags, eq(articleTags.tagId, tags.id))
        .where(inArray(articleTags.articleId, ids))

    const byArticle = new Map<number, ArticleTag[]>()
    for (const row of joined) {
        const list = byArticle.get(row.articleId) ?? []
        list.push({ id: row.id, name: row.name })
        byArticle.set(row.articleId, list)
    }

    return rows.map((row) => ({ ...row, tags: byArticle.get(row.id) ?? [] }))
}

// article_tags を指定タグ集合で置き換える。
async function replaceArticleTags(articleId: number, tagIds: number[]): Promise<void> {
    await db.delete(articleTags).where(eq(articleTags.articleId, articleId))
    if (tagIds.length > 0) {
        await db
            .insert(articleTags)
            .values(tagIds.map((tagId) => ({ articleId, tagId })))
    }
}

// 記事を作成し、必要ならタグ関連を設定する。
export async function createArticle(input: CreateArticleInput): Promise<ArticleWithTags> {
    const [created] = await db
        .insert(articles)
        .values({
            slug: input.slug,
            title: input.title,
            body: input.body,
            status: input.status ?? "draft",
        })
        .returning()

    if (input.tagIds && input.tagIds.length > 0) {
        await db
            .insert(articleTags)
            .values(input.tagIds.map((tagId) => ({ articleId: created.id, tagId })))
    }

    return { ...created, tags: await getTagsForArticle(created.id) }
}

// 記事の本文・メタ・タグ関連を更新する。存在しない場合は null を返す。
export async function updateArticle(
    id: number,
    input: UpdateArticleInput
): Promise<ArticleWithTags | null> {
    const [updated] = await db
        .update(articles)
        .set({
            ...(input.slug !== undefined ? { slug: input.slug } : {}),
            ...(input.title !== undefined ? { title: input.title } : {}),
            ...(input.body !== undefined ? { body: input.body } : {}),
            ...(input.status !== undefined ? { status: input.status } : {}),
            updatedAt: sql`(datetime('now'))`,
        })
        .where(eq(articles.id, id))
        .returning()

    if (!updated) {
        return null
    }

    if (input.tagIds !== undefined) {
        await replaceArticleTags(id, input.tagIds)
    }

    return { ...updated, tags: await getTagsForArticle(id) }
}

// 記事を削除する。article_tags は onDelete cascade で連動して削除される。
export async function deleteArticle(id: number): Promise<void> {
    await db.delete(articles).where(eq(articles.id, id))
}

// 公開状態を切り替える（'draft' | 'published'）。存在しない場合は null を返す。
export async function setArticleStatus(
    id: number,
    status: ArticleStatus
): Promise<Article | null> {
    const [updated] = await db
        .update(articles)
        .set({ status, updatedAt: sql`(datetime('now'))` })
        .where(eq(articles.id, id))
        .returning()

    return updated ?? null
}

// 管理用一覧: 全件（draft を含む）を新しい順で返す。
export async function listArticles(): Promise<ArticleWithTags[]> {
    const rows = await db
        .select()
        .from(articles)
        .orderBy(desc(articles.createdAt))

    return attachTags(rows)
}

// 公開用一覧: status='published' の記事のみを新しい順で返す。
export async function listPublishedArticles(): Promise<ArticleWithTags[]> {
    const rows = await db
        .select()
        .from(articles)
        .where(eq(articles.status, "published"))
        .orderBy(desc(articles.createdAt))

    return attachTags(rows)
}

// 公開一覧のタグ絞り込み: tagId もしくは tag slug(=タグ名) で published 記事を絞り込む。
export async function listPublishedArticlesByTag(
    filter: ArticleTagFilter
): Promise<ArticleWithTags[]> {
    const tagCondition =
        "tagId" in filter ? eq(tags.id, filter.tagId) : eq(tags.name, filter.tagSlug)

    const matched = await db
        .select({ articleId: articleTags.articleId })
        .from(articleTags)
        .innerJoin(tags, eq(articleTags.tagId, tags.id))
        .where(tagCondition)

    const ids = matched.map((row) => row.articleId)
    if (ids.length === 0) {
        return []
    }

    const rows = await db
        .select()
        .from(articles)
        .where(and(eq(articles.status, "published"), inArray(articles.id, ids)))
        .orderBy(desc(articles.createdAt))

    return attachTags(rows)
}

// 記事単体取得は slug をキーに引く（articles-schema で確定した契約）。
// 管理用途向けに status を問わず取得する。
export async function getArticleBySlug(slug: string): Promise<ArticleWithTags | null> {
    const [row] = await db
        .select()
        .from(articles)
        .where(eq(articles.slug, slug))
        .limit(1)

    if (!row) {
        return null
    }

    return { ...row, tags: await getTagsForArticle(row.id) }
}

// 公開詳細（/blog/[slug]）向け: status='published' の記事のみを slug で取得する。
export async function getPublishedArticleBySlug(
    slug: string
): Promise<ArticleWithTags | null> {
    const [row] = await db
        .select()
        .from(articles)
        .where(and(eq(articles.slug, slug), eq(articles.status, "published")))
        .limit(1)

    if (!row) {
        return null
    }

    return { ...row, tags: await getTagsForArticle(row.id) }
}
