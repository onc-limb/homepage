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
    "title": "リーダブルコード",
    "author": "Dustin Boswell, Trevor Foucher",
    "publisher": "オライリージャパン",
    "publishedYear": 2012,
    "isbn": "978-4873115658",
    "officialUrl": "https://www.oreilly.co.jp/books/9784873115658/",
    "memo": "コードの可読性を意識したい時に読み返す。新人エンジニアへの最初の一冊としておすすめ。",
    "tags": ["設計", "入門"],
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z"
  }
]
```

- 5〜10冊程度のサンプルデータを用意
- タグは複数パターン（設計、入門、Web、インフラ、言語 など）を含める
- (要確認) サンプルデータに入れたい具体的な書籍があれば指定してほしい

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
   - テキスト検索入力欄
   - タグフィルタ（チップ形式、複数選択可）
   - ソート切り替え（タイトル順 / 出版年順、昇順 / 降順）
   - (要確認) 検索バーのデザインについて、既存サイトに検索UIがないため新規デザインとなる。Shadcn UIの `Input` + `Badge` コンポーネントを使う想定でよいか

3. **書籍カード一覧**
   - グリッドレイアウト（`md:grid-cols-2` または `md:grid-cols-3`）
   - (要確認) カードのレイアウトは横型（画像左・情報右）と縦型（画像上・情報下）のどちらが望ましいか

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
// NAV_ITEMS に追加
{ href: "/books", label: "Books", description: "読んだ書籍の一覧" }
```

- ヘッダーナビゲーションに「Books」リンクを追加
- (要確認) ナビゲーションの表示順序。現在は Profile, Skills, Portfolio, News, Social の5つ。Booksをどの位置に入れるか（Skillsの後を想定）

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
| 変更 | `lib/constants.ts` | ナビゲーションにBooks追加 |

## 検証方法

- `pnpm dev` → `/books` にアクセスしてカード一覧が表示されること
- テキスト検索でタイトル・著者・メモが絞り込まれること
- タグクリックでフィルタが効くこと
- ソート切り替えで並び順が変わること
- クエリパラメータがURLに反映されること
- レスポンシブでモバイル表示が崩れないこと
