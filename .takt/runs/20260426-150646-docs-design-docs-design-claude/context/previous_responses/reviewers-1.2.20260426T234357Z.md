## arch-review
レビューを実施しました。前回 REJECT した 6 件の指摘がすべて適切に解消されているか、各ファイルを直接読み確認しました。

## アーキテクチャレビュー

### 結果: APPROVE

### サマリー
前回 REJECT した 6 件のブロッキング指摘（DRY違反 5 件 + 純粋関数テスト欠落 1 件）はすべて解消済み。共通化先は既存の責務境界・依存方向と整合しており、新規 API も自然な抽象化。新たなブロッキング問題は検出せず。

### 確認した観点
- [x] 構造・設計
- [x] モジュール化（高凝集・低結合・循環依存）
- [x] 関数化（1関数1責務・操作の一覧性）
- [x] コード品質
- [x] 変更スコープ
- [x] テストカバレッジ
- [x] デッドコード
- [x] 呼び出しチェーン検証
- [x] 契約文字列のハードコード散在

### 今回の指摘（new）
| # | finding_id | family_tag | スコープ | 場所 | 問題 | 修正案 |
|---|------------|------------|---------|------|------|--------|
| - | - | - | - | - | 該当なし | - |

### 継続指摘（persists）
| # | finding_id | family_tag | 前回根拠 | 今回根拠 | 問題 | 修正案 |
|---|------------|------------|----------|----------|------|--------|
| - | - | - | - | - | 該当なし | - |

### 解消済み（resolved）
| finding_id | 解消根拠 |
|------------|----------|
| ARCH-NEW-BookCluster-tests-L44 | `service/components/books/__tests__/BookCluster.test.ts` 追加。`deriveTopClusters` (5 ケース：空入力/上位 4 件/lexical tiebreak/limit 制限/4 隅座標) と `assignBooksToClusters` (8 ケース：空 clusters/最初一致割当/非該当除外/`isRead` → status/座標 5..95 クランプ/related 自身除外+4 件 cap/共有ゼロ/memo→notes fallback) を網羅。`coder-decisions.md` 第3項の「純粋関数として切り出した（テスト容易性のため）」契約を充足 |
| ARCH-NEW-isActive-dup | `service/components/header/nav-utils.ts:6-9` に `isNavItemActive(pathname, href)` を集約。`SiteNav.tsx:5,14` と `MobileNav.tsx:6,29` がそれぞれ import して重複ロジック削除。`grep "function isActive\|isActive\("` で重複定義 0 件確認 |
| ARCH-NEW-social-urls-dup | `service/lib/constants.ts:22-38` に `SOCIAL_LINKS` を canonical 定義。`Footer.tsx:2,41` / `social/page.tsx:6,63` / `app/page.tsx:2,10-14` がすべて参照。GitHub URL の grep ヒットは constants.ts と参考用 docs/profile.md, portfolio-site.md (素データ) のみで、UI コードからは消えた。`app/page.tsx:11-13` で `find` 結果を初期化時に検証する Fail Fast パターンも適切 |
| ARCH-NEW-projectNumber-dup | `service/lib/portfolio.ts:188-205` に `formatProjectNumber(category, indexInList)` を export し、`CATEGORY_PREFIX` テーブル経由で `P/01`/`W/01` を生成。`PortfolioSection.tsx:41` と `app/portfolio/[id]/page.tsx:46` (`projectNumber()` 内) が共用。`grep "P/\${\|W/\${\|`P/\|`W/"` で重複ハードコード 0 件確認 |
| ARCH-NEW-icon-dup | `service/components/icons/{GitHubIcon,ExternalIcon,XIcon,index}.tsx` を新設。`ProjectCard.tsx:3` / `portfolio/[id]/page.tsx:11` / `social/page.tsx:5` がすべて `@/components/icons` 経由で import し、各ファイル内のインライン SVG 定義は削除済み。`grep "GitHubIcon\|ExternalIcon\|XIcon"` で定義は icons/ 配下の 3 ファイルのみ、それ以外はすべて参照側 |
| ARCH-NEW-PortfolioSection-dup | `service/components/portfolio/PortfolioSection.tsx` を新設し、`<PortfolioSection seq title countLabel projects />` で Personal/Work セクションを統合。`PortfolioListClient.tsx:24-39` が同じコンポーネントを 2 回呼ぶ形に縮約 (50 行 → 50 行だが構造重複は消えた)。`number` は `formatProjectNumber` を共用 |

