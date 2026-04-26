## arch-review
## 結果: REJECT

前回までの arch-review レポート（`architect-review.md`）は存在せず、本ステップは初回実行（Step Iteration: 1）です。すべての finding は `new` 判定です。

### サマリー

AI レビューは APPROVE で抜けてきましたが、設計観点でブロッキングの構造問題が 6 件あります。主に **DRY 違反の集中（同一ロジック・同一データ・同一 SVG・同一構造の重複）** と、**新規追加された純粋関数群へのテスト欠落** です。コード変更で導入された問題なので、変更スコープ内の REJECT 対象です（Policy: 「今回の変更で導入された問題 → ブロッキング」）。

### 検証した観点

| 観点 | 結果 |
|------|------|
| 構造・設計の妥当性 | ✗ 重複ロジック多数 |
| モジュール化 (高凝集 / 低結合) | ✗ 同じ責務が散在 |
| 関数化 (1関数1責務 / 一覧性) | ✗ 同名汎用ロジックの重複定義 |
| 変更スコープの適切性 | ✓ scope.md と一致 |
| テストカバレッジ | ✗ BookCluster 群に 0 件 |
| 呼び出しチェーン検証 | ✓ index barrel は外部 import と整合 |
| 契約文字列の散在 | ✗ Social URL / project number prefix が複数箇所 |

### 今回の指摘（new）

| # | finding_id | family_tag | カテゴリ | 場所 | 問題 | 修正案 |
|---|-----------|-----------|---------|------|------|--------|
| 1 | AR-NEW-BookCluster-tests-L44 | tests | TEST | `service/components/books/BookCluster.ts:44,66,105` | `deriveTopClusters` / `assignBooksToClusters` / `relatedIds` は新規追加された純粋関数で、coder-decisions #3 が「純粋関数として切り出した（テスト容易性）」と明記しているのにテストが 0 件。Policy「テストがない新しい振る舞い → REJECT」に該当。 | `service/components/books/__tests__/BookCluster.test.ts`（または `lib/__tests__/` 配下に同型のテスト）を追加。最低限: (a) `deriveTopClusters` がタグ出現上位 4 件を返し同点時は label 昇順、(b) limit が 4 未満で reasonable な振る舞い、(c) `assignBooksToClusters` が `c.label` を tags に持つ本のみ採用、(d) status が `isRead` から `read`/`queue` にマッピング、(e) `relatedIds` が同タグ共有の上限 4 件を返し自分自身を除外、を網羅。pure 関数なのでテストはストレートに書ける。 |
| 2 | AR-NEW-isActive-dup | dry | DRY | `service/components/header/MobileNav.tsx:49-52` と `service/components/header/SiteNav.tsx:31-34` | 完全に同一の `function isActive(pathname, href)` が 2 ファイルで定義されている。同一モジュール (`components/header/`) 内の汎用判定ロジックの重複。 | `service/components/header/nav-utils.ts`（または `Header.tsx` に閉じる）を新設し `isNavItemActive(pathname, href)` 1 つに集約。両ファイルから import する。`header/` モジュール内に閉じる抽象化なので公開 API を不自然に広げない。 |
| 3 | AR-NEW-social-urls-dup | dry | DRY | `service/components/footer/Footer.tsx:5-9` / `service/app/social/page.tsx:38-60` / `service/app/page.tsx:314` | GitHub / Zenn / X の URL が 3 箇所に散在。Footer は `name + href` の 2 フィールド、social page は `name + url + icon + description + username` の 5 フィールド、TopPage は GitHub URL のみハードコード。URL を変更したい場合、現状は 3 ファイル更新が必要。 | `service/lib/social.ts`（または既存 `lib/constants.ts` に追加）に `SOCIAL_LINKS = [{ name, url, username }]` を canonical 定義。Footer と TopPage は `url` だけ参照、social page はその上に `icon` と `description` を locally 結合する（icon は React 要素なので URL 表で持たない）。`lib/constants.ts` には既に `NAV_ITEMS` があり、サイト共通定数の置き場として自然。 |
| 4 | AR-NEW-projectNumber-dup | dry | DRY | `service/app/portfolio/[id]/page.tsx:57-65` の `projectNumber()` と `service/components/portfolio/PortfolioListClient.tsx:45,74` の `` `P/${...}` `` / `` `W/${...}` `` | `P/01` `W/01` の番号フォーマット（プレフィックス + zero-pad 2 桁）が 2 箇所に重複。フォーマットを変更（例: `P-01`）すると両方を直す必要がある。pager の prev/next にもこの番号を流すため、もう 1 箇所に増えている。 | `service/lib/portfolio.ts` に `formatProjectNumber(category, indexInList): string` を export し、両方の呼び出し元から使う。既に `findAdjacentProjectIds` を持つ `lib/portfolio.ts` がドメインの操作集約場所として自然。 |
| 5 | AR-NEW-icon-dup | dry | DRY | `GitHubIcon` が `service/components/portfolio/ProjectCard.tsx:4-14`, `service/app/portfolio/[id]/page.tsx:12-16`, `service/app/social/page.tsx:5-16` の 3 箇所に重複。`ExternalIcon` が `ProjectCard.tsx:16-28` と `portfolio/[id]/page.tsx:18-29` の 2 箇所に重複。 | 同一 SVG path / viewBox の Icon コンポーネントが複数定義され、同じ責務（GitHub マーク描画）が分散している。社内アイコンの一覧性が失われ、サイズ・stroke・aria-label が変わったときの整合維持が困難。 | `service/components/icons/{GitHubIcon,ExternalIcon}.tsx`（または既存に近い `components/ui/` の icons サブモジュール）に集約し、3 ファイルから import。social の `XIcon` と `BookOpen`（lucide）も同じ場所に並べておくと「サイト全体のブランドアイコン一覧」が 1 箇所で見える（操作の一覧性）。 |
| 6 | AR-NEW-PortfolioSection-dup | dry | DRY | `service/components/portfolio/PortfolioListClient.tsx:23-51` (Personal Projects) と `52-80` (Work) | 2 つのセクションは構造が完全に同一で、差分は `title` / `countLabel` / `numberSeq` ("/01" or "/02") / `prefix` ("P" or "W") / `array` のみ。同じ JSX が 2 回繰り返されており、3 つ目のカテゴリ追加時に同じパターンを再度コピーすることになる。Knowledge: 「本質的に同じ構造のコンポーネント → REJECT - 共通コンポーネント化」。 | `PortfolioSection`（`portfolio/PortfolioSection.tsx`）に抽出し、`PortfolioListClient` は `<PortfolioSection seq="/01" title="Personal Projects" countLabel="projects" prefix="P" projects={personal} />` を 2 回呼ぶだけにする。number フォーマット側は AR-NEW-4 の `formatProjectNumber` を使う。`portfolio/` モジュール内の責務分割で済むため新規公開 API の追加は不要。 |

