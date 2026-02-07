# 書籍インデックス機能 仕様書

## 1. 概要・目的

- 読んできた本を一覧できる
- どの本をどういう時に読み返せばいいかわかる
- 技術書を人にお勧めする時に活用できる

## 2. 技術スタック

- Next.js 15 (App Router) — 既存プロジェクト
- Turso (libSQL) — SQLiteホスティング
- Drizzle ORM — 型安全なDB操作
- NextAuth.js v5 + GitHub OAuth — 投稿ページの認証
- デプロイ: Cloudflare Workers (既存構成)

## 3. データモデル

### books テーブル

| カラム         | 型            | 説明                                     |
| -------------- | ------------- | ---------------------------------------- |
| id             | INTEGER PK    | 自動採番                                 |
| title          | TEXT NOT NULL | 書籍タイトル                             |
| author         | TEXT NOT NULL | 著者                                     |
| publisher      | TEXT          | 出版社                                   |
| published_year | INTEGER       | 出版年                                   |
| isbn           | TEXT          | ISBN                                     |
| official_url   | TEXT          | 出版社公式の書籍ページURL                |
| memo           | TEXT          | フリーメモ（読み返すタイミング・感想等） |
| created_at     | TEXT          | 作成日時 (ISO8601)                       |
| updated_at     | TEXT          | 更新日時 (ISO8601)                       |

### tags テーブル

| カラム | 型                   | 説明     |
| ------ | -------------------- | -------- |
| id     | INTEGER PK           | 自動採番 |
| name   | TEXT NOT NULL UNIQUE | タグ名   |

### book_tags テーブル（中間テーブル）

| カラム  | 型         | 説明     |
| ------- | ---------- | -------- |
| book_id | INTEGER FK | books.id |
| tag_id  | INTEGER FK | tags.id  |

複合主キー: (book_id, tag_id)

## 4. ページ構成

### 一覧ページ `/books`（公開）

- 書籍一覧をカード形式で表示
- 機能:
    - タグによるフィルタリング（複数選択可）
    - フリーテキスト検索（タイトル・著者・メモを対象）
    - ソート: タイトル順（あいうえお/ABC）、出版年順（新しい順/古い順）
    - タグ一覧をサイドバーまたは上部にチップ表示
- カード表示項目: OGPサムネイル（あれば）、タイトル（公式URLへのリンク）、著者、出版年、タグ、メモ（一部抜粋）
- 公式URLが設定されている場合、OGP画像（og:image）を取得してサムネイル表示
- OGP画像が取得できない場合はプレースホルダーを表示

### 管理ページ `/studio`（要認証）

- 将来的にbooks以外のコンテンツも管理できる汎用管理ページ
- `/studio` — 管理トップ（コンテンツ種別の選択）
- `/studio/books` — 書籍管理（一覧・新規登録・編集・削除）
- フォーム項目: タイトル、著者、出版社、出版年、ISBN、公式書籍ページURL、メモ、タグ（複数選択/新規作成）

## 5. APIエンドポイント (Route Handlers)

| メソッド | パス            | 認証 | 説明                                        |
| -------- | --------------- | ---- | ------------------------------------------- |
| GET      | /api/books      | 不要 | 書籍一覧取得（クエリ: q, tag, sort, order） |
| GET      | /api/books/[id] | 不要 | 書籍詳細取得                                |
| POST     | /api/books      | 必要 | 書籍登録                                    |
| PUT      | /api/books/[id] | 必要 | 書籍更新                                    |
| DELETE   | /api/books/[id] | 必要 | 書籍削除                                    |
| GET      | /api/tags       | 不要 | タグ一覧取得                                |
| POST     | /api/tags       | 必要 | タグ作成                                    |

## 6. 認証・認可

- NextAuth.js v5 (Auth.js) + GitHub Provider
- 環境変数 `ALLOWED_GITHUB_ID` で自分のGitHubアカウントIDのみ許可
- signInコールバックで許可されたユーザー以外を拒否
- `/studio` 配下はmiddlewareでセッション確認（未認証→ログインページへリダイレクト）
- 書き込みAPI (POST/PUT/DELETE) はセッション検証必須

## 7. UI/UXデザイン方針

- 既存サイトのデザインシステム（watercolorテーマ、Tailwind CSS）を踏襲
- Shadcn UIコンポーネントを活用
- レスポンシブ対応（既存のHeader/Footer内にレイアウト）
- 検索・フィルタはURLクエリパラメータで管理（共有可能）

## 8. ディレクトリ構成（新規追加分）

```
service/
├── app/
│   ├── books/
│   │   └── page.tsx              # 一覧ページ（公開）
│   ├── studio/
│   │   ├── page.tsx              # 管理トップ
│   │   └── books/
│   │       └── page.tsx          # 書籍管理ページ（要認証）
│   ├── api/
│   │   ├── books/
│   │   │   ├── route.ts          # GET(一覧), POST(登録)
│   │   │   └── [id]/
│   │   │       └── route.ts      # GET(詳細), PUT(更新), DELETE(削除)
│   │   ├── tags/
│   │   │   └── route.ts          # GET(一覧), POST(作成)
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts      # NextAuth handler
├── lib/
│   ├── db/
│   │   ├── index.ts              # Drizzle client (Turso接続)
│   │   └── schema.ts             # Drizzleスキーマ定義
│   └── auth.ts                   # NextAuth設定
├── drizzle.config.ts             # Drizzle Kit設定
└── drizzle/                      # マイグレーションファイル
```

## 9. 実装順序

1. Turso DB作成 + Drizzle設定 + スキーマ定義 + マイグレーション
2. NextAuth.js設定（GitHub OAuth）
3. APIルート実装 (books CRUD, tags)
4. 一覧ページ (`/books`) 実装
5. 管理ページ (`/studio`, `/studio/books`) 実装
6. 検索・フィルタ・ソート機能
7. 動作確認・デプロイ

## 10. 検証方法

- `pnpm dev` でローカル起動し一覧ページの表示確認
- 管理ページでGitHubログイン → 書籍CRUD操作
- 未認証状態で `/studio` アクセス → リダイレクト確認
- 未認証状態で書き込みAPI → 401確認
- 検索・フィルタ・ソートの動作確認
- `pnpm build` でビルド成功確認