### 再開指摘（reopened）
| # | finding_id | family_tag | 解消根拠（前回） | 再発根拠 | 問題 | 修正案 |
|---|------------|------------|----------------|---------|------|--------|
| - | - | - | - | - | 該当なし | - |

### 参考メモ（非ブロッキング）
- `BookListView.tsx:21-22` と `BookGraph.tsx:17-21` で `deriveTopClusters(books)` + `assignBooksToClusters(books, clusters)` の 2 行コンポジションが両方の View に存在する。ただし「目的の異なる 3 箇所以上」基準には該当せず（同じ "graph layout" 目的の 2 箇所）、かつ BookGraph は `useMemo` で memoize、BookListView は同期計算という性質差があるため、現状のままで問題なし。3 箇所目が出る場合に共通化を検討。
- `ProjectCard.tsx:47` の `pl-4.5` (Tailwind v3 デフォルト外) と inline `paddingLeft: "18px"` の二重指定は前ステップ（frontend-review）が非ブロッキング扱いとした既存挙動。アーキテクチャ観点では構造に影響しないため記録のみ。

### 検証証跡
- ビルド: 未実行（編集禁止フェーズ）。`coder-decisions.md` 第7項に `tsc --noEmit EXIT=0` / `pnpm lint warnings 0` 記録。
- テスト: 未実行（編集禁止フェーズ）。テスト追加 (`BookCluster.test.ts` 13 ケース / `nav-utils.test.ts` 5 ケース / `reveal-attr.test.ts` 3 ケース) はソース直読で確認。
- 動作確認: 未実行。ファクトチェックは git status / 各ファイル全文 Read / `grep` による重複定義・呼び出し元全件確認で実施。
  - `grep "GitHubIcon|ExternalIcon|XIcon"`: 定義は icons/ 配下のみ、import は 3 消費者
  - `grep "github\.com/onc-limb|zenn\.dev/onclimb|twitter\.com/onc_limb"`: UI コード（service/lib, service/components, service/app 配下）では constants.ts のみ
  - `grep "function isActive|isActive\("`: nav-utils.ts 集約後の重複なし
  - `grep "P/\${|W/\${|`P/|`W/"`: ハードコード 0 件

### APPROVE判定条件
- new / persists / reopened のブロッキング指摘 0 件。すべての前回 open finding が個別根拠付きで resolved。修正は既存の責務境界（header / lib / components/icons / components/portfolio）内に閉じ、新規公開 API も自然な抽象化（DRY違反の修正案として要求した範囲を逸脱しない）。

---

## frontend-review
検証が一通り完了しました。前回の指摘の解消状況、修正に伴う新規問題の有無を確認しました。

## 検証サマリー

**前回 (frontend-review.1) の指摘の解消確認:**

| finding_id | 状態 | 根拠 |
|------------|------|------|
| FE-NEW1-NewsCard-L70 (reveal-orphan-attr) | **resolved** | `NewsCard.tsx:62-71` から `data-reveal=""` / `data-reveal-delay` 属性と `delay` prop が削除済。`NewsContent.tsx:58-64` で `<Reveal key={article.url} delay={i * 40}>` ラップに移動 |
| FE-NEW2-DayHead-L12 (reveal-orphan-attr) | **resolved** | `DayHead.tsx:9-13` から `data-reveal=""` 削除済。`NewsContent.tsx:40-46` で `<Reveal>` ラップに移動 |

**回帰防止テスト確認:** `service/components/news/__tests__/reveal-attr.test.ts` (3 cases) で source-string assertion により `data-reveal` 直書き禁止 + `<Reveal>` ラップ存在を契約として固定済み。

**fix step が新たに導入した変更の影響確認:**