### 継続指摘（persists）

| # | finding_id | family_tag | 前回根拠 | 今回根拠 | 問題 | 修正案 |
|---|-----------|-----------|---------|---------|------|--------|
| - | - | - | - | - | 該当なし（初回実行） | - |

### 解消済み（resolved）

| finding_id | 解消根拠 |
|-----------|---------|
| - | 該当なし（初回実行） |

### 再開指摘（reopened）

| finding_id | 解消根拠（前回） | 再発根拠 | 問題 | 修正案 |
|-----------|-----------------|---------|------|--------|
| - | - | - | 該当なし（初回実行） | - |

### Warning（参考、ブロッキングではない）

これらは本ラウンドで REJECT にはしないが、修正可能であれば併せて改善を推奨。

| 場所 | 問題 |
|------|------|
| `service/components/books/BookListView.tsx:21-22` | `deriveTopClusters` / `assignBooksToClusters` を `useMemo` せず、親 `BooksContent` の state 変化で毎レンダ再計算。`BookGraph.tsx:17-20` は `useMemo` 済みで非対称。`BooksContent.tsx` で 1 回計算して両子に渡せば DRY も同時に解消できる。 |
| `service/components/books/BookCluster.ts` | 純粋データ導出ロジックが `components/` 配下にある（React コンポーネントではない）。`service/lib/books-cluster.ts` または `lib/books.ts` の方がレイヤー的に整合。AR-NEW-BookCluster-tests-L44 の修正と同時にこの移動を検討。 |
| `service/components/news/NewsContent.tsx:20,73-117` と `service/components/news/NewsTagFilter.tsx:5` | `NewsTag` の文字列 (`frontend|backend|infra|ai|lang`) と `inferTags` が返すタグ集合、`MONO_SOURCES` の source 名が、別ファイルに散在し型では結合されていない。タグ追加時に片方更新を忘れる契約。`news-tags.ts` で canonical 定義を共有させると一覧性が出る。 |
| `service/app/news/[date]/page.tsx:62-105` | `service/components/news/NewsCard.tsx` と同じ `.ncard` クラスチェインを再記述。素案で詳細ページのカードが装飾を変えるなら DetailNewsCard として `news/` 配下に切り出すと記事カードバリアントの一覧性が出る。 |
| BookGraph.tsx (375), portfolio/[id]/page.tsx (372), BooksContent.tsx (365), ArchDiagram.tsx (348), app/page.tsx (326), profile/page.tsx (317) | 300 行超 (Knowledge: Warning)。ArchDiagram は単一 SVG なので分割インセンティブは低いが、`page.tsx` 群は section ごとにコンポーネント化（`HeroSection`, `ExploreSection` 等）すると見通しが改善する。 |

