# 実装ノート: 2-data-operations

## 推測・判断で決定した事項

### 1. DBクライアントのフォールバック（lib/db/index.ts）

Turso環境変数が未設定の場合、ビルドエラーを回避するためローカルSQLiteファイル（`file:local.db`）にフォールバックするようにした。本番環境では必ず`TURSO_DATABASE_URL`を正しく設定する必要がある。

### 2. middleware.tsのcookieチェック方式

計画書の通りEdge環境制約のため、NextAuthのフルmiddleware（`export { auth as middleware }`）ではなく、セッションcookieの存在チェックのみで実装した。チェック対象のcookie名は：
- `authjs.session-token`（HTTP環境）
- `__Secure-authjs.session-token`（HTTPS環境）

NextAuth v5 beta.30のデフォルトcookie名に基づいている。バージョンアップでcookie名が変わる可能性がある。

### 3. BooksContent.tsxのAPI経由フェッチへの切り替え

クライアントコンポーネント（`BooksContent.tsx`）は`lib/books.ts`のDB直接クエリを呼べないため（DBモジュールがサーバー専用）、`/api/books`と`/api/tags`へのfetchに切り替えた。これにより：
- フィルタ/検索のたびにAPIリクエストが発生する（元はクライアントサイドの同期処理だった）
- 型定義を`lib/types/book.ts`に分離し、クライアント・サーバー双方から安全にimportできるようにした

### 4. /booksページの動的レンダリング（force-dynamic）

`app/books/page.tsx`に`export const dynamic = "force-dynamic"`を追加した。サーバーコンポーネントからDBクエリを実行するため、ビルド時のプリレンダリングではDBが存在せずエラーになる。

### 5. API books GETのフィルタ・ソート実装

計画書のGET APIクエリパラメータ仕様に従い、以下をアプリケーション層で実装した：
- `tab`（read/unread）: `isRead`フラグによるフィルタ
- `q`: title, author, memoの部分一致（大文字小文字無視）
- `tag`: タグ名完全一致フィルタ
- `sort`/`order`: アプリケーション層でのソート

SQLレベルのWHERE句やORDER BYではなく、全件取得後にJavaScriptでフィルタ・ソートしている。データ量が少ない想定のためこの方式を採用したが、大量データの場合はSQLクエリ最適化が必要。

### 6. タグのupsert方式（POST /api/books, PUT /api/books/[id]）

書籍登録・更新時のタグ処理は、`tagNames`（文字列配列）をリクエストボディで受け取り：
1. `INSERT ... ON CONFLICT DO NOTHING`で既存タグを重複エラーなく処理
2. 直後にSELECTでタグIDを取得
3. book_tagsに関連付け

計画書では`tagIds or tagNames`と記載があったが、クライアント側の利便性を考慮し`tagNames`のみで統一した。

### 7. NextAuth v5 betaバージョン

`next-auth@5.0.0-beta.30`がインストールされた。betaのため、正式リリース時にAPIが変更される可能性がある。

### 8. @auth/drizzle-adapterのインストール

計画書に従いインストールしたが、現在の認証フローではDrizzle adapterは使用していない（セッションストレージはDB管理ではなくJWT/cookieベース）。将来、セッションやアカウント情報をDBに保存する場合に使用する。

### 9. tabs.tsxのフォーマット修正

既存のShadcn UI `components/ui/tabs.tsx`がESLintのインデントルール（4スペース）に違反していたため、prettierで自動修正した。これは今回の実装とは無関係の既存問題。
