すべてのテストが通過。修正完了の報告をまとめます。

## 確認したファイル
- `service/components/news/index.ts:1-5` - 5 export（`Ticker` / `NewsCard` / `NewsVariant` / `NewsTagFilter` / `NewsTag` / `DayHead` / `NewsContent` / `NewsDayGroup`）
- `service/components/portfolio/index.ts:1-5` - 5 export（`ProjectCard` / `PortfolioFilterBar` / `PortfolioFilter` / `PortfolioListClient` / `Pager` / `ArchDiagram`）
- `service/components/books/index.ts:1-10` - 4 export ブロック（`BookViewToggle` / `BookView` / `BookGraph` / `BookListView` / `deriveTopClusters` / `assignBooksToClusters` / `BookCluster` / `PositionedBook` / `BookStatus`）
- `service/app/news/page.tsx:3` - `NewsContent, NewsDayGroup` のみ import
- `service/app/portfolio/page.tsx:3` / `service/app/portfolio/[id]/page.tsx:10` - `PortfolioListClient` / `ArchDiagram, Pager` のみ import
- `service/app/books/BooksContent.tsx:19-24` - `BookGraph, BookListView, BookViewToggle, BookView` のみ import

## 実行した検索
- `from "@/components/news"` 等のサイト側 import を Grep → 外部利用は上記 6 ファイルのみと判明
- 内部相対 import を Grep → `NewsContent.tsx:5-8`、`PortfolioListClient.tsx:6-7`、`BookGraph.tsx:9` / `BookListView.tsx:7` で確認（barrel から消しても内部参照は `./XXX` で生きる）
- 削除対象 export の名前で全コードベース横断 Grep → news/portfolio/books モジュール外での参照ゼロを確認

## 修正内容
- `service/components/news/index.ts`: 5 export を削除し `export { NewsContent, type NewsDayGroup } from "./NewsContent"` のみに縮小
- `service/components/portfolio/index.ts`: `ProjectCard` / `PortfolioFilterBar` / `PortfolioFilter` 行を削除し `PortfolioListClient` / `Pager` / `ArchDiagram` の 3 export に絞った
- `service/components/books/index.ts`: cluster 系 5 export ブロックを削除し `BookViewToggle` / `BookView` / `BookGraph` / `BookListView` の 3 export のみに絞った

## テスト結果
- `cd service && npx tsc --noEmit`: 出力なし（exit 0、型エラーなし）
- `npm --prefix service run test`: `Test Files 5 passed (5)` / `Tests 51 passed (51)`（vitest, 292ms）

## 所感
AI Review が指摘した 3 件の barrel 内部限定 export 問題は実在しており、`*/index.ts` には外部から参照される export のみを置く規約に従って 3 ファイルを同時修正しました。指摘の resolved 確認のうち `AI-NEW-skills-index-L2` と同方針です。