### スコープ評価

`coder-scope.md` の宣言（Large）と実際の変更内容は一致。素案準拠の意図的なハードコード（`portfolio-site` 専用 `ArchDiagram`、`Ticker.ITEMS`、TopPage の `CAPS` / `STATS`）は coder-decisions に記録された設計判断と整合し、`MISSING_FEATURES.md` で追跡されているため、今回は finding として上げない。

### 判定

`new` ブロッキング findings: **6 件** → **REJECT**。

修正アプローチとして、AR-NEW-2〜6 はいずれも「同一モジュール内（`header/`, `portfolio/`, `lib/`）への 1 ファイル抽出」で解決でき、新規公開 API を増やさず既存責務境界に収まります。AR-NEW-1 は純粋関数なので Vitest の既存基盤 (`lib/__tests__/`) と同型のテストを追加するだけで完結します。

---

## frontend-review
Now I have enough information. Let me write the review report. The critical issue I've identified is that `NewsCard.tsx` and `DayHead.tsx` set `data-reveal=""` directly on their root elements without being wrapped in the `<Reveal>` component. The CSS `[data-reveal] { opacity: 0; transform: translateY(20px); }` keeps them permanently invisible because no IntersectionObserver attaches to them (the React port's `Reveal` component is the only thing that sets up `IntersectionObserver`, unlike the original design's global `setupReveal()`).

## 結果: REJECT

### サマリー

`/news` ページの **DayHead と NewsCard が永続的に不可視** になる重大な UX バグを検出しました。両コンポーネントは `<Reveal>` ラッパーなしで `data-reveal=""` 属性を直接付与していますが、React 版 `Reveal` コンポーネントは自身が描画した要素にしか IntersectionObserver を貼らないため、`is-revealed` クラスが付与されず `opacity: 0; transform: translateY(20px)` のまま固まります。素案 `shell.js:setupReveal()` の `document.querySelectorAll('[data-reveal]')` グローバル走査を React 化する際の責務移動が漏れています。

### ファクトチェック根拠

- `service/app/globals.css:318-329` — `[data-reveal]` セレクタが opacity:0 / translateY(20px) を強制し、`is-revealed` クラスでのみ解除される
- `service/components/animations/Reveal.tsx:33-55` — IntersectionObserver は `Reveal` コンポーネント自身の `useRef(ref.current)` 1 要素にだけ `observe` する
- `grep -n data-reveal service/` の結果（実行済み）— `data-reveal=""` を直書きしているソースは `NewsCard.tsx:70` と `DayHead.tsx:12` の 2 箇所のみで、いずれも `NewsContent.tsx:39-43, 54-61` で **`<Reveal>` で包まれずに直接描画** されている
- 同じく `service/app/news/[date]/page.tsx:61` の `<article>` は `<Reveal>` で包んでいるため、`/news/[date]` 側は問題なく可視

### 今回の指摘 (new)

