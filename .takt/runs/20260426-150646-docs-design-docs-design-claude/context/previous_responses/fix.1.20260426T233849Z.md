## 作業結果
- 3 つのレビューレポート（architect-review / frontend-review / testing-review）の全 9 件の new 指摘（reopened/persists 0 件）を修正。
- DRY 違反 5 件は修正案の指示通り、別モジュール（`nav-utils.ts` / `constants.ts SOCIAL_LINKS` / `portfolio.ts formatProjectNumber` / `components/icons/` / `PortfolioSection.tsx`）に集約し、全呼び出し元を新 API へ切り替え。
- フロントエンド指摘 2 件（reveal-orphan-attr）は NewsCard / DayHead から `data-reveal=""` / `data-reveal-delay` 属性と未使用 prop を削除し、NewsContent 側で `<Reveal>` ラッパーに包む形へ変更（Reveal は `useRef` 自要素にのみ `is-revealed` を付ける設計に揃った）。
- BookCluster の純粋関数群に 13 ケースの契約テストを追加。
- 各 family_tag (missing-tests / dry-violation / reveal-orphan-attr) ごとに最低 1 件以上の再発防止テストを追加。

## 変更内容
- `service/components/news/NewsCard.tsx`: `delay` prop 削除、`data-reveal*` 属性削除。
- `service/components/news/DayHead.tsx`: `data-reveal=""` 削除。
- `service/components/news/NewsContent.tsx`: `<Reveal>` で DayHead / NewsCard をラップ。
- `service/components/header/nav-utils.ts` 新設、SiteNav / MobileNav から `isActive` 重複削除。
- `service/lib/constants.ts`: `SOCIAL_LINKS` 追加。
- `service/components/footer/Footer.tsx`: 内部の SOCIAL_LINKS を constants 由来へ。
- `service/app/social/page.tsx`: SOCIAL_LINKS は constants 由来、icon/description はページ内 PRESENTATION マップ（Fail Fast）。
- `service/app/page.tsx`: GitHub URL を SOCIAL_LINKS から取得（モジュール初期化時に Fail Fast）。
- `service/components/icons/{GitHubIcon,ExternalIcon,XIcon,index}.tsx` 新設、ProjectCard / portfolio[id] / social から重複 SVG 定義を削除。
- `service/lib/portfolio.ts`: `formatProjectNumber(category, indexInList)` helper を追加。
- `service/components/portfolio/PortfolioSection.tsx` 新設、PortfolioListClient の Personal/Work セクション重複を 1 つに統合。
- 追加テスト:
  - `service/components/books/__tests__/BookCluster.test.ts` (13 cases — 上位 4/lexical tiebreak/limit/最初一致割当/除外/ isRead マッピング/座標 5..95 クランプ/related cap 4/memo→notes fallback)
  - `service/components/header/__tests__/nav-utils.test.ts` (5 cases — root 完全一致/exact/nested/prefix-not-boundary/unrelated)
  - `service/components/news/__tests__/reveal-attr.test.ts` (3 cases — orphan 属性禁止 + Reveal ラップ確認)
  - `service/lib/__tests__/constants.test.ts`: SOCIAL_LINKS 4 cases 追加
  - `service/lib/__tests__/portfolio.test.ts`: formatProjectNumber 4 cases 追加

## ビルド結果
- `pnpm exec tsc --noEmit` → EXIT=0
- `pnpm lint` → No ESLint warnings or errors

## テスト結果
- `pnpm test` → **Test Files 8 passed (8) / Tests 80 passed (80)** (前回 50 passed → 80 passed、+30 ケース)

## 収束ゲート
| 指標 | 件数 |
|------|------|
| new（今回修正） | 9（ARCH 6 + FE 2 + TEST 1。ただし TEST-NEW-bookcluster と ARCH-NEW-BookCluster-tests は同じ要因なので実質 8 ロジック） |
| reopened（再発修正） | 0 |
| persists（前回から継続、今回未着手） | 0 |

## 証拠
- `Grep "function isActive\(pathname"` → 0 hits（重複削除済み）
- `Grep "const GitHubIcon\|function GitHubIcon\|const ExternalIcon\|function XIcon"` → `components/icons/{GitHubIcon,XIcon}.tsx` の 2 件のみ（canonical 定義）
- `Grep "data-reveal"` → `app/globals.css` (CSS) と `components/animations/Reveal.tsx` (canonical) のみ。NewsCard/DayHead から消失
- `pnpm test` ログで `BookCluster.test.ts (13 tests)` `nav-utils.test.ts (5 tests)` `reveal-attr.test.ts (3 tests)` が新規追加され全 pass
- `tsc --noEmit` EXIT=0 / `next lint` No warnings or errors
- 修正は架構レビューの「修正案」列に明記された方針（新規モジュール集約 / 既存 lib への helper 追加 / NewsContent 側 Reveal ラップ）に厳密に従い、迂回策・後方互換コードは追加していない