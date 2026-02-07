import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core"
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