| # | finding_id | family_tag | カテゴリ | 場所 | 問題 | 修正案 |
|---|---|---|---|---|---|---|
| 1 | FE-NEW1-NewsCard-data-reveal | reveal-orphan-attr | デザイン忠実度 / アクセシビリティ / 表示崩れ | `service/components/news/NewsCard.tsx:70-71` | `<a>` 自身に `data-reveal="" data-reveal-delay={delay}` を直書きしているが、この `<a>` は `NewsContent.tsx:54-61` で `<Reveal>` ラッパーなしで直接レンダリングされる。`globals.css:318` の `[data-reveal] { opacity: 0; transform: translateY(20px); }` が常時適用され、`is-revealed` クラスを付ける IntersectionObserver は `Reveal.tsx` の自要素 ref にしか貼られないため、**全ての NewsCard が画面表示時から永続的に不可視**。`/news` ページの中身（記事カード）がユーザーに一切見えない。ホバー時の `hover:-translate-y-1.5 hover:rotate-[-0.4deg]` も opacity:0 のままなので意味を持たない。素案 `shell.js:220-237` の `setupReveal()` は `document.querySelectorAll('[data-reveal]')` でグローバルに observe する設計だが、React 版にこの責務移動が漏れている。 | 二択。**(A) NewsContent.tsx 側で `<Reveal>` で包む**: `NewsContent.tsx:54-61` を `<Reveal key={article.url} delay={i*40}><NewsCard article={...} variant={...} tags={inferred} /></Reveal>` に変更し、`NewsCard.tsx:70-71` の `data-reveal=""` `data-reveal-delay={delay}` 属性と `delay` プロップを削除（NewsCard 側の reveal 責務を Reveal コンポーネントに集約、Reveal が wrapper div を生成するので `<a>` の hover transform も維持できる）。**(B) SiteShell に global setupReveal を追加**: `SiteShell.tsx` に useEffect で `document.querySelectorAll('[data-reveal]:not(.is-revealed)')` を観測する hook を追加し、Reveal コンポーネントの個別 observer と並走させる。本タスクは Reveal コンポーネントを既に共通基盤として導入しているため (A) のほうが層構造として自然（個別コンポーネントが Reveal の存在を知らずに `data-reveal` 属性を漏らす方式は隠れ依存）。 |
| 2 | FE-NEW2-DayHead-data-reveal | reveal-orphan-attr | デザイン忠実度 / 表示崩れ | `service/components/news/DayHead.tsx:9-13` | `<header>` に `data-reveal=""` を直書きしているが、`NewsContent.tsx:39-43` で `<Reveal>` ラッパーなしで直接レンダリングされる。FE-NEW1 と同根の問題で、**全ての日付ヘッダー (Today / Yesterday / Two days ago) が永続的に不可視**。素案 `news.html:200-204` では `data-reveal` 単独で global setupReveal によって可視化されるが、React 版にはその仕組みがない。 | FE-NEW1 と同じ修正方針 (A) を適用：`NewsContent.tsx:39-43` で `<Reveal as="header">` 等で包むか、`DayHead.tsx:9-13` の `<header>` を `<Reveal as="header" ...>` に置き換え、`DayHead.tsx:12` の `data-reveal=""` 属性を削除する。一貫性のため FE-NEW1 と同じ責務分離を採用すること。 |

### 継続指摘 (persists)

| # | finding_id | family_tag | 前回根拠 | 今回根拠 | 問題 | 修正案 |
|---|---|---|---|---|---|---|
| - | - | - | - | - | 該当なし（reviewers_1 の初回実行） | - |

### 解消済み (resolved)

| finding_id | 解消根拠 |
|---|---|
| - | （reviewers_1 の初回実行のため過去指摘なし） |

### 再開指摘 (reopened)

| # | finding_id | family_tag | 解消根拠（前回） | 再発根拠 | 問題 | 修正案 |
|---|---|---|---|---|---|---|
| - | - | - | - | - | 該当なし | - |

### 参考メモ（非ブロッキング、修正は任意）

