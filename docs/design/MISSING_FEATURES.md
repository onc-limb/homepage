# MISSING FEATURES

`docs/design` 素案を既存サイトに適用する過程で、**現状の既存サイトのデータ・ルーティング・コンポーネントには無いが、素案デザインを完全に表現するために必要となる機能**を記録する。

各項目は「該当ページ / 不足機能・データ / 暫定対応 / 推奨される追加実装」の形式で記載する。

---

## Portfolio

### portfolio: マークダウン化されているプロジェクトが少ない

- **該当ページ**: `/portfolio`
- **不足**: `lib/portfolio.ts:portfolioMarkdowns` に登録されている md ファイルが `portfolio-site.md` のみ。素案 (`docs/design/portfolio.html`) は複数プロジェクトの一覧を前提にしている。
- **暫定対応**: `portfolio-site.md` 一件で動作する。Personal / Work のフィルタ UI は実装済みだが、件数 0 のセクションは表示しない。
- **推奨**: 公開可能なプロジェクトを `service/docs/portfolio/*.md` として追加し、`portfolioMarkdowns` 配列に import 追加する。

### portfolio detail: 使用技術のカテゴリ別メタが無い

- **該当ページ**: `/portfolio/[id]`
- **不足**: 素案 (`docs/design/portfolio/onc-limb.html`) は `Frontend / Backend / Data / Infra・CDN / DevOps / Quality` の 6 グループで使用技術を表示する。既存スキーマ `Project.technologies: string[]` はフラットな文字列配列で、グループ情報を持たない。
- **暫定対応**: フラットなタグ列を素案 stack カードスタイルで 1 グループとして表示する。
- **推奨**: `Project.techCategories: { label: string; items: string[] }[]` を md frontmatter で受けるように `lib/portfolio.ts` を拡張する。

### portfolio detail: アーキテクチャ図 SVG の構造データが無い

- **該当ページ**: `/portfolio/[id]`
- **不足**: 素案ではプロジェクトごとのインフラ構成 SVG を表示するが、md スキーマには SVG 構造を表す要素 (box / cluster / arrow など) が無い。
- **暫定対応**: `portfolio-site` 専用の `ArchDiagram.tsx` に SVG をハードコードし、当該プロジェクトでのみセクションを表示する。
- **推奨**: md/MDX で SVG を直接記述、または独自スキーマ (`box`, `arrow`, `cluster`) を frontmatter または埋め込みコードブロックで定義する。

### portfolio detail: プロジェクトの `status` が無い

- **該当ページ**: `/portfolio/[id]`
- **不足**: 素案 hero の `In Production / Archived` ステータスを直接保持する型が無い。
- **暫定対応**: `period` 文字列に `present` / `現在` / `〜` が含まれていれば `production` と推定。それ以外は `archived`。
- **推奨**: `Project.status: 'production' | 'archived' | 'wip'` を frontmatter で受ける。

---

## News

### news: タグ列がデータベースに無い

- **該当ページ**: `/news`
- **不足**: 素案 (`docs/design/news.html`) は `frontend / backend / infra / ai / lang` のタグフィルタを提供する。news スキーマには `tags: string[]` カラムが無く、既存の `news` レコードはタグを持たない。
- **暫定対応**: UI のフィルタチップは実装済み。各カードのタグは `source` 文字列の部分一致から推定する (例: `react|next|vercel` → `frontend`)。
- **推奨**: `news.tags` カラムを追加し、crawler / 要約バッチでタグを付与する。

### news: ticker 用のトレンドカウントデータが無い

- **該当ページ**: `/news` ヘッダー直下
- **不足**: 素案の横スクロールバー (ticker) は `+12` `+24` 等の前日比カウントを表示する。これに対応する集計データ無し。
- **暫定対応**: `Ticker.tsx` に固定の表示用配列をハードコードし、「動きそう」な見た目を提供する。
- **推奨**: source × tag の前日比集計バッチ (例: 1 日 1 回) を追加し、`/api/news/trends` で配信する。

### news: ncard variant (`feat` / `mono`) の判定基準が無い

- **該当ページ**: `/news`
- **不足**: 素案では各日 1 件を `feat` (横長 hero カード) で目立たせ、`GitHub Trending` 系の機械的な記事は `mono` (モノクローム) で渋く表示する。これに対応するフラグが無い。
- **暫定対応**: 各日の先頭記事を `feat`、`source` が `GitHub Trending` / `GitHub Blog` のものを `mono` として扱う。
- **推奨**: `news.featured: boolean` カラム + `news.appearance: 'default' | 'mono'` カラムを追加する。

---

## Books

### books: `reading` ステータスが表現できない

- **該当ページ**: `/books`
- **不足**: 素案 (`docs/design/book.html`) は `read` / `reading` / `queue` の 3 ステータスを区別する。既存スキーマは `isRead: boolean` のみで、`reading` 状態を保持できない。
- **暫定対応**: グラフ・リストのカードでは `isRead === true` → `read`、`isRead === false` → `queue` の二値で表示。`reading` は表示されない。
- **推奨**: `books.readingStatus: 'read' | 'reading' | 'queue'` カラムに変更する。

### books: 本同士の `related` 関連付けデータが無い

- **該当ページ**: `/books`
- **不足**: 素案 graph view では本同士の関連が edge として描かれる。既存スキーマには `book_relations` テーブルが無い。
- **暫定対応**: 同じタグを 1 つ以上共有する本同士を edge で接続する (上限 4 本)。
- **推奨**: `book_relations(book_id, related_book_id)` を追加し、手動 / Embedding 類似度で関連を作成する。

### books: cluster (テーマ大分類) のメタが無い

- **該当ページ**: `/books`
- **不足**: 素案では `Architecture / Low-level / Web / Craft` 等の cluster ノードに本がぶら下がる構成。これに対応する分類データが無い。
- **暫定対応**: `BookCluster.ts:deriveTopClusters()` で「既存タグの出現上位 4 件」を cluster として扱う。
- **推奨**: `books.cluster` カラム、または `tags.cluster: string` フィールドを追加。

---

## 共通

### Theme: `localStorage` 以外の永続化先が無い

- **該当**: 全ページ (Theme toggle)
- **不足**: 素案は `localStorage.onclimb-theme` のみで管理。サーバ側で初回テーマを決定する仕組みが無いため、別デバイス間の同期や OS 設定 (prefers-color-scheme) との初期同期が無い。
- **暫定対応**: dark default + `localStorage` 永続化で素案準拠。
- **推奨**: 必要に応じて Cookie への persist + middleware での初期値設定。
