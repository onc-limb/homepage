# 実装計画 1: 書籍一覧ページ

## 概要

公開ページ `/books` を作成する。
DB接続はこのフェーズでは行わず、モックデータ（JSONファイル）で動作させる。

## 前提

- 既存ページ（skills, portfolio）と同じパターンに従う
- データ取得は `lib/books.ts` のユーティリティ関数経由
- モックデータは `lib/mock/books.json` に配置

---

## 実装ステップ

### Step 1: モックデータの作成

**作成ファイル:** `lib/mock/books.json`

```json
[
  {
    "id": 1,
    "title": "ドメイン駆動設計をはじめよう",
    "author": "Vlad Khononov",
    "publisher": "オライリージャパン",
    "publishedYear": 2024,
    "isbn": "978-4814400737",
    "officialUrl": "https://www.oreilly.co.jp/books/9784814400737/",
    "memo": "DDDの全体像を掴みたい時に読み返す。戦略的設計と戦術的設計の使い分けが整理されていて、実務でドメインモデリングに迷った時の指針になる。",
    "tags": ["設計", "DDD"],
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z"
  }
]
```

- モックデータは上記1冊で作成
- タグは「設計」「DDD」を付与

### Step 2: 型定義とデータ取得関数

**作成ファイル:** `lib/books.ts`

```typescript
// 型定義
export interface Book {
  id: number
  title: string
  author: string
  publisher: string | null
  publishedYear: number | null
  isbn: string | null
  officialUrl: string | null
  memo: string | null
  tags: string[]
  createdAt: string
  updatedAt: string
}

export type SortKey = "title" | "publishedYear"
export type SortOrder = "asc" | "desc"

// データ取得（モック）
export function getBooks(): Book[]
export function getBookTags(): string[]
export function filterBooks(params: {
  q?: string
  tag?: string
  sort?: SortKey
  order?: SortOrder
}): Book[]
```

- `getBooks()`: JSONファイルからデータを読み込み返却
- `getBookTags()`: 全書籍からユニークなタグ一覧を返却
- `filterBooks()`: 検索・フィルタ・ソートを適用して返却
  - `q`: タイトル・著者・メモを部分一致検索
  - `tag`: 指定タグを含む書籍のみ
  - `sort`: ソートキー（title / publishedYear）
  - `order`: 昇順 / 降順

### Step 3: 一覧ページ本体

**作成ファイル:** `app/books/page.tsx`

既存の `portfolio/page.tsx` のパターンに従う。

**構成コンポーネント:**

1. **ページヘッダー（ヒーローセクション）**
   - タイトル「Books」と説明文
   - 既存ページと同じ `tracking-wide-elegant` スタイル

2. **検索・フィルタバー**
   - テキスト検索入力欄（Shadcn UI `Input`）
   - タグフィルタ（Shadcn UI `Badge` をチップとして使用、複数選択可）
   - ソート切り替え（タイトル順 / 出版年順、昇順 / 降順）

3. **書籍カード一覧**
   - 縦型カード（画像上・情報下）のグリッドレイアウト
   - `md:grid-cols-2` または `md:grid-cols-3` で配置（既存portfolioページに近い雰囲気）

4. **BookCard コンポーネント**
   - OGPサムネイル表示エリア（このフェーズではプレースホルダー画像を表示）
   - タイトル（`officialUrl` があればリンク付き）
   - 著者・出版年
   - タグ（チップ表示）
   - メモ（2〜3行で切り詰め表示）

**URL設計（クエリパラメータ）:**
- `/books?q=設計&tag=入門&sort=publishedYear&order=desc`
- クエリパラメータで状態管理（URLで共有可能）

### Step 4: ナビゲーションへの追加

**変更ファイル:** `lib/constants.ts`

```typescript
// NAV_ITEMS に追加（Portfolioの後、Newsの前 = 4番目）
{ href: "/books", label: "Books", description: "読んだ書籍の一覧" }
```

- 表示順: Profile → Skills → Portfolio → **Books** → News → Social

### Step 5: OGP画像取得のモック

このフェーズではOGP画像の実際の取得は行わない。
BookCardのサムネイル欄はプレースホルダー（本のアイコンまたはグレー背景）で表示する。

---

## 作成・変更ファイル一覧

| 操作 | ファイル | 内容 |
|------|----------|------|
| 新規 | `lib/mock/books.json` | モックデータ |
| 新規 | `lib/books.ts` | 型定義・データ取得関数 |
| 新規 | `app/books/page.tsx` | 一覧ページ |
| 変更 | `lib/constants.ts` | ナビゲーションにBooks追加（4番目） |

## 検証方法

- `pnpm dev` → `/books` にアクセスしてカード一覧が表示されること
- テキスト検索でタイトル・著者・メモが絞り込まれること
- タグクリックでフィルタが効くこと
- ソート切り替えで並び順が変わること
- クエリパラメータがURLに反映されること
- レスポンシブでモバイル表示が崩れないこと