- `service/components/header/SiteNav.tsx:31-34` と `service/components/header/MobileNav.tsx:49-52` で同一の `isActive(pathname, href)` 関数が重複している。ボーイスカウト範囲だが今回の差分で導入された重複なので、`header/` 内の共通モジュールに抽出すると DRY 違反を防げる（必須ではない）。
- `service/components/portfolio/ProjectCard.tsx:72` の `pl-4.5` は Tailwind v3 のデフォルトに無く dead class。同要素に `style={{ paddingLeft: "18px" }}` で上書き済みなので影響はないが、`pl-4.5` を削除するか `pl-[18px]` に統一するとノイズが減る。
- `service/components/portfolio/Pager.tsx:8-23` の `<Arrow rotated />` で `style={{ transform: "rotate(180deg)" }}` を inline 指定しているが、同要素の `group-hover:scale-110` Tailwind class はインライン style に負けて hover 拡大が効かない。視覚的影響は軽微。
- `service/app/globals.css:359-361` の `.live-blink::before` は `content` プロパティが無いため pseudo-element 自体が描画されず、設定された `animation: live-blink` が無効。`/news` ヘッダー右側の "LIVE — collecting" ピル内の点滅アニメは未動作。素案 `news.html:21` は `::before { content:""; ... background: var(--accent); animation: blink ... }` で点滅させているため、忠実度のためには `globals.css` の `.live-blink::before` に `content: ""; ...（位置と背景）` を追加するか、`news/page.tsx:48-53` の `<span>` 側に animation を当てるかどちらか。

### 判定根拠

- 新規問題 (`new`): 2 件（いずれも変更ファイル内、ユーザー可視部分の表示が完全に消える critical な UX バグ）
- スコープ判定: `service/components/news/` は今回の変更で新規追加されたモジュール → ブロッキング
- ポリシー「テストがない新しい振る舞い」「実害が再現できる」要件にも合致（実コード上で必ず再現する常時不可視）

REJECT ステータスで差し戻します。修正案 (A) を採用すれば 1 ファイル＝5 行程度の変更で解消できます。

---

## testing-review
ファクト確認完了。実装内容と既存テストを突合した結果、`service/components/books/BookCluster.ts` に新規追加された純粋関数（`deriveTopClusters`, `assignBooksToClusters`）に対するテストが完全に欠落していることを確認しました。これは新しい振る舞いに対するテスト必須要件の違反です。

---

# テスト品質レビュー

## 結果: REJECT

## サマリー

このステップ（testing-review）は今回が初実行（Report Directory 内に `testing-review.md` 履歴なし）。前回 open findings は無いため、すべて `new` 判定となる。

実装ステップで導入された新規モジュール `service/components/books/BookCluster.ts` には、純粋関数 2 つ（`deriveTopClusters` / `assignBooksToClusters`）と内部ヘルパー 3 つ（`relatedIds` / `slugify` / `clamp`）が含まれるが、対応するユニットテストが 0 件。これは **「新しい振る舞い：テスト必須。テストがなければ REJECT」** 基準に直接該当する。

既存 5 ファイル（constants / theme / profile / skills / portfolio）のテストは Given-When-Then 構造・命名・独立性・境界値カバレッジともに良好。特に `findAdjacentProjectIds` と `isTheme` の境界値テストは堅牢。

## 検証した項目

| 観点 | 結果 | 備考 |
|------|------|------|
| 計画観点のカバレッジ | ❌ | BookCluster.ts のテスト欠落 |
| GWT 構造 | ✅ | 既存 5 ファイル全テストに `// Given / When / Then` コメント |
| 独立性・再現性 | ✅ | 共有可変フィクスチャ無し、`factorySkill` ファクトリで都度生成 |
| 命名規約 | ✅ | `it("does X when Y")` パターン、振る舞い記述 |
| 境界値・エッジケース | △ | portfolio/theme/skills で網羅的、profile の `total===2` 経歴・skills `backend` 平均値の正確性に弱点（Warning） |
| モック粒度 | ✅ | 内部実装をモックしておらず、純粋関数を引数経由で検証 |
| フィクスチャ設計 | ✅ | `factorySkill` で必要最小限を生成、テスト間で共有変更なし |
| 外部契約 (request body / query / path 等) | N/A | 本変更は UI/lib 層のみ。HTTP API 契約変更なし |
| envelope の流用検出 | N/A | レスポンス契約に該当するもの無し |

## 今回の指摘（new）

