# タスク完了サマリー

## タスク
`docs/design` 配下の ClaudeDesign 素案を、既存サイト（`service/`、Next.js 15 App Router + Tailwind）にフレームワーク再実装で適用し、デザイントークン・共通スタイル基盤・全公開ページを素案準拠に置換する。

## 結果
完了

## 変更内容

| 種別 | ファイル | 概要 |
|------|---------|------|
| 作成 | `docs/design/MISSING_FEATURES.md` | デザイン適用で判明した 11 件の不足機能（Portfolio 4 / News 3 / Books 3 / 共通 1）を「該当ページ・不足・暫定対応・推奨」の 4 項目で記録 |
| 作成 | `service/lib/theme.ts` | `THEME_STORAGE_KEY="onclimb-theme"` / `DEFAULT_THEME="dark"` / `THEMES`・`isTheme` 型ガードを定義（素案 `shared/shell.js` の `localStorage` キー・既定テーマと一致） |
| 作成 | `service/components/theme/{ThemeProvider,ThemeToggle,index}.{tsx,ts}` | `applyTheme` + `localStorage` 永続化 + `themechange` カスタムイベント + `themeBootScript`（FOUC 防止 inline script） |
| 作成 | `service/components/animations/{ParticleBackground,Reveal,FloatingShapes,HeroParticleTitle,HeroSpotlight}.tsx` | 粒子背景 canvas（dpr 対応・テーマ追従・mouse 反応）、IntersectionObserver ベースの `Reveal`（`data-reveal-delay` ms 適用）、Hero 演出群 |
| 作成 | `service/components/header/{SiteBrand,SiteNav,MobileNav,nav-utils}.{tsx,ts}` | 素案の brand mark + 中央 nav + theme toggle + ハンバーガー構造を分割実装。`isNavItemActive` を `nav-utils.ts` に集約（DRY） |
| 作成 | `service/components/footer/{Footer,FooterClock,index}.{tsx,ts}` | 素案準拠の 4 カラムフッター（brand / sitemap / find me / status with UTC clock） |
| 作成 | `service/components/skills/{RadarChart,SkillBar,SkillCategorySection,index}.{tsx,ts}` | 8 軸 Radar SVG、レベルバー、カテゴリ別セクション |
| 作成 | `service/components/portfolio/{ProjectCard,PortfolioFilter,PortfolioListClient,PortfolioSection,Pager,ArchDiagram,index}.{tsx,ts}` | プロジェクトカード、Personal/Work フィルタ、共通セクション、prev/next ページャー、portfolio-site 専用 SVG 構成図 |
| 作成 | `service/components/news/{Ticker,NewsCard,NewsTagFilter,DayHead,NewsContent,index}.{tsx,ts}` | ticker・タグフィルタ・day-head・ncard variants（feat/mono）、Reveal ラップを `NewsContent` 側に集約 |
| 作成 | `service/components/books/{BookCluster,BookGraph,BookListView,BookViewToggle,index}.{ts,tsx}` | Graph view / List view、cluster 派生純粋関数（`deriveTopClusters/assignBooksToClusters`） |
| 作成 | `service/components/icons/{GitHubIcon,ExternalIcon,XIcon,index}.tsx` | 共通 SVG icons を集約、3 消費者（ProjectCard / portfolio[id] / social）が import |
| 作成 | `service/lib/__tests__/{constants,theme,profile,skills,portfolio}.test.ts` + `service/components/{books,header,news}/__tests__/*.test.ts` | 8 ファイル / 80 テスト（境界値・契約・再発防止） |
| 作成 | `service/vitest.config.ts`、`ASSUMPTIONS.md` | `.md` raw import + `require.context` no-op の Vite plugin、推測契約の集約 |
| 変更 | `service/app/globals.css` | `tokens.css` 準拠の `:root[data-theme="dark"/"light"]` トークン定義に全面書き換え（青系アクセント / dark default / `--accent/--cyan/--indigo/--violet/--amber/--rose` 等） |
| 変更 | `service/app/layout.tsx` | フォント `Inter` → `Geist + Geist Mono + Noto Sans JP + Space Grotesk + JetBrains Mono`、`<html data-theme="dark">` SSR + `themeBootScript` 注入 + `ThemeProvider` ラップ |
| 変更 | `service/components/SiteShell.tsx` | `ParticleBackground + Header + Footer` 構成へリプレース（`/studio` バイパス維持） |
| 変更 | `service/lib/constants.ts` | `NAV_ITEMS` 順序を素案通り `[Home, Profile, Skills, Portfolio, News, Books]` に。`SOCIAL_LINKS` を canonical 化 |
| 変更 | `service/lib/{profile,skills,portfolio}.ts` | `parseProfile`（行走査ベース）/ `getRadarAxes`（8 軸集計）/ `findAdjacentProjectIds` + `formatProjectNumber` を追加 |
| 変更 | `service/app/{page,profile/page,skills/page,portfolio/page,portfolio/[id]/page,news/page,news/[date]/page,books/page,books/BooksContent,social/page,studio/page}.tsx` | 各ページを素案準拠の DOM 構造・トークン駆動 CSS で再実装 |
| 変更 | `service/components/ui/card.tsx`、`service/tailwind.config.{ts,js}`、`service/components/header/{Header,index}.{tsx,ts}`、`service/components/animations/index.ts` | shadcn コンポーネントを hairline/accent トークンに置換、turquoise/terracotta 系を全廃 |
| 変更 | `service/package.json` + `pnpm-lock.yaml` | `vitest@^2.1.8` / `@vitejs/plugin-react@^4.3.4` / `jsdom@^25.0.1` を devDependencies 追加、`scripts.test/test:watch` 追加 |
| 削除 | `service/components/animations/{GeometricBackground,FloatingShape,HeroContent,AnimatedSkillCard,AnimatedNavCard,FadeInSection}.tsx`、`service/components/footer.tsx`、`service/components/header/HeaderButton.tsx` | リプレース後の dead style（turquoise 直参照クラス）を撤去（`coder-decisions.md` 第 5 項で根拠付き） |