| 項目 | 確認結果 |
|------|---------|
| `nav-utils.ts` 共通化 → SiteNav/MobileNav | 両方が `isNavItemActive` を import、active ロジック重複なし。テスト 5 ケースあり |
| `SOCIAL_LINKS` 共通化 → Footer / social / app/page | 3 箇所すべて constants 由来。app/page では module 初期化時の Fail Fast 実装 (`throw new Error` if `!githubLink`) |
| `formatProjectNumber` helper → portfolio[id] / PortfolioListClient(→Section) | 両呼び出し元が `lib/portfolio.ts` の helper を使用、format 重複なし |
| `components/icons/` 集約 → ProjectCard / portfolio[id] / social / Footer | GitHubIcon/ExternalIcon/XIcon の重複定義は解消、`@/components/icons` から import |
| `PortfolioSection.tsx` 抽出 → PortfolioListClient | Personal/Work セクションが共通コンポーネントに統合、`<Reveal>` ラップは Section 内で完結 |
| `BookCluster.test.ts` (13 cases) 追加 | 純粋関数 `deriveTopClusters` / `assignBooksToClusters` の主要分岐 (上位 4/lexical tiebreak/limit/最初一致割当/除外/isRead マッピング/座標 5..95 クランプ/related cap 4/memo→notes fallback) を網羅 |

**新規問題の検出:** なし。fix step が既存 props/import を残置していないか個別に確認 (NewsCard の `delay` prop 削除確認、Footer の旧インライン SOCIAL_LINKS 削除確認、ProjectCard 重複 SVG 削除確認)。

**前回の参考メモ（非ブロッキング）の扱い:** policy「堂々巡りの検出」に従い、前回非ブロッキングと判定した 4 項目（`pl-4.5` dead class / Pager rotate vs scale-110 / `live-blink::before` content 欠落 / 各種 inline SVG）の分類は維持。これらは fix step のスコープ外であり、再分類は loop を生むため新規 REJECT には起こさない。

## 判定: APPROVE

前回 (iteration 1) の new 2 件 (reveal-orphan-attr) はいずれも resolved。fix step の修正は責務分離 (Reveal を View 側に集約) を正しく実現し、回帰テストも追加されている。fix が新たに導入した共通化 (nav-utils / SOCIAL_LINKS / icons / PortfolioSection / formatProjectNumber) はいずれも責務境界内に閉じ、新規ブロッキング問題は検出されず。

Phase 2 のレポート生成を待ちます。

---

## testing-review
実装ファイル側を確認したのでレビュー判定を出します。前回の testing-review (initial) は `TEST-NEW-bookcluster-L44` 1 件で REJECT。今回は前回 fix で追加されたテストの妥当性を判定します。

---

# テストレビュー（testing-review iteration 2）

## 結果: APPROVE

## サマリー
前回 REJECT した `TEST-NEW-bookcluster-L44`（純粋関数 `deriveTopClusters` / `assignBooksToClusters` のテスト欠落）は解消済み。さらに、他レビュー（architect / frontend）の DRY 違反 / reveal-orphan-attr 系の修正に対して、family_tag ごとに再発防止テストが追加されており、テスト品質（GWT 構造・factory 利用・独立性・境界値カバレッジ）も基準を満たす。新たなブロッカーは検出せず。

## 確認した観点
| 観点 | 結果 | 備考 |
|------|------|------|
| テスト計画の観点カバー | ✅ | BookCluster (13), nav-utils (5), reveal-attr (3), SOCIAL_LINKS (4), formatProjectNumber (4) を新規追加 |
| GWT 構造 | ✅ | 全新規ケースで Given/When/Then コメント記載 |
| 命名規約 | ✅ | `it("does X when Y")` パターン徹底（例：`treats '/' as active only on the exact root pathname`） |
| 独立性・再現性 | ✅ | `factoryBook` で必要最小フィクスチャを生成、共有可変状態なし |
| モック・フィクスチャ | ✅ | 内部実装モックなし、引数注入による純粋関数検証 |
| 過不足判定 | ✅ | 13 ケースは全て分岐に対応（空入力 / 上位 4 / 同点 lexical / limit / corner positions / no-cluster / first-match assign / no-match exclude / read-queue / 5..95 clamp / related cap 4 / unique tag empty / memo fallback） |
| 境界値分析 | ✅ | `formatProjectNumber` は index=0/4/11、`relatedIds` cap=4、coords clamp 5..95 |
| 契約入力位置（body/query/path） | N/A | 本変更は HTTP/外部契約を持たない |

## 今回の指摘（new）
| # | finding_id | family_tag | カテゴリ | 場所 | 問題 | 修正案 |
|---|-----------|------------|---------|------|------|--------|
| - | - | - | - | - | 該当なし | - |

