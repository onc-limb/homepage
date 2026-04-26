## 作業結果

`docs/design` ClaudeDesign 素案を Next.js 15 + Tailwind の既存サイトに再実装で適用しました。デザイントークン基盤、共通シェル、全公開ページ (top / profile / skills / portfolio / portfolio detail / news / news detail / books / social) を素案準拠に置換し、不足機能を `docs/design/MISSING_FEATURES.md` に記録しました。

主な修正点:
- `service/lib/profile.ts` の regex (`\z`) が JS で機能せず文書末セクションを取れない不具合を、行配列走査ベースに書き換えて解消
- `service/components/animations/Reveal.tsx` の dynamic-tag ref 型エラー (union type too complex) を `React.createElement` 化で解消
- 旧 turquoise/terracotta/watercolor 系クラスを `service/components/ui/card.tsx`, `app/social/page.tsx`, `app/books/page.tsx`, `app/books/BooksContent.tsx`, `app/studio/page.tsx` から全廃
- `service/components/footer.tsx` 旧版 (新 `components/footer/` ディレクトリと resolution 衝突)、`header/HeaderButton.tsx`、旧 animations 6 ファイルを削除
- Books に Graph / List view + cluster 導出 (`BookCluster.ts`) + `BookGraph.tsx` / `BookListView.tsx` を新規実装。既存の検索 / 積読タブ / タグフィルタ / メモモーダルはトークン化して保持

## 変更内容
- 作成: `service/components/books/{BookCluster.ts, BookGraph.tsx, BookListView.tsx}`、`docs/design/MISSING_FEATURES.md`、`coder-decisions.md`
- 修正: `service/lib/profile.ts`、`service/components/animations/Reveal.tsx`、`service/components/footer/Footer.tsx`、`service/components/ui/card.tsx`、`service/components/books/index.ts`、`service/app/{books,social,studio}/page.tsx`、`service/app/books/BooksContent.tsx`、`coder-scope.md`
- 削除: `service/components/footer.tsx`、`service/components/header/HeaderButton.tsx`、`service/components/animations/{FadeInSection,FloatingShape,GeometricBackground,HeroContent,AnimatedNavCard,AnimatedSkillCard}.tsx`

## ビルド結果
- `pnpm exec tsc --noEmit` → EXIT=0（型エラーなし）
- `pnpm lint` → ✔ No ESLint warnings or errors
- `pnpm build` のコンパイル + lint + 型チェックは成功。最終フェーズ "Collecting page data" でのみ `TURSO_DATABASE_URL` 必須エラー（`/news/[date]` の `generateStaticParams` がランタイム DB を呼ぶ既存挙動。実 DB が無い CI 環境では従来から同様に失敗する想定で、本タスクの変更に起因しない）

## テスト結果
- コマンド: `pnpm --dir service test`
- 結果: `Test Files 5 passed (5)` / `Tests 50 passed (50)`（constants 7 / theme 6 / profile 15 / skills 14 / portfolio 8）