## 検証証跡
- **テスト**: `pnpm test` → **8 files / 80 tests passed**（`fix.1.20260426T233849Z.md:32`）。`BookCluster.test.ts:13` / `nav-utils.test.ts:5` / `reveal-attr.test.ts:3` / `SOCIAL_LINKS:4` / `formatProjectNumber:4` を含む再発防止テスト完備。`reports/qa-review.md:39` で QA がテストファイル所在 8 件を直読確認済
- **型チェック**: `pnpm exec tsc --noEmit` → EXIT=0（`fix.1.20260426T233849Z.md:28`）
- **Lint**: `pnpm lint` → No ESLint warnings or errors（同 :29）
- **Production build**: `pnpm build` の最終 "Collecting page data" は `TURSO_DATABASE_URL` 必須で失敗するが、`coder-decisions.md:46-52` で「本変更前から同条件で同じエラー」と既存挙動として記録（スコープ外）
- **専門家レビュー全 APPROVE**: ai-review / architect-review / frontend-review / qa-review / security-review / testing-review すべて APPROVE。前段の全 9 件 new finding（DRY 違反 5 件 + reveal-orphan-attr 2 件 + 純粋関数テスト 1 件 + barrel 3 件）はすべて resolved
- **削除スコープ確認**: 削除 9 件はすべてリプレース後の dead style（旧 footer.tsx・旧 animations 群・HeaderButton.tsx）。`coder-decisions.md` 第 5 項で根拠付き、タスク指示書「素案優先で上書き」方針と整合。スコープクリープなし
- **動作確認**: 編集禁止フェーズかつブラウザ実行証跡は本 run になし（未確認）。各専門家レビューが実コードを直読し DOM 構造・トークン参照・契約一致・barrel 規約を確認することで代替