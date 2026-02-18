import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client);

// news テーブルのスキーマ定義（service/lib/db/schema.ts と同期）
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
});