| # | finding_id | family_tag | カテゴリ | 場所 | 問題 | 修正案 |
|---|-----------|------------|---------|------|------|--------|
| 1 | TR-NEW1-bookcluster-untested | books-graph-untested | カバレッジ欠落（REJECT） | `service/components/books/BookCluster.ts` 全体（特に `deriveTopClusters`:44-60、`assignBooksToClusters`:66-103） | 今回新設された純粋関数 `deriveTopClusters` / `assignBooksToClusters` にテストが 1 件も無い。`coder-decisions.md` 第 3 項で「純粋関数として切り出した（テスト容易性のため）」と明記されているが、`service/components/books/__tests__` ディレクトリ自体が存在せず、`Grep BookCluster\|deriveTopClusters\|assignBooksToClusters` の結果も `BookCluster.ts` / `BookGraph.tsx` / `BookListView.tsx` の 3 ソースのみ。テストポリシー「新しい振る舞い：テスト必須。テストがなければ REJECT」に該当。さらに本モジュールは MISSING_FEATURES.md に基づく暫定導出ロジックで、algorithmic な分岐（タグ集計／同点時 lexical tiebreak／上位 4 件 slice／位置インデックス溢れ時 fallback `?? 50`／`isRead` 二値マッピング／`relatedIds` 4 件キャップ／座標 5..95 クランプ）を多数含むため、リグレッション検出のためのテストは特に必須。 | `service/components/books/__tests__/BookCluster.test.ts` を作成し、最低限以下の 8 ケースを追加する：(a) 空入力で `deriveTopClusters([])` が `[]` を返す、(b) タグ頻度上位 4 件のみ返却され `limit` で打ち切られる、(c) 同頻度時に lexical 昇順で安定する、(d) `assignBooksToClusters` が「最初にマッチした cluster」のみに本を割り当てる（重複所属しない）、(e) クラスタに属さないタグの本が結果から除外される、(f) `isRead: true` → `status: "read"` / `false` → `"queue"` のマッピング、(g) 座標が 5..95 にクランプされる、(h) `relatedIds` が自分自身を含めず最大 4 件で打ち切られる。`Book` ファクトリは既存テスト（`factorySkill`）と同パターンで作成。 |

## 継続指摘（persists）

| # | finding_id | family_tag | 前回根拠 | 今回根拠 | 問題 | 修正案 |
|---|-----------|------------|----------|----------|------|--------|
| - | - | - | - | - | 該当なし（このステップは初回実行） | - |

## 解消済み（resolved）

| finding_id | 解消根拠 |
|------------|----------|
| - | 該当なし |

## 再開指摘（reopened）

| # | finding_id | family_tag | 解消根拠（前回） | 再発根拠 | 問題 | 修正案 |
|---|-----------|------------|----------------|---------|------|--------|
| - | - | - | - | - | 該当なし | - |

## Warning（参考・非ブロッキング）

| # | 場所 | 観点 | 内容 |
|---|------|------|------|
| W-1 | `service/lib/__tests__/profile.test.ts` 145-160 | 境界値不足 | `extractCareer` の period 採番ロジックは `total===2` のとき `[CURRENT, START]`（PRIOR なし）になるが、このケースが明示的にテストされていない。3 件（CURRENT/PRIOR/START）と 1 件（CURRENT のみ）はテスト済み。`it("labels two career items as CURRENT and START with no PRIOR")` を追加することで採番ロジック全網羅になる。 |
| W-2 | `service/lib/__tests__/skills.test.ts` 123-138 | 集計値の精度検証不足 | `infra` 軸テストが `> 0 && <= 5` の範囲のみ確認し、平均値そのものを検証していない（5 カテゴリ混合の `(4+4+3+3+4)/5 = 3.6` を期待値で固定すべき）。境界値の検証としては範囲確認だけでは弱い。 |
| W-3 | `service/lib/__tests__/profile.test.ts` 90-101 | Pull-quote マルチライン未検証 | `> 行1\n> 行2` のように複数行 blockquote が `\n{2,}` で 1 段落になり space 結合される挙動がテストされていない。素案で複数行 pull-quote が登場する可能性は低いが、設計時の前提として 1 ケース欲しい。 |

> 注：W-1〜W-3 は単独では REJECT 理由にならない（テストポリシー「エッジケース・境界値のテスト不足 → Warning」）。BookCluster の REJECT と一括で対応するのが望ましい。

## 判定根拠

- ブロッキング（REJECT）：1 件（`TR-NEW1-bookcluster-untested`）
- Warning：3 件
- ブロッキングが 1 件以上あるため REJECT。
- ファクトチェック：`BookCluster.ts` を直接 Read（128 行確認）／`Grep "BookCluster|deriveTopClusters|assignBooksToClusters"` で test ファイル不在を確認／`ls service/components/books/__tests__` で `No such file or directory` を確認。