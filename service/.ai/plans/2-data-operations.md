# 実装計画 2: データ操作（DB・API・認証）

## 概要

Turso (libSQL) + Drizzle ORM によるデータ永続化、NextAuth.js v5 による認証、APIルートハンドラを構築する。
計画1のモックデータ取得を実DB接続に置き換える。

---

## 実装ステップ

### Step 1: Turso DBセットアップ

**前提:** Turso CLIがインストール済みであること

```bash
turso db create homepage-books
turso db tokens create homepage-books
```

**環境変数（`.env.local`）:**

```
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
```

- (要確認) Tursoのアカウント・CLIは既にセットアップ済みか。未セットアップの場合、手順をガイドする

### Step 2: Drizzle ORM 設定

**インストール:**

```bash
pnpm add drizzle-orm @libsql/client
pnpm add -D drizzle-kit
```

**作成ファイル:** `drizzle.config.ts`

```typescript
import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
})
```

**作成ファイル:** `lib/db/index.ts`

- `@libsql/client` で Turso クライアント作成
- `drizzle()` でDrizzleインスタンス生成・エクスポート

### Step 3: スキーマ定義

**作成ファイル:** `lib/db/schema.ts`

```typescript
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"

export const books = sqliteTable("books", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  author: text("author").notNull(),
  publisher: text("publisher"),
  publishedYear: integer("published_year"),
  isbn: text("isbn"),
  officialUrl: text("official_url"),
  memo: text("memo"),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
})

export const tags = sqliteTable("tags", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
})

export const bookTags = sqliteTable("book_tags", {
  bookId: integer("book_id").notNull().references(() => books.id, { onDelete: "cascade" }),
  tagId: integer("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
}, (table) => ({
  pk: primaryKey({ columns: [table.bookId, table.tagId] }),
}))
```

**マイグレーション実行:**

```bash
pnpm drizzle-kit generate
pnpm drizzle-kit push
```

### Step 4: NextAuth.js v5 設定

**インストール:**

```bash
pnpm add next-auth@beta @auth/drizzle-adapter
```

- (要確認) NextAuth v5 (Auth.js) は Cloudflare Workers 上での動作にEdgeランタイム対応が必要。`@auth/core` のEdge対応状況を確認する必要がある。もし制約がある場合、Node.jsランタイムのAPI RouteでNextAuthを動かし、middlewareではセッションcookieの存在チェックのみ行う構成に切り替える

**作成ファイル:** `lib/auth.ts`

```typescript
import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  callbacks: {
    signIn({ profile }) {
      // 許可されたGitHubアカウントのみ
      return profile?.login === process.env.ALLOWED_GITHUB_ID
    },
  },
})
```

**環境変数（追加分）:**

```
AUTH_SECRET=...
AUTH_GITHUB_ID=...
AUTH_GITHUB_SECRET=...
ALLOWED_GITHUB_ID=satoshi-onga
```

- (要確認) GitHubのユーザー名（login）が `satoshi-onga` で合っているか

**作成ファイル:** `app/api/auth/[...nextauth]/route.ts`

```typescript
import { handlers } from "@/lib/auth"
export const { GET, POST } = handlers
```

### Step 5: middleware（認証ガード）

**作成ファイル:** `middleware.ts`（serviceディレクトリ直下）

```typescript
export { auth as middleware } from "@/lib/auth"

export const config = {
  matcher: ["/studio/:path*"],
}
```

- `/studio` 配下へのアクセスのみ認証チェック
- 未認証の場合、NextAuthのサインインページへリダイレクト

### Step 6: APIルートハンドラ

**作成ファイル:** `app/api/books/route.ts`

- `GET`: 書籍一覧取得
  - クエリパラメータ: `q`（全文検索）, `tag`（タグフィルタ）, `sort`（title|publishedYear）, `order`（asc|desc）
  - JOINでタグ情報を含めて返却
- `POST`: 書籍登録（認証必須）
  - リクエストボディ: 書籍情報 + tagIds or tagNames
  - 新規タグ名が含まれる場合はtagsテーブルにも挿入
  - トランザクションで books + book_tags を一括登録

**作成ファイル:** `app/api/books/[id]/route.ts`

- `GET`: 書籍詳細取得
- `PUT`: 書籍更新（認証必須）
  - book_tags を洗い替え（DELETE → INSERT）
- `DELETE`: 書籍削除（認証必須）
  - CASCADE で book_tags も削除

**作成ファイル:** `app/api/tags/route.ts`

- `GET`: タグ一覧取得
- `POST`: タグ作成（認証必須）

**認証チェック共通パターン:**

```typescript
import { auth } from "@/lib/auth"

// 各書き込みAPIハンドラ内
const session = await auth()
if (!session) {
  return Response.json({ error: "Unauthorized" }, { status: 401 })
}
```

### Step 7: lib/books.ts をDB接続に切り替え

計画1で作成したモックデータ読み込みを、APIフェッチまたはDB直接クエリに置き換える。

- サーバーコンポーネントからはDB直接クエリ（`lib/db` 経由）
- クライアントコンポーネント（検索・フィルタ操作）からは `/api/books` をフェッチ

---

## 作成・変更ファイル一覧

| 操作 | ファイル | 内容 |
|------|----------|------|
| 新規 | `drizzle.config.ts` | Drizzle Kit設定 |
| 新規 | `lib/db/index.ts` | DBクライアント |
| 新規 | `lib/db/schema.ts` | テーブルスキーマ |
| 新規 | `lib/auth.ts` | NextAuth設定 |
| 新規 | `middleware.ts` | 認証ガード |
| 新規 | `app/api/auth/[...nextauth]/route.ts` | NextAuthハンドラ |
| 新規 | `app/api/books/route.ts` | 書籍一覧・登録API |
| 新規 | `app/api/books/[id]/route.ts` | 書籍詳細・更新・削除API |
| 新規 | `app/api/tags/route.ts` | タグ一覧・作成API |
| 変更 | `lib/books.ts` | モック→DB接続に切り替え |
| 変更 | `.env.local` | 環境変数追加 |
| 変更 | `package.json` | 依存パッケージ追加 |

## 検証方法

- `pnpm drizzle-kit push` でマイグレーション成功
- `curl GET /api/books` で空配列が返ること
- `curl POST /api/books`（認証なし）で 401 が返ること
- GitHub OAuthログイン → セッション取得成功
- ログイン状態で `POST /api/books` → 登録成功
- `/books` ページがDB経由のデータで表示されること
- `/studio` に未認証アクセス → サインインページへリダイレクト
