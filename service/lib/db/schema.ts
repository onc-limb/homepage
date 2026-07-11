import { sqliteTable, text, integer, primaryKey, check } from "drizzle-orm/sqlite-core"
import { sql } from "drizzle-orm"

export const books = sqliteTable("books", {
    id: integer().primaryKey({ autoIncrement: true }),
    title: text().notNull(),
    author: text().notNull(),
    publisher: text(),
    publishedYear: integer("published_year"),
    isbn: text(),
    officialUrl: text("official_url"),
    ogpImage: text("ogp_image"),
    memo: text(),
    isRead: integer("is_read", { mode: "boolean" }).notNull().default(false),
    createdAt: text("created_at")
        .notNull()
        .default(sql`(datetime('now'))`),
    updatedAt: text("updated_at")
        .notNull()
        .default(sql`(datetime('now'))`),
})

export const tags = sqliteTable("tags", {
    id: integer().primaryKey({ autoIncrement: true }),
    name: text().notNull().unique(),
})

export const bookTags = sqliteTable(
    "book_tags",
    {
        bookId: integer("book_id")
            .notNull()
            .references(() => books.id, { onDelete: "cascade" }),
        tagId: integer("tag_id")
            .notNull()
            .references(() => tags.id, { onDelete: "cascade" }),
    },
    (table) => [
        primaryKey({ columns: [table.bookId, table.tagId] }),
    ]
)

export const news = sqliteTable("news", {
    id: integer().primaryKey({ autoIncrement: true }),
    title: text().notNull(),
    source: text().notNull(),
    url: text().notNull().unique(),
    summary: text(),
    publishedAt: text("published_at").notNull(),
    crawledAt: text("crawled_at")
        .notNull()
        .default(sql`(datetime('now'))`),
    isPublished: integer("is_published", { mode: "boolean" }).notNull().default(true),
    crawlDate: text("crawl_date").notNull(),
})

// 技術記事本体テーブル。既存 books と同じ「コンテンツ本体テーブル」パターンに揃える。
// ルーティングキーの契約: 記事詳細ページ /blog/[slug] は slug で引く（id ルーティングは不採用）。
export const articles = sqliteTable(
    "articles",
    {
        // ASSUMPTION: 主キー方式は既存 books に合わせて autoIncrement の integer 主キー
        id: integer().primaryKey({ autoIncrement: true }),
        // slug は公開サイトのルーティングキー。単体取得キーでもあるため一意制約を課す。
        slug: text().notNull().unique(),
        title: text().notNull(),
        // Markdown 長文本文。react-markdown + remark-gfm で表示する。
        body: text().notNull(),
        // 下書き / 公開の 2 状態。DB レベルは下記 check() で 'draft' | 'published' に制約する。
        status: text().notNull().default("draft"),
        // ASSUMPTION: タイムスタンプの持ち方は既存 books に合わせて text + datetime('now')
        createdAt: text("created_at")
            .notNull()
            .default(sql`(datetime('now'))`),
        updatedAt: text("updated_at")
            .notNull()
            .default(sql`(datetime('now'))`),
    },
    (table) => [
        check("articles_status_check", sql`${table.status} IN ('draft', 'published')`),
    ]
)

// 記事とタグの多対多中間テーブル。タグは既存 tags を再利用し、
// bookTags と同じ「複合主キー + onDelete cascade」パターンに揃える。
export const articleTags = sqliteTable(
    "article_tags",
    {
        articleId: integer("article_id")
            .notNull()
            .references(() => articles.id, { onDelete: "cascade" }),
        tagId: integer("tag_id")
            .notNull()
            .references(() => tags.id, { onDelete: "cascade" }),
    },
    (table) => [
        primaryKey({ columns: [table.articleId, table.tagId] }),
    ]
)
