# 決定ログ

## 1. parseProfile のセクション抽出を regex から行ベース走査に変更
- **背景**: 既存実装は `new RegExp("...(?=^##\\s+|\\z)", "m")` で `\z` (絶対末尾) を使っていたが、JS 正規表現は `\z` を解釈しない (リテラル `z` 扱い)。`### 資格` のように文書末まで続くサブセクションが空文字列になり、テスト 4 件 (career 単一エントリ / certs 4 件 / certs ノート保持 / 経歴 frontmatter なし) が落ちた。
- **検討した選択肢**:
  - (A) `(?=^##\\s+|$(?![\\s\\S]))` で末尾を `$` + 否定先読みで疑似実装
  - (B) 行配列 (`split("\n")`) を走査して開始位置 / 終了位置を求める
- **理由**: (B) を採用。regex 内で疑似的な末尾アンカーを書くより、行ベースのほうが意図が明示的でテスト容易。`escapeRegex` ヘルパーも独立化し再利用可能に。

## 2. Reveal の dynamic-tag ref typing を `createElement` に変更
- **背景**: 既存実装は `as` prop で任意 HTML タグを受け、`<Tag ref={ref as any}>` で渡していた。Next.js 15 + React 18 の型解決で TS が「Expression produces a union type that is too complex to represent」を出し、ビルドが落ちた。
- **検討した選択肢**:
  - (A) `as` を `keyof JSX.IntrinsicElements` に絞る (列挙)
  - (B) `as` を `ElementType` にし、`React.createElement(as, props, children)` で生成
- **理由**: (B) を採用。任意のタグ・コンポーネントを受けられる柔軟さを保ちつつ、型は `ElementType` 1 本で完結し、union 爆発を回避。`as any` キャストも不要になる。

## 3. Books Graph / List のクラスタ・関連は既存タグから導出
- **背景**: 計画 / MISSING_FEATURES.md で「`books.cluster` カラム / `book_relations` テーブルが無い」とされている状態で素案 graph view を実装する必要があった。素案中核要素である graph view を落とすのは指示違反。
- **検討した選択肢**:
  - (A) Graph view を実装せず List のみ (素案中核要素を落とす)
  - (B) クラスタ = 既存タグの上位 4 件、edges = 共通タグを持つ本同士 (上限 4)、status = `isRead` 二値。MISSING_FEATURES.md に明記
- **理由**: (B) を採用。`docs/design/MISSING_FEATURES.md` の方針通り「暫定対応 + 推奨追加実装」を併記し、UI は素案準拠で動作する。導出ロジックは `BookCluster.ts` に純粋関数 (`deriveTopClusters`, `assignBooksToClusters`) として切り出した。

## 4. Books の既存検索 / 積読タブ / メモモーダルは保持しつつトークン適用のみ
- **背景**: 素案 (`docs/design/book.html`) には検索・タブ・モーダルが無いが、これらは現行サービスでデータを操作する唯一の UI。削除すると read/unread 切替もタグ絞り込みもメモ閲覧もできなくなる。
- **検討した選択肢**:
  - (A) 素案にない既存機能をすべて削除
  - (B) Graph / List を上に追加し、既存機能 (検索 / タブ / フィルタ / モーダル) は `/05 検索 ・ 積読` セクションとして維持。ただし `turquoise-*` を全て排除し、デザイントークン (`bg-surface`, `border-hairline`, `text-fg-muted`, `text-accent` など) で再描画
- **理由**: 計画レポートが「素案にない既存機能だが、データ表示に必要。素案優先＋既存機能保持の両立」と明記しているため (B)。素案にあるグラフ表示と既存の運用機能を両立させた。

## 5. footer.tsx (旧) は削除し、components/footer/ ディレクトリで新ヘッダー実装
- **背景**: `service/components/footer.tsx` が `bg-turquoise-50` / `border-turquoise-200/50` を直接使用しており、tailwind config から turquoise が消えた今は dead style。Node の module resolution は `footer.tsx` を `footer/index.ts` より優先するため、放置すると `@/components/footer` 経由で旧コンポーネントが解決される。
- **検討した選択肢**:
  - (A) 残置して `data-theme="dark"` の `dark:` variant でカバー
  - (B) `footer.tsx` を削除し、新規 `components/footer/{Footer,FooterClock,index}.ts(x)` のみ残す
- **理由**: (B) を採用。`footer.tsx` を残すと resolution が衝突するうえ、dead 化した turquoise クラスを維持する理由が無い。同様に `header/HeaderButton.tsx` と `animations/{FadeInSection,FloatingShape,GeometricBackground,HeroContent,AnimatedNavCard,AnimatedSkillCard}.tsx` も削除した (CLAUDE.md「リファクタリングで置き換えたコード・エクスポートを残す → 禁止」に従う)。

## 6. Footer の `// status` 表示を JSX エスケープで実装
- **背景**: 素案では「`// status`」というラベル文字列をモノスペースで表示している。JSX 内に `// status` をテキストノードとして直接書くと、ESLint ルール `react/jsx-no-comment-textnodes` が「コメント風文字列は誤解を招く」と警告し、Next.js のビルドが失敗する。
- **検討した選択肢**:
  - (A) `// status` を `STATUS` などコメント風でない文字列に置換
  - (B) `eslint-disable-next-line react/jsx-no-comment-textnodes` で抑止
  - (C) JSX 文字列リテラル `{"// status"}` でリンタを満足させる
- **理由**: (C) を採用。素案の表記をそのまま保ったままビルドを通せる。リンタ抑止より明示的で、文字列リテラルである意図が読み手にも伝わる。

## 7. ビルドの最終フェーズ失敗 (TURSO_DATABASE_URL) は本タスクの修正対象外と判断
- **背景**: `pnpm build` のコンパイル / lint / 型チェックは成功するが、最終 "Collecting page data" で `/news/[date]` の `generateStaticParams` が DB に問い合わせ、`TURSO_DATABASE_URL is required in production` で失敗する。
- **検討した選択肢**:
  - (A) `generateStaticParams` を空配列にして DB 呼び出しを回避
  - (B) `generateStaticParams` を削除し dynamic にする
  - (C) 既存挙動を変更せず、env が設定された環境でビルドする前提とする
- **理由**: (C) を採用。本タスクは「素案デザインの適用」であり、news ルーティング戦略 (静的生成 vs dynamic) の変更はスコープ外。デザイン変更前のコードでも同条件で同じビルドエラーになることを確認済み。型チェック (`tsc --noEmit` EXIT=0) と lint (`pnpm lint` warnings 0) と単体テスト (50 passed) で品質ゲートはクリアしている。