## 継続指摘（persists）
| # | finding_id | family_tag | 前回根拠 | 今回根拠 | 問題 | 修正案 |
|---|-----------|------------|----------|----------|------|--------|
| - | - | - | - | - | 該当なし | - |

## 解消済み（resolved）
| finding_id | 解消根拠 |
|------------|----------|
| TEST-NEW-bookcluster-L44 | `service/components/books/__tests__/BookCluster.test.ts` を新設（9413B、13 ケース）。前回指摘した 8 ケース要件 (a)〜(h) を全網羅。`describe("deriveTopClusters()")` 5 ケース＋`describe("assignBooksToClusters()")` 8 ケース。`factoryBook` ファクトリで Book 必須フィールドを overrides で受け取る形にしており既存 `factorySkill` パターンと整合。 `Grep "deriveTopClusters\|assignBooksToClusters"` で `service/components/books/__tests__/BookCluster.test.ts` がヒットすることを確認 |

## 再開指摘（reopened）
| # | finding_id | family_tag | 解消根拠（前回） | 再発根拠 | 問題 | 修正案 |
|---|-----------|------------|----------------|---------|------|--------|
| - | - | - | - | - | 該当なし | - |

## 参考メモ（非ブロッキング・Warning）
- `service/components/news/__tests__/reveal-attr.test.ts:43-44` の `<Reveal[\s>][^]*?<DayHead` 系正規表現は「ファイル中に `<Reveal` と `<DayHead` がこの順に現れる」しか保証しないため、無関係な `<Reveal>` ブロック後に `<DayHead>` が直書きされても通る潜在的な False Positive がある。ただし同ファイル内の `data-reveal` 不在チェック（NewsCard / DayHead）と冗長に組み合わさっており、再発検出は機能する。RTL（`@testing-library/react`）導入後にレンダリングベースへ置換するのが望ましいが、現時点の jsdom 未導入状況では妥当な代替策で、ブロッカーではない。
- `formatProjectNumber` テストは index=0, 4, 11 をカバーしているが、`category` の Record アクセスが想定外値で `undefined` になるケース（型システムで防御済み）は未テスト。型契約で十分なため追加不要。

## 検証証跡
- レビュー対象ファイル直読:
  - `service/components/books/__tests__/BookCluster.test.ts`（13 ケース、`it("...")` を 13 件確認）
  - `service/components/header/__tests__/nav-utils.test.ts`（5 ケース）
  - `service/components/news/__tests__/reveal-attr.test.ts`（3 ケース、fs.readFileSync ベース）
  - `service/lib/__tests__/portfolio.test.ts`（既存 8 + 新規 `formatProjectNumber` 4）
  - `service/lib/__tests__/constants.test.ts`（既存 7 + 新規 `SOCIAL_LINKS` 4）
- 実装側突合:
  - `service/components/books/BookCluster.ts:44-103` — テストが網羅
  - `service/components/header/nav-utils.ts:6-9`、`SiteNav.tsx:5,14` / `MobileNav.tsx:6,29` で `isNavItemActive` 使用、重複 `isActive` 局所定義は削除済み（`Grep "function isActive"` ヒット 0）
  - `service/components/news/NewsCard.tsx`、`DayHead.tsx` ともに `data-reveal` 属性なし、`NewsContent.tsx:40-46,58-64` で `<Reveal>` ラップを確認
  - `service/lib/portfolio.ts:199-205` の `formatProjectNumber` をテスト側 import 確認、`PortfolioSection.tsx:41` / `app/portfolio/[id]/page.tsx` で利用
  - `service/lib/constants.ts:22-38` の `SOCIAL_LINKS` をテスト側で参照、Footer / Top / social ページからの利用を確認
- ビルド: 未実行（編集禁止フェーズのため）。`coder-decisions.md` 第 7 項で `tsc --noEmit EXIT=0` / `pnpm lint` warnings 0 / `pnpm test` 50 passed が記録済み（前回 fix.1 は更にテストを追加したため、件数は増えている想定）
- テスト: 直接実行不可（権限制約）。ソース静的検証で構造・命名・独立性・境界値カバレッジを確認

## REJECT判定条件
- `new` 0 件、`persists` 0 件、`reopened` 0 件。前回 open finding `TEST-NEW-bookcluster-L44` は resolved。ブロッカー非存在のため APPROVE。