import { describe, it, expect } from "vitest"
import { getTableConfig, SQLiteSyncDialect } from "drizzle-orm/sqlite-core"
import { articles, articleTags, tags } from "./schema"

const dialect = new SQLiteSyncDialect()

describe("articles schema", () => {
    const config = getTableConfig(articles)

    it("は articles テーブルとして定義される", () => {
        expect(config.name).toBe("articles")
    })

    it("slug は not null かつ unique（ルーティング/単体取得キーの契約）", () => {
        const slug = config.columns.find((c) => c.name === "slug")
        expect(slug).toBeDefined()
        expect(slug!.notNull).toBe(true)
        expect(slug!.isUnique).toBe(true)
    })

    it("title / body は not null の text カラムを持つ", () => {
        const title = config.columns.find((c) => c.name === "title")
        const body = config.columns.find((c) => c.name === "body")
        expect(title?.notNull).toBe(true)
        expect(body?.notNull).toBe(true)
    })

    it("canonical_url は外部媒体からの再掲記事だけが使う nullable カラム", () => {
        const canonicalUrl = config.columns.find((c) => c.name === "canonical_url")
        expect(canonicalUrl).toBeDefined()
        expect(canonicalUrl!.notNull).toBe(false)
    })

    it("status は default 'draft' の not null カラム", () => {
        const status = config.columns.find((c) => c.name === "status")
        expect(status).toBeDefined()
        expect(status!.notNull).toBe(true)
        expect(status!.default).toBe("draft")
    })

    it("status は check() で 'draft' | 'published' のみに DB レベル制約される", () => {
        expect(config.checks.length).toBeGreaterThan(0)
        const statusCheck = config.checks.find((c) => c.name === "articles_status_check")
        expect(statusCheck).toBeDefined()
        const sqlStr = dialect.sqlToQuery(statusCheck!.value).sql
        expect(sqlStr).toContain("'draft'")
        expect(sqlStr).toContain("'published'")
    })
})

describe("article_tags schema", () => {
    const config = getTableConfig(articleTags)

    it("は article_tags テーブルとして定義される", () => {
        expect(config.name).toBe("article_tags")
    })

    it("(article_id, tag_id) の複合主キーを持つ", () => {
        expect(config.primaryKeys.length).toBe(1)
        const pkColumns = config.primaryKeys[0].columns.map((c) => c.name).sort()
        expect(pkColumns).toEqual(["article_id", "tag_id"])
    })

    it("article_id / tag_id は onDelete cascade の外部キー", () => {
        expect(config.foreignKeys.length).toBe(2)
        for (const fk of config.foreignKeys) {
            expect(fk.onDelete).toBe("cascade")
        }
    })

    it("tag_id は既存 tags テーブルを参照する（記事用タグテーブルは新設しない）", () => {
        const tagsConfig = getTableConfig(tags)
        const referencesTags = config.foreignKeys.some((fk) => {
            const ref = fk.reference()
            return ref.foreignTable === tags || getTableConfig(ref.foreignTable).name === tagsConfig.name
        })
        expect(referencesTags).toBe(true)
    })
})
