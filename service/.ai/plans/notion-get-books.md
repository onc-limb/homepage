# 実装計画: Notion「技術書ライブラリ」からの初期データ一括挿入

## 概要

Notion の「技術書ライブラリ」データベースのデータを元に、ハードコードされたシードスクリプトを作成する。
Claude が Notion API と各書籍の公式URLから取得した情報（著者・出版社等）をスクリプトに埋め込む。
本番環境の初回セットアップおよびローカル開発環境の構築時に使用する。

---

## データソースと方針

### Notion データベースのプロパティ → schema.ts マッピング

| Notion プロパティ名 | マッピング先             | 備考                               |
| ------------------- | ------------------------ | ---------------------------------- |
| 書籍名              | `books.title`            |                                    |
| ステータス          | （使用しない）           | `isRead` は全て `false` で固定     |
| タグ                | `tags` + `bookTags`      | タグテーブルに作成し books と紐付け |
| リンク              | `books.officialUrl`      |                                    |
| タイプ              | `tags` + `bookTags`      | タグとして扱う                     |

### Notion に存在しない情報の補完

- `author`: 公式URL (officialUrl) から取得。取得できない場合は空文字 `""`
- `publisher`: 公式URLから取得。取得できない場合は `null`
- `publishedYear`: 公式URLから取得。取得できない場合は `null`
- `isbn`: 公式URLから取得。取得できない場合は `null`
- `memo`: `null`
- `isRead`: 全て `false`

---

## 実装ステップ

### Step 1: シードスクリプトの作成

**作成ファイル:** `scripts/seed.ts`

- Notion API へのランタイムアクセスは**しない**
- Claude が事前に取得・整理した114冊分のデータをハードコード
- `@libsql/client` + `drizzle-orm` を使用してDB接続・挿入

### Step 2: DB 接続の切り替え

スクリプト内で直接 `@libsql/client` + `drizzle` のインスタンスを生成する。

- **ローカル開発時:** `TURSO_DATABASE_URL` 未設定 → `file:local.db`
- **本番初回時:** `.env.local` に Turso の URL/Token を設定して実行

### Step 3: package.json にスクリプト追加

```json
{
  "scripts": {
    "db:push": "drizzle-kit push",
    "db:seed": "tsx --env-file=.env.local scripts/seed.ts"
  }
}
```

---

## スクリプトの処理フロー

```
1. DB 接続を作成（環境変数で切替）
2. 既存データをクリア（DELETE FROM book_tags, books, tags）
3. タグ一覧を抽出・重複排除して tags テーブルに INSERT
4. tags テーブルから全タグを SELECT して name → id のマップを作成
5. books テーブルに各書籍を INSERT し、返された id を取得
6. bookTags テーブルに (bookId, tagId) のペアを INSERT
7. 挿入件数をコンソール出力
```

冪等性: 実行前に全テーブルをクリアして再挿入するため、何度実行しても同じ結果になる。

---

## 作成・変更ファイル一覧

| 操作 | ファイル           | 内容                                |
| ---- | ------------------ | ----------------------------------- |
| 新規 | `scripts/seed.ts`  | ハードコードデータの一括挿入スクリプト |
| 変更 | `package.json`     | `db:push`, `db:seed` スクリプト追加 |

## 使い方（完成後）

### ローカル開発環境の初期構築

```bash
cd service
pnpm db:push                 # スキーマをローカル SQLite に反映
pnpm db:seed                 # ハードコードデータ → ローカル DB に挿入
```

### 本番（Turso）の初回セットアップ

```bash
cd service
# .env.local に TURSO_DATABASE_URL, TURSO_AUTH_TOKEN を設定済みであること
pnpm db:push                 # スキーマを Turso に反映
pnpm db:seed                 # ハードコードデータ → Turso に挿入
```

## 検証方法

- `pnpm db:seed` を実行し、エラーなく完了すること
- 挿入件数（114冊、タグ数）がコンソールに表示されること
- `pnpm dev` でアプリを起動し `/books` ページに書籍が表示されること
- タグのフィルタリングが正しく動作すること
- 2回実行してもエラーにならないこと（冪等性）
