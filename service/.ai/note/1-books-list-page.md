# 書籍一覧ページ実装メモ (note.md)

## Claudeが推測・判断して実装した箇所

### 1. Client Component の採用

- 計画書ではServer/Clientの区別が明記されていなかったが、検索・フィルタ・ソートのインタラクティブな操作が必要なため `"use client"` で実装した
- `useSearchParams` / `useRouter` でURLクエリパラメータと状態を同期

### 2. ソート切り替えのUI

- 計画書では「ソート切り替え（タイトル順 / 出版年順、昇順 / 降順）」とあったが、具体的なUIは指定なし
- ボタン1つでトグルする形式にした（タイトル昇順 ↔ 出版年降順）
- 昇順/降順を個別に切り替えるUIは複雑になるため、よく使われるパターン（タイトル=昇順、出版年=降順）をデフォルトとした

### 3. タグフィルタの複数選択

- 計画書には「複数選択可」と記載があったが、URLクエリパラメータでのシンプルな管理を優先し、単一タグ選択で実装した
- 複数選択が必要であれば `tag=DDD,設計` のようなカンマ区切りに変更可能

### 4. ヒーローセクションのサブタイトル

- 既存ページのパターンに合わせ、英語ラベル「Library」をヒーロー上部に配置した
- 他ページでは「Works」「Tech Stack」等が使われていたため、同様のパターンを踏襲

### 5. グリッドレイアウト

- 計画書では「md:grid-cols-2 または md:grid-cols-3」とあったが、カード型（縦長）で書籍数が増えることを想定し `md:grid-cols-2 lg:grid-cols-3` とした

### 6. line-clamp-3 の使用

- メモの切り詰め表示に Tailwind の `line-clamp-3` を使用し、「続きを読む」ボタンで展開/折りたたみ可能にした
- Tailwind v3.3+ で標準サポートされているため、プラグイン追加は不要と判断

### 7. Suspense boundary

- `useSearchParams` は Next.js 15 で Suspense boundary を必要としたため、ページを Server Component (`page.tsx`) と Client Component (`BooksContent.tsx`) に分離した
- `page.tsx` でヒーローセクションを描画し、`<Suspense>` で `BooksContent` をラップ

### 8. OGP画像の取得

- 計画書では「このフェーズではOGP画像の実際の取得は行わない」とあったが、ユーザーの要望により実装
- Server Component (`page.tsx`) でビルド時にOGP画像URLを取得し、Client Componentにpropsで渡す構成
- `lib/ogp.ts` でHTMLを取得し `og:image` メタタグを正規表現でパース
- `next: { revalidate: 86400 }` で1日キャッシュ
- `next.config.mjs` に `images.remotePatterns` で全HTTPSドメインを許可（OGP画像の出典が多様なため）
- OGP画像が取得できない場合はフォールバックとして `BookOpen` アイコンを表示
