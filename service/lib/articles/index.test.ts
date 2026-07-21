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

// データ取得層が「握りつぶし」をしていないことを検証するための、必ず失敗する DB スタブ。
// どのクエリビルダ入口（select/insert/update/delete）を叩いても即座に例外を投げるため、
// data-access 関数がエラーを catch して空値へ潰していれば reject にならず、テストが落ちる。
function throwingDb(message = "database unavailable"): LibSQLDatabase<typeof schema> {
    const fail = () => {
        throw new Error(message)
    }
    return {
        select: fail,
        insert: fail,
        update: fail,
        delete: fail,
    } as unknown as LibSQLDatabase<typeof schema>
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

/**
 * エラー伝播（握りつぶし禁止）契約テスト。
 *
 * これらの data-access 関数は、公開ブログの Server Component
 * （listPublishedArticles → /blog、getPublishedArticleBySlug → /blog/[slug]）と
 * studio の Server Action の土台になっている。DB アクセスが失敗したとき、関数が
 * その例外を catch して空配列 / null に潰してしまうと、Next.js の App Router は
 * 正常応答とみなし app/error.tsx（致命時は app/global-error.tsx）へ到達しない。
 *
 * ここでは必ず失敗する DB スタブ（throwingDb）を差し込み、各公開関数が
 * 「reject（例外伝播）」することを固定する。これにより:
 *   - 「見つからない（空一覧 / null）」という意図的フォールバックは既存テストで維持しつつ、
 *   - 「本来ユーザーに障害として見せるべき DB 障害」は throw され error boundary に届く、
 * という 2 つの経路の切り分けを回帰的に守る。
 */
describe("error propagation to the error boundary (no swallowing)", () => {
    it("rejects when the public blog list query fails (does not swallow into [])", async () => {
        // Given the DB is unavailable when the /blog Server Component fetches the list
        // When listPublishedArticles runs
        // Then it rejects so Next.js renders app/error.tsx (not an empty list)
        mocks.db = throwingDb()
        await expect(listPublishedArticles()).rejects.toThrow("database unavailable")
    })

    it("rejects when the public blog detail query fails (does not swallow into null)", async () => {
        // Given the DB is unavailable when the /blog/[slug] Server Component fetches the article
        // When getPublishedArticleBySlug runs
        // Then it rejects (a DB fault must not be indistinguishable from a missing article)
        mocks.db = throwingDb()
        await expect(getPublishedArticleBySlug("hello-world")).rejects.toThrow(
            "database unavailable",
        )
    })

    it("rejects when the tag-filtered published list query fails", async () => {
        // Given the DB is unavailable when filtering the public list by tag
        // When listPublishedArticlesByTag runs
        // Then it rejects rather than returning an empty result set
        mocks.db = throwingDb()
        await expect(
            listPublishedArticlesByTag({ tagSlug: "typescript" }),
        ).rejects.toThrow("database unavailable")
        await expect(
            listPublishedArticlesByTag({ tagId: 1 }),
        ).rejects.toThrow("database unavailable")
    })

    it("rejects when the admin article list query fails", async () => {
        // Given the DB is unavailable when the studio list Server Component fetches articles
        // When listArticles runs
        // Then it rejects so the studio segment surfaces the failure via error.tsx
        mocks.db = throwingDb()
        await expect(listArticles()).rejects.toThrow("database unavailable")
    })

    it("rejects when the admin article-by-slug query fails", async () => {
        // Given the DB is unavailable when fetching a single article for editing
        // When getArticleBySlug runs
        // Then it rejects rather than swallowing the fault into null
        mocks.db = throwingDb()
        await expect(getArticleBySlug("hello-world")).rejects.toThrow(
            "database unavailable",
        )
    })

    it("rejects when the create Server Action write fails", async () => {
        // Given the DB is unavailable when the create Server Action inserts a row
        // When createArticle runs
        // Then it rejects so the caller can propagate the failure to the error boundary
        mocks.db = throwingDb()
        await expect(
            createArticle({ slug: "x", title: "T", body: "B" }),
        ).rejects.toThrow("database unavailable")
    })

    it("rejects when the update Server Action write fails", async () => {
        // Given the DB is unavailable when the update Server Action mutates a row
        // When updateArticle runs
        // Then it rejects instead of silently reporting success
        mocks.db = throwingDb()
        await expect(
            updateArticle(1, { title: "T2" }),
        ).rejects.toThrow("database unavailable")
    })

    it("rejects when the status-toggle Server Action write fails", async () => {
        // Given the DB is unavailable when toggling publish state
        // When setArticleStatus runs
        // Then it rejects rather than swallowing the write error into null
        mocks.db = throwingDb()
        await expect(
            setArticleStatus(1, "published"),
        ).rejects.toThrow("database unavailable")
    })

    it("rejects when the delete Server Action write fails", async () => {
        // Given the DB is unavailable when the delete Server Action removes a row
        // When deleteArticle runs
        // Then it rejects so the failure reaches the error boundary
        mocks.db = throwingDb()
        await expect(deleteArticle(1)).rejects.toThrow("database unavailable")
    })
})
