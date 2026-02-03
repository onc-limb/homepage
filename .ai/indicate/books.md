# Books機能 改善計画

## 保守性・変更容易性

### 1. getBooks() + tag取得ロジックの重複解消 [高]
- `lib/books.ts` の `getBooks()` / `fetchBookTags()` と `api/books/route.ts` GET内のロジックが重複
- API routeは `lib/books.ts` の関数を呼ぶだけにする

### 2. タグupsertロジックの共通関数化 [高]
- POST / PUT で「タグをupsertしてbook_tagsにINSERT」するループが完全に同一
- `syncBookTags(tx, bookId, tagNames)` を `lib/books.ts` に切り出す

### 3. APIリクエストのサーバーサイドバリデーション追加 [中]
- POST/PUTのbodyを `as` キャストしているだけでZodバリデーションがない
- `bookFormSchema` をAPI側でも使用する

### 4. 書籍データの二重取得をやめる [中]
- `page.tsx` (サーバー) で全書籍取得 → `BooksContent` (クライアント) で再度API fetch
- サーバーで取得した書籍データをpropsとして渡し、初期表示はそれを使う

## パフォーマンス

### 5. フィルタ/ソートをSQL側に移す [高]
- 全件取得→JSでフィルタ/ソートはスケールしない
- `isRead`, テキスト検索, タグフィルタ, ソートをSQLのWHERE/ORDER BYで処理

### 6. タグupsert内のN+1改善 [低]
- 各タグに対して INSERT → SELECT を逐次実行
- バルクINSERT + 一括SELECTに変更

### 7. OGP画像URLのDB保存化 [低]
- 毎回外部サイトへOGPフェッチするのではなくDBに保存
- 書籍登録/更新時に取得してDBカラムに保存する

## UI

### 8. タグ表示のコンポーネント統一 [中]
- BookCard内は直接Tailwindクラス、フィルタ部分は `<Badge>` コンポーネント
- BookCard内のタグ表示にも `<Badge>` を使う

### 9. 検索inputにdebounce追加 [低]
- キーストロークごとにURLパラメータ変更→API fetchが走る
- debounceを入れて入力が落ち着いてからfetchする

### 10. チェックボックスをデザインシステムに合わせる [低]
- 「既読」チェックボックスだけ素のHTML input + `border-slate-300`
- Radix UIベースのCheckboxコンポーネントに統一する
