# AI Review (2回目)

## 結果: REJECT

## サマリー
前回の REJECT 11項目はすべて修正済みであることを実コードで確認。一方、前回の指摘 `AI-NEW-skills-index-L2`（内部限定 export の barrel 公開）と同型の問題が news/portfolio/books の 3 つの index.ts に残存しており、これは今回新規追加された変更ファイル内の問題のため REJECT。

## 検証した項目
| 観点 | 結果 | 備考 |
|------|------|------|
| 前回 REJECT 11 件の修正確認 | ✅ | 全件解消（後述 resolved 表） |
| 仮定の妥当性 | ⚠️ | profile 二重 markdown 解析（getProfile + getParsedProfile）は build 時 1 回のため許容 |
| API 実在 | ✅ | gray-matter, IntersectionObserver, document.fonts いずれも実在 |
| デッドコード/未使用 export | ❌ | barrel に内部限定 export が残存（後述 new 表） |
| 配色トークン整合 | ⚠️ | ParticleBackground / SkillBar lvl5 は素案ハードコード踏襲、ユーザー方針「素案優先」で許容 |

## 今回の指摘（new）

| # | finding_id | family_tag | カテゴリ | 場所 | 問題 | 修正案 |
|---|------------|------------|---------|------|------|--------|
| 1 | AI-NEW2-news-index-L1 | unused-export | barrel に内部限定 export | `service/components/news/index.ts:1-4` | `Ticker` / `NewsCard` / `NewsVariant` / `NewsTagFilter` / `NewsTag` / `DayHead` を export しているが、外部 import は `app/news/page.tsx` の `NewsContent, NewsDayGroup` のみ。残り 6 件は `NewsContent.tsx` の相対 import でしか使われない（`grep "from \"@/components/news\""` で確認） | `index.ts` を `export { NewsContent, type NewsDayGroup } from "./NewsContent"` のみに縮小 |
| 2 | AI-NEW2-portfolio-index-L1 | unused-export | barrel に内部限定 export | `service/components/portfolio/index.ts:1-2` | `ProjectCard` / `PortfolioFilterBar` / `PortfolioFilter` を export しているが、外部使用は `app/portfolio/page.tsx` の `PortfolioListClient` と `app/portfolio/[id]/page.tsx` の `ArchDiagram`, `Pager` のみ。残り 3 件は `PortfolioListClient.tsx` の相対 import でしか使われない | `index.ts` から `ProjectCard` / `PortfolioFilterBar` / `PortfolioFilter` の barrel 行を削除 |
| 3 | AI-NEW2-books-index-L4 | unused-export | barrel に内部限定 export | `service/components/books/index.ts:4-10` | `deriveTopClusters` / `assignBooksToClusters` / `BookCluster` / `PositionedBook` / `BookStatus` を export しているが、`grep` の結果すべて `BookGraph.tsx` / `BookListView.tsx` の相対 import (`./BookCluster`) のみで使用。`BooksContent.tsx` の barrel 取得は `BookGraph` / `BookListView` / `BookViewToggle` / `BookView` のみ | `index.ts` の cluster 系 5 export を削除し、`BookGraph` / `BookListView` / `BookViewToggle` / `type BookView` のみに絞る |

**指摘の根拠**: 前回の `AI-NEW-skills-index-L2` で同種の問題（`SkillBar` / `useTheme` の barrel 公開）が REJECT され、`components/skills/index.ts` と `components/theme/index.ts` から相対 import 専用の export が削除された。同じ判定基準を news / portfolio / books の barrel にも適用しないと、同型のデッドコードが残り続ける（policy「内部実装のパブリック API エクスポート」/「exportされているが、grep で使用箇所が見つからない」に該当）。

**アプローチ提案**: 個別に「これも消して」を続けるより、`*/index.ts` には「サイト側ページから直接参照される export のみを置く（モジュール内サブコンポーネント・ヘルパーは相対 import に閉じ込める）」という規約を 1 度確立し、今回の 3 ファイルに同時適用する。これにより今後の barrel 追加時にも一貫した判断ができる。

## 継続指摘（persists）
| # | finding_id | family_tag | 前回根拠 | 今回根拠 | 問題 | 修正案 |
|---|------------|------------|----------|----------|------|--------|
| - | - | - | - | - | 該当なし | - |

## 解消済み（resolved）
| finding_id | 解消根拠 |
|------------|----------|
| AI-NEW-HeroParticleTitle-L148 | `service/components/animations/HeroParticleTitle.tsx:143-157` で `started` flag による多重 start() 抑止 + listener 登録/cleanup が分岐外に統一されているのを確認 |
| AI-NEW-NewsContent-L31 | `service/components/news/NewsContent.tsx` から `useMemo` / `filteredDays` が削除され `days.map` を直接実行（L37）。`useMemo` import も除去（L3） |
| AI-NEW-NewsCard-L111 | `service/components/news/NewsCard.tsx:111-117` の `formatTime` から try-catch が撤去され直線フローに |
| AI-NEW-page-L92 | `service/app/page.tsx:93-107` で空 `style={...}` と What/How コメントが消え、`pulse-dot` クラスのみで実装 |
| AI-NEW-tailwind-ts-L68 | `service/tailwind.config.ts` から `accent-shadcn` ブロックが消失（grep で 0 件、popover 定義が L68 を埋めているのを確認） |
| AI-NEW-profile-page-L130 | `service/app/profile/page.tsx:128-141` が `block.type === "pullQuote"` 判定に変更。`startsWith("最も大切にしているのは")` は撤去 |
| AI-NEW-portfolio-detail-L76 | `service/app/portfolio/[id]/page.tsx:57-65` に `projectNumber(project, all)` helper が追加され、L82 / L298 / L307 の 3 箇所がこの関数を呼び出す形に統一 |
| AI-NEW-Footer-L69 | `service/components/footer/Footer.tsx:69` が `© {new Date().getFullYear()} onclimb` に変更 |
| AI-NEW-profile-import-L5 | `service/lib/profile.ts:52-54` に `getParsedProfile()` を追加し、`service/app/profile/page.tsx:3` は `getProfile, getParsedProfile` のみを import（`profileRaw` 直接 import は撤去） |
| AI-NEW-skills-index-L2 | `service/components/skills/index.ts` は `RadarChart` / `SkillCategorySection` のみ、`service/components/theme/index.ts` は `ThemeProvider` / `themeBootScript` / `ThemeToggle` のみで、`SkillBar` / `useTheme` の barrel 公開は撤去済み |
| AI-NEW-NewsContent-L120 | `service/components/news/NewsContent.tsx:115-116` が `return tags`（空配列を返す）に変更され、`["frontend"]` フォールバックは撤去 |

## 再開指摘（reopened）
| # | finding_id | family_tag | 解消根拠（前回） | 再発根拠 | 問題 | 修正案 |
|---|------------|------------|----------------|---------|------|--------|
| - | - | - | - | - | 該当なし | - |