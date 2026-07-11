import { createClient } from "@libsql/client"
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql"
import { beforeEach, describe, expect, it, vi } from "vitest"

import * as schema from "../db/schema"

// 共有 drizzle インスタンス（service/lib/db の `db`）を、テスト用のインメモリ DB に差し替える。
// getter 経由で参照することで、beforeEach で再生成した最新の DB を各テストから使える。
const mocks = vi.hoisted(() => ({
    db: null as unknown as LibSQLDatabase<typeof schema>,
}))

vi.mock("../db", () => ({
    get db() {
        return mocks.db
    },
}))

import {
    createArticle,
    deleteArticle,
    getArticleBySlug,
    getPublishedArticleBySlug,
    listArticles,
    listPublishedArticles,
    listPublishedArticlesByTag,
    setArticleStatus,
    updateArticle,
} from "./index"

// schema.ts の articles / article_tags / tags 定義に一致する DDL。
// db:push 相当のスキーマをインメモリ SQLite 上に再現し、cascade 検証のため外部キーを有効化する。
const DDL = `
PRAGMA foreign_keys = ON;
CREATE TABLE tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);
CREATE TABLE articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    CONSTRAINT articles_status_check CHECK (status IN ('draft', 'published'))
);
CREATE TABLE article_tags (
    article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, tag_id)
);
`

async function insertTag(name: string): Promise<number> {
    const [tag] = await mocks.db.insert(schema.tags).values({ name }).returning()
    return tag.id
}

beforeEach(async () => {
    const client = createClient({ url: ":memory:" })
    await client.executeMultiple(DDL)
    mocks.db = drizzle(client, { schema })
})

describe("articles data access", () => {
    it("creates an article with tags and defaults to draft", async () => {
        const tagId = await insertTag("typescript")

        const article = await createArticle({
            slug: "hello-world",
            title: "Hello World",
            body: "# Hi",
            tagIds: [tagId],
        })

        expect(article.id).toBeGreaterThan(0)
        expect(article.slug).toBe("hello-world")
        expect(article.status).toBe("draft")
        expect(article.tags).toEqual([{ id: tagId, name: "typescript" }])
    })

    it("toggles status between draft and published", async () => {
        const created = await createArticle({ slug: "s", title: "T", body: "B" })

        const published = await setArticleStatus(created.id, "published")
        expect(published?.status).toBe("published")

        const draft = await setArticleStatus(created.id, "draft")
        expect(draft?.status).toBe("draft")
    })

    it("lists all articles for admin but only published for the public list", async () => {
        await createArticle({ slug: "pub", title: "P", body: "B", status: "published" })
        await createArticle({ slug: "dft", title: "D", body: "B", status: "draft" })

        const all = await listArticles()
        const published = await listPublishedArticles()

        expect(all.map((a) => a.slug).sort()).toEqual(["dft", "pub"])
        expect(published.map((a) => a.slug)).toEqual(["pub"])
    })

    it("fetches an article by slug, published-only for the public detail", async () => {
        const created = await createArticle({
            slug: "draft-post",
            title: "T",
            body: "B",
            status: "draft",
        })

        // 管理用は draft でも引ける。
        expect(await getArticleBySlug("draft-post")).not.toBeNull()
        // 公開詳細用は draft を返さない。
        expect(await getPublishedArticleBySlug("draft-post")).toBeNull()

        await setArticleStatus(created.id, "published")
        const publicView = await getPublishedArticleBySlug("draft-post")
        expect(publicView?.slug).toBe("draft-post")
    })

    it("filters published articles by tag id and tag slug", async () => {
        const tsId = await insertTag("typescript")
        const goId = await insertTag("go")

        await createArticle({
            slug: "ts-pub",
            title: "T",
            body: "B",
            status: "published",
            tagIds: [tsId],
        })
        await createArticle({
            slug: "go-pub",
            title: "G",
            body: "B",
            status: "published",
            tagIds: [goId],
        })
        // 同じタグでも draft は絞り込み結果に出ない。
        await createArticle({
            slug: "ts-draft",
            title: "TD",
            body: "B",
            status: "draft",
            tagIds: [tsId],
        })

        const byId = await listPublishedArticlesByTag({ tagId: tsId })
        expect(byId.map((a) => a.slug)).toEqual(["ts-pub"])

        const bySlug = await listPublishedArticlesByTag({ tagSlug: "go" })
        expect(bySlug.map((a) => a.slug)).toEqual(["go-pub"])
    })

    it("updates body/meta and replaces tag links", async () => {
        const tsId = await insertTag("typescript")
        const goId = await insertTag("go")

        const created = await createArticle({
            slug: "u",
            title: "T",
            body: "old",
            tagIds: [tsId],
        })

        const updated = await updateArticle(created.id, {
            title: "T2",
            body: "new",
            tagIds: [goId],
        })

        expect(updated?.title).toBe("T2")
        expect(updated?.body).toBe("new")
        expect(updated?.tags).toEqual([{ id: goId, name: "go" }])
    })

    it("deletes an article and cascades its tag links", async () => {
        const tsId = await insertTag("typescript")
        const created = await createArticle({
            slug: "gone",
            title: "T",
            body: "B",
            tagIds: [tsId],
        })

        await deleteArticle(created.id)

        expect(await getArticleBySlug("gone")).toBeNull()
        const links = await mocks.db.select().from(schema.articleTags)
        expect(links).toHaveLength(0)
    })
})
