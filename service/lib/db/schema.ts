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

// /contact のフォームから届いた問い合わせ。
// 通知（Slack / メール）より先にここへ保存することで、通知が全滅しても内容は失われない。
export const contacts = sqliteTable(
    "contacts",
    {
        // ASSUMPTION: 主キー・タイムスタンプの持ち方は既存 books / articles に合わせる
        id: integer().primaryKey({ autoIncrement: true }),
        name: text().notNull(),
        email: text().notNull(),
        // 会社・組織名。個人からの問い合わせもあるため任意。
        company: text(),
        // 相談種別。DB レベルは下記 check() で 3 値に制約する。
        category: text().notNull().default("work"),
        message: text().notNull(),
        // 通知の到達状況。保存が先・通知が後なので、
        // 「保存されたが通知が飛んでいない問い合わせ」をここから拾える。
        notifiedSlack: integer("notified_slack", { mode: "boolean" })
            .notNull()
            .default(false),
        notifiedEmail: integer("notified_email", { mode: "boolean" })
            .notNull()
            .default(false),
        createdAt: text("created_at")
            .notNull()
            .default(sql`(datetime('now'))`),
    },
    (table) => [
        check(
            "contacts_category_check",
            sql`${table.category} IN ('work', 'tech', 'other')`
        ),
    ]
)
