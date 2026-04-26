# 計画レポート: docs/design のデザイン素案を既存サイトに適用

## 1. 参照資料の確認

### docs/design 配下（実読了）
- `docs/design/shared/tokens.css` — 青系アクセント、ダーク既定、`data-theme="light"` 切替式の CSS 変数群＋reset＋共通 utility (`.btn`, `.card`, `.eyebrow`, `.container`, `.hairline`, `.grid-bg`)
- `docs/design/shared/shell.css` — `.site-header` (sticky/blur), `.site-nav`, `.theme-toggle`, `.nav-toggle`, `.site-mobilenav`, `.site-footer` (4カラム), `.site-bg-canvas`, `[data-reveal]`
- `docs/design/shared/shell.js` — Theme（localStorage キー `onclimb-theme`）/ Fonts 動的注入（Geist, Geist Mono, Noto Sans JP, Space Grotesk）/ Header & Footer DOM 生成 / 粒子背景キャンバス / Reveal-on-scroll / Footer UTC 時計
- `docs/design/index.html` — デザインプレビュー一覧（既存サイト適用対象外）
- `docs/design/top.html` — Hero（粒子文字「onclimb」+ eyebrow ピル + spotlight + 浮遊 shapes + lead/sub + CTA）→ Stack 3 cap-grid + stats 4 → Explore 5 grid → CTA band
- `docs/design/profile.html` — page-hero (crumb / role pill / h1 / lead) → identity card → 自己紹介 → 経歴 (career timeline) → 関心 (interest grid) → 資格 (certs grid) → next-link
- `docs/design/skill.html` — radar SVG (8軸) + legend list → level legend → カテゴリ別 skill-bar
- `docs/design/portfolio.html` — page-hero → filter-bar (All/Personal/Work) → category 別 proj-list（番号 / period / desc / highlights / tech / detail-CTA / links）
- `docs/design/portfolio/onc-limb.html` — detail-hero（crumb / num / period / status / h1 / lead / CTA）→ facts 4 → 作成背景 → 使用技術 (6 tech-cat) → インフラ構成図 (SVG arch-svg) → 工夫した点 (6 craft) → pager (prev/next)
- `docs/design/news.html` — page-hero (live-status pill) → ticker (横スクロール) → tag filter → 日別グリッド (Today / Yesterday / Two days ago) の ncard / ncard--feat / ncard--mono バリアント
- `docs/design/book.html` — page-hero + view toggle (Graph/List) → graph-wrap (cluster + book ノード + edges + detail panel + legend + help) / list-wrap (cluster別 bcard)
- `docs/design/assets/MainLogo.png` — ロゴ画像

### 既存サイト（service/）構成
- フレームワーク: Next.js 15 App Router + TypeScript + Tailwind CSS v3
- デプロイ: Cloudflare Workers via OpenNext / DB: Cloudflare D1 + Drizzle ORM / 認証: NextAuth (`/studio` 配下のみ)
- CSS: `app/globals.css`（HSL 水彩テーマ、ライト固定）, `tailwind.config.ts`（turquoise/terracotta 拡張・Inter フォント・実質アクティブ）, `tailwind.config.js`（shadcn-ui ベース、`components.json` 参照）の **二重 config**
- Layout: `app/layout.tsx` → `<SiteShell>` → `<Header />` + children + `<Footer />`、`/studio` は SiteShell バイパス
- ライブラリ: motion, Radix UI, lucide-react, react-markdown, gray-matter
- ルーティング: `/`, `/profile`, `/skills`, `/portfolio`, `/portfolio/[id]`, `/news`, `/news/[date]`, `/books`, `/social`, `/studio/...`

---

## 2. ページ対応表（design ↔ service）

| 素案 | 既存ルート | 対応関係 | 適用方針 |
|------|-----------|---------|---------|
| `top.html` | `/` (`app/page.tsx`) | 一致 | 素案に再実装 |
| `profile.html` | `/profile` (`app/profile/page.tsx`) | 一致 | 素案に再実装 |
| `skill.html` | `/skills` (`app/skills/page.tsx`) | 一致 | 素案に再実装 |
| `portfolio.html` | `/portfolio` (`app/portfolio/page.tsx`) | 一致 | 素案に再実装 |
| `portfolio/onc-limb.html` | `/portfolio/[id]` (`portfolio-site` md) | 表記揺れ。`onc-limb.com` プロジェクト＝既存 `portfolio-site` (`docs/portfolio/portfolio-site.md` の `links.github = onc-limb/homepage`) で同一実体。マッピング適用 | 素案に再実装。id は `portfolio-site` 維持 |
| `news.html` | `/news` (`app/news/page.tsx`) | 一致（ただし既存は日別を別ルート `[date]` に分割） | 素案準拠の単一ページ。既存 `[date]` 詳細は素案カードスタイルで残置 |
| `book.html` | `/books` (`app/books/page.tsx`) | 一致 | 素案に再実装 |
| `index.html` | （対応なし） | 素案にあって既存にないページ。スコープ外 | **除外**。除外理由：タスク指示書「素案にあって既存サイトに無いページ → 無視」、加えて index.html は素案集の目次でありプロダクト機能ではないため代替実装不要 |
| （対応なし） | `/social` (`app/social/page.tsx`) | 既存にあって素案にない | 素案の `.card` / トークンを使い「他ページの雰囲気で整合」させ再実装 |
| （対応なし） | `/studio/*` | 既存にあって素案にない、認証必須の管理画面 | **対象外**。`SiteShell` も適用していない既存仕様維持 |

---

## 3. 要素単位の棚卸し（素案要素 → 既存差分 → 変更要否）

### 共通基盤（shared/tokens.css + shared/shell.css + shared/shell.js）

| 要素 | 素案 | 既存実装 | 変更要否 | 根拠 / 暫定対応 |
|------|------|---------|---------|---------------|
| カラートークン (bg/fg/accent/cyan/indigo/violet/amber/rose/hairline) | tokens.css `:root` で定義 | `app/globals.css:6-58` で水彩 HSL、`tailwind.config.ts:17-48` で turquoise/terracotta | **要変更** | 素案優先。turquoise/terracotta を素案カラーに置換、`globals.css` の HSL を素案 HEX/rgba に置換 |
| ダーク既定 + data-theme 切替 | tokens.css `:root[data-theme="dark"]` 既定 / `[data-theme="light"]` 切替 | ライト固定。data-theme 不使用 | **要変更** | 素案優先方針（指示書「破壊的変更を伴う場合のみ計画レポートに明記」に該当：水彩→青系ダーク既定の視覚的破壊あり） |
| フォント | Geist / Geist Mono / Noto Sans JP / Space Grotesk / JetBrains Mono | Inter (`app/layout.tsx:5`) | **要変更** | 素案優先。`next/font/google` で Geist + Noto Sans JP + Space Grotesk + JetBrains Mono を読み込む（Geist は `next/font/google` 提供あり） |
| 共通 utility (`.btn`, `.card`, `.eyebrow`, `.container`, `.hairline`, `.grid-bg`, `.dim`, `.dimmer`, `.strong`, `.font-mono`) | tokens.css | 一部のみ tailwind ユーティリティで代替 | **要変更** | `globals.css` の `@layer components/utilities` で素案準拠に提供 |
| Reset (`*, html, body`, scrollbar, ::selection) | tokens.css | shadcn ベース | **要変更** | 素案準拠 |
| サイトヘッダー (sticky/blur, brand mark, nav, theme-toggle, nav-toggle) | shell.css `.site-header` + shell.js `renderHeader` | `components/header/Header.tsx:48-110`（sticky/blur あり、brand mark / theme-toggle なし、スクロール検知でモバイル隠す挙動） | **要変更** | 素案準拠で再実装。スクロール検知挙動は素案にないため削除（素案優先による破壊的変更：モバイルでのヘッダー自動隠しが消える） |
| サイトフッター (4カラム: brand / sitemap / find me / status with UTC clock) | shell.css `.site-footer` + shell.js `renderFooter` | `components/footer.tsx:1-14`（著作権1行のみ） | **要変更** | 素案準拠で再実装 |
| 粒子背景キャンバス (mouse 反応, テーマ追従) | shell.js `mountParticles` | `components/animations/GeometricBackground.tsx`（top のみ、figures 8 個） | **要変更** | グローバル背景に変更。GeometricBackground は素案にないため削除候補、FloatingShape も同様（top の浮遊 shape は素案にあるので別 component で再実装） |
| Reveal on scroll (`[data-reveal]`) | shell.js `setupReveal` | `components/animations/FadeInSection.tsx` (motion whileInView) | **要変更** | 素案準拠の `<Reveal>` ラッパー新規。motion 経由でも実現可能だが命名・delay 仕様が異なるため再実装 |
| Theme toggle ボタン (Sun/Moon SVG, localStorage `onclimb-theme`) | shell.js `applyTheme` + `.theme-toggle` | 不在 | **要変更**（新規追加） | 素案準拠 |
| Nav 定義（順序: Home / Profile / Skills / Portfolio / News / Books） | shell.js `NAV` | `lib/constants.ts:12-43`（順序: Profile / Skills / Portfolio / Books / News / Social） | **要変更** | 素案順序＋ Home（top）追加。Social は素案フッター "Find me" に降格しヘッダー nav からは外す（素案準拠） |
| `<body data-page="...">` | 各 HTML | 不在 | **要変更**（軽微） | active state 判定は `usePathname()` で代替するため body 属性は不要 |

### top（`/`）

| 要素 | 既存差分 | 変更要否 | 根拠 |
|------|---------|---------|------|
| Hero eyebrow ピル（`.hero__eyebrow` + 拍動ドット） | 不在 | 要追加 | 素案 |
| Hero 粒子文字「onclimb」キャンバス（`#hero-title-canvas`） | `HeroContent` で文字列レンダ | 要差し替え | 素案 |
| Hero spotlight (`.hero__spotlight` mouse 追従) | 不在 | 要追加 | 素案 |
| Hero 浮遊 shapes (`.hero__shapes` + `.shape--1..6`) | `GeometricBackground`+`FloatingShape` だが配置/形が違う | 要差し替え | 素案 |
| Hero CTA (Profile / Portfolio ボタン) | "View News" などのリンク | 要差し替え | 素案 |
| Hero scroll hint (`.hero__hint`) | 不在 | 要追加 | 素案 |
| Section 01 What I do (cap-grid 3: Backend / Frontend & UX / Infra) | `AnimatedSkillCard` 3つ（Backend / Architecture / Frontend & Infra） | 要差し替え | 素案 |
| Stats 4 (`5+ years` / `4 domains` / `¥10K` / `∞`) | 不在 | 要追加 | 素案 |
| Section 02 Explore (5 cards: Profile / Skills / Portfolio / News / Books) | `AnimatedNavCard` で 6 件（Social含む） | 要差し替え | 素案準拠で 5件＋Social は除外 |
| CTA band (contact mailto + GitHub) | 不在（既存は News プロモセクション） | 要追加 | 素案 |
| News プロモ section（既存） | — | **削除** | 素案にない／Explore で News 導線提供済み |

### profile（`/profile`）

| 要素 | 既存差分 | 変更要否 |
|------|---------|---------|
| page-hero（crumb / role pill `available for new projects` / h1 / lead） | hero（avatar 中央 + name のみ） | 要差し替え |
| identity card（avatar + name + title + meta 4: 📍Tokyo / EXP / FOCUS / STATUS） | Avatar コンポーネントのみ | 要追加 |
| Story 01「自己紹介」（pull quote 含む） | Card 内 markdown | 要差し替え |
| Story 02「経歴」（career timeline: period + role + bullets） | Card 内 markdown | 要差し替え。`lib/profile.ts:11-37` の `parseSections` を強化し、`### 役職 + - 箇条書き` 構造を構造化データに |
| Story 03「エンジニアとしての今 — 関心」（interest grid 6） | markdown | 要差し替え |
| Story 04「資格」（certs grid 6） | 既存 markdown 同名項目あり | 要差し替え。markdown のリスト要素を抽出 |
| next-link (`/skills` 誘導) | `Link` 2 枚 | 要差し替え |

### skill（`/skills`）

| 要素 | 既存差分 | 変更要否 |
|------|---------|---------|
| page-hero（crumb + h1 + lead） | hero（"Skills" + Tech Stack） | 要差し替え |
| Radar chart SVG（8軸: backend/frontend/infra/arch/ai/devops/low/sec） | 不在 | 要追加（新規 `RadarChart` component）。値は既存 `Skill[]` から軸ごとに集計（マッピング: backend = `framework`+`api` の平均など）→ 集計ロジックを `lib/skills.ts` に追加 |
| Radar legend list | 不在 | 要追加 |
| Level legend (5/4/3/2/1) | level 凡例あり (`levelLabels`) | 要差し替え |
| カテゴリ別 skill-bars（`.skill-bar` + level 色 + chips） | カテゴリ別 SkillCard（icon / experience / knowledge / relatedTech / relatedBooks） | 要差し替え |
| experience / knowledge / relatedBooks | 既存にあり、素案にない | 削除（**素案優先**）。データパース処理は維持し UI のみ簡素化 |

### portfolio（`/portfolio`）

| 要素 | 既存差分 | 変更要否 |
|------|---------|---------|
| page-hero | hero | 要差し替え |
| filter-bar（All / Personal / Work, client） | 不在（personal/work を縦に並べるのみ） | 要追加（client component に分離） |
| proj-list の card（番号 / 期間 / title / desc / highlights / tech / View case study CTA / links GitHub・Demo・Article） | `ProjectCard` 別仕様 | 要差し替え |
| 既存 `portfolioMarkdowns` 配列が空（`lib/portfolio.ts:109-112`） | — | **MISSING_FEATURES.md に記載**。今回は配列に `portfolio-site.md` を import 復活させる対応で 1 件は表示可能。素案デモの 6 件相当を出すには md 追加実装が必要 |

### portfolio/[id]（`/portfolio/portfolio-site`）

| 要素 | 既存差分 | 変更要否 |
|------|---------|---------|
| detail-hero（crumb / 番号 / 期間 / status pill / h1 / lead / CTA） | 中央寄せ hero（戻るリンク / category / title / divider / lead / meta / links） | 要差し替え |
| facts grid 4 (CATEGORY / ROLE / DURATION / STATUS) | meta 2 (期間 / 担当) | 要追加（DURATION/ROLE は既存 `Project.period`/`Project.role` から、CATEGORY は `Project.category`、STATUS は MISSING_FEATURES.md に記載した上で暫定 "In Production" or `period` から推定） |
| 01 作成背景（pull quote 含む） | Section「概要」「背景・課題」 | 要差し替え（既存 `detail.overview` + `detail.background` を結合してマークアップ） |
| 02 使用技術（tech-cat 6 グループ: Frontend / Backend・API / Data / Infra・CDN / DevOps / Quality） | Section「使用技術」フラットなタグ列 | 要差し替え。**カテゴリ別表示用メタが既存 `Project.technologies: string[]` に無い → MISSING_FEATURES.md に記載**。暫定でフラット表示（素案デザインを適用しつつカテゴリ分けは未対応） |
| 03 インフラ構成図（arch-svg） | Section「アーキテクチャ」（component カード列） | 要差し替え。**SVG 図用の座標・接続データが既存スキーマに無い → MISSING_FEATURES.md に記載**。暫定で素案 SVG 構造を `portfolio-site.md` 専用にハードコード or マークダウン拡張 |
| 04 工夫した点（craft 6） | Section「技術的な工夫」（borderLeft list） | 要差し替え。既存 `detail.technicalPoints[]` をそのまま使用 |
| Section「課題と解決策」「成果・学び」「今後の展望」（既存にあり、素案にない） | — | **削除**（素案優先）。`Project.detail.challenges/results/futureWork` データ自体は型維持。**根拠**: 素案では portfolio detail は背景／使用技術／構成図／工夫の 4 セクションに整理されており、課題・成果・展望は別タイプの情報として表現されていない。素案の意図に沿って画面から落とす |
| pager（prev/next portfolio link） | "Portfolio に戻る" 単独 | 要追加。`getProjectIds()` の順序で前後を導出 |

### news（`/news`）

| 要素 | 既存差分 | 変更要否 |
|------|---------|---------|
| page-hero（live-status pill） | hero | 要差し替え |
| ticker（横スクロール: タグ + 増減カウント） | 不在 | 要追加（**ticker 用データが既存スキーマに無い → MISSING_FEATURES.md に記載**）。暫定で source 集計や直近のタグ件数を表示、もしくは UI のみ実装＋データソース TBD |
| tag filter (All / frontend / backend / infra / ai / lang) | 不在（**news に tags 列が無い → MISSING_FEATURES.md に記載**） | 要追加（UI のみ）。暫定で source 別フィルタにすり替えるか、UI 実装＋未稼働 |
| 日別グリッド（Today / Yesterday / Two days ago の day-head + ncard グリッド） | 日別サマリ → 別ページ詳細 | **構造変更**: `/news` 単一ページに直近 N 日分を展開（素案準拠）。既存 `/news/[date]` 詳細ルートは generateStaticParams 互換性のため残置し素案 ncard スタイルで再実装 |
| ncard variants (feat / mono) | 不在 | 要追加。割当ロジック: `feat` = 各日の先頭 1 記事、`mono` = source が GitHub/Trending 系のときなど。MISSING_FEATURES.md に「ncard variant 判定基準」記載 |

### book（`/books`）

| 要素 | 既存差分 | 変更要否 |
|------|---------|---------|
| page-hero（h1 + lead + view-toggle Graph/List） | hero | 要差し替え |
| Graph view（cluster + book ノード + edges + detail パネル + legend + help） | 不在 | 要追加。**book 同士の `related` リンクが既存スキーマに無い → MISSING_FEATURES.md**、**`status: reading` を区別できない（`isRead: boolean` のみ） → MISSING_FEATURES.md**、**cluster (Architecture/Low-level/Web/Craft) のメタが既存タグにマップ不能 → MISSING_FEATURES.md**。暫定: クラスタ＝既存タグの上位 4 件、edges＝同タグ間、status＝`isRead` true→read / false→queue（reading は省略） |
| List view（cluster別 bcard） | BookCard グリッド + 検索 / 積読タブ / タグフィルタ / メモモーダル | 要追加。素案 List view を採用しつつ、既存の検索・積読タブ・タグフィルタ・メモモーダルは素案にないが**保持**（既存機能維持。素案との整合のためトークン・スタイルは素案準拠に） |

### social（`/social`）

| 要素 | 既存実装 | 変更要否 |
|------|---------|---------|
| GitHub / Zenn / X カードリスト | 既存（水彩テーマ） | 要更新（素案カードトークンに揃える） |

**根拠**: タスク指示書「既存サイトにあって素案に無いページ → 他ページのデザインから雰囲気を読み取り、整合性を保って適用」。

---

## 4. 設計

### 4.1 ディレクトリ構成（新規 + 変更）

```
service/
  app/
    layout.tsx                       [変更] <html data-theme="dark"> + フォント差し替え + ThemeProvider 注入
    globals.css                      [全面書き換え] tokens.css + shell.css の React 適合版
    page.tsx                         [全面書き換え] top
    profile/page.tsx                 [全面書き換え]
    skills/page.tsx                  [全面書き換え]
    portfolio/page.tsx               [全面書き換え]
    portfolio/[id]/page.tsx          [全面書き換え]
    news/page.tsx                    [全面書き換え]
    news/[date]/page.tsx             [スタイル更新]
    books/page.tsx                   [変更] hero 部分
    books/BooksContent.tsx           [全面書き換え] view-toggle + Graph + List
    social/page.tsx                  [スタイル更新]

  components/
    SiteShell.tsx                    [変更] ParticleBackground + Header + Footer + 子
    ThemeProvider.tsx                [新規] localStorage 読み出し + html data-theme 制御
    ThemeToggle.tsx                  [新規] Sun/Moon ボタン

    header/
      Header.tsx                     [全面書き換え] sticky/blur + brand mark + nav + actions
      SiteBrand.tsx                  [新規] mark + onclimb / page スラッシュ
      SiteNav.tsx                    [新規] desktop nav (active = pathname 一致)
      MobileNav.tsx                  [新規] hamburger drawer
      HeaderButton.tsx               [削除候補] SiteNav に統合
      index.ts                       [変更]

    footer/
      Footer.tsx                     [新規・footer.tsx をリプレース] 4カラム
      FooterClock.tsx                [新規] UTC tick (client)
      index.ts                       [新規]
    footer.tsx                       [削除]（footer/Footer.tsx に置換、SiteShell 側も import 修正）

    animations/
      ParticleBackground.tsx         [新規] canvas (client)
      Reveal.tsx                     [新規] IntersectionObserver ラッパー (client)
      FloatingShapes.tsx             [新規] top hero 浮遊 shape
      HeroParticleTitle.tsx          [新規] top hero 粒子文字
      HeroSpotlight.tsx              [新規] top mouse spotlight
      GeometricBackground.tsx        [削除]（素案で不採用、新たに未使用）
      FloatingShape.tsx              [削除]（同上）
      HeroContent.tsx                [削除]（HeroParticleTitle に置換）
      AnimatedSkillCard.tsx          [削除]（top の cap-grid に置換）
      AnimatedNavCard.tsx            [削除]（top の Explore に置換）
      FadeInSection.tsx              [削除]（Reveal に統合）
      index.ts                       [変更]

    skills/
      RadarChart.tsx                 [新規] SVG レーダー
      SkillBar.tsx                   [新規] バー + level 色 + chips
      SkillCategorySection.tsx       [新規]
    portfolio/
      ProjectCard.tsx                [新規] proj-list 用カード
      PortfolioFilter.tsx            [新規] All/Personal/Work (client)
      DetailHero.tsx                 [新規]
      TechGrid.tsx                   [新規]
      CraftCard.tsx                  [新規]
      ArchDiagram.tsx                [新規] SVG 構成図（portfolio-site 専用ハードコード）
      Pager.tsx                      [新規]
    news/
      Ticker.tsx                     [新規]
      NewsCard.tsx                   [新規] feat/mono variants
      NewsTagFilter.tsx              [新規] (client)
      DayHead.tsx                    [新規]
    books/
      BookGraph.tsx                  [新規] cluster + nodes + edges (client)
      BookListView.tsx               [新規] cluster 別 bcard
      BookCard.tsx                   [新規] 既存 BooksContent から分離
      BookDetailPanel.tsx            [新規]

    ui/                              [維持] shadcn コンポーネント
                                     ※ Card / Button / Badge / Tabs / Dialog などはトークン更新で
                                        自動的にダーク既定青系になる（CSS 変数経由）

  lib/
    constants.ts                     [変更] NAV_ITEMS の順序を素案準拠に。Social 削除（フッター "Find me" に降格）。Home 追加
    profile.ts                       [変更] parseSections を構造化（career/interests/certs を構造抽出）
    skills.ts                        [変更] レーダーチャート用軸集計 `getRadarAxes()` 追加
    theme.ts                         [新規] テーマキー / 型 / 既定値の定数

  tailwind.config.ts                 [全面書き換え] turquoise/terracotta 削除、素案カラーを CSS 変数経由で公開
  tailwind.config.js                 [全面書き換え] shadcn カラーマップを素案 CSS 変数に再マッピング、darkMode 切替

docs/design/
  MISSING_FEATURES.md                [新規]
```

### 4.2 アーキテクチャ判断

#### A. テーマ機構
- `<html data-theme="dark">` を SSR で出す（layout.tsx）
- レイアウト先頭で inline script で `localStorage.getItem('onclimb-theme')` を読み `data-theme` を上書き → hydration mismatch 回避
- `ThemeProvider`（client）が React state と localStorage を同期
- Tailwind `darkMode: ['selector', '[data-theme="dark"]']` で data-theme 連動
- カラーは素案 tokens.css の値を **CSS 変数** として `app/globals.css` の `:root` / `:root[data-theme="light"]` に直接置き、Tailwind には `colors.accent: 'var(--accent)'` 形で公開

#### B. Tailwind config 一本化
現状 `.ts` がアクティブ・`.js` は dead 推測（`bg-turquoise-500` が機能している事実から）。今回は両方更新（最小差分）。`.ts` をマスターとし、`.js` は shadcn 互換のため `components.json:7` の参照先として残す。両方とも素案トークンを参照する形で統一。

#### C. 共通スタイル基盤
- `app/globals.css`:
  - `@tailwind base; @tailwind components; @tailwind utilities;`
  - `:root` / `:root[data-theme="light"]` に素案 CSS 変数群
  - `@layer base` に reset（`html, body, h1-4, p, a, button, img, ::selection, ::-webkit-scrollbar`）
  - `@layer components` に `.btn`, `.btn-primary`, `.btn-ghost`, `.card`, `.eyebrow`, `.hairline`, `.grid-bg`
  - `@layer utilities` に `.font-mono`, `.dim`, `.dimmer`, `.strong`
  - `prefers-reduced-motion` ガード

#### D. SiteShell 構成
```tsx
<>
  <ParticleBackground />        // fixed inset, z-0, /studio では非表示
  <Header />
  <main>{children}</main>
  <Footer />
</>
```
`/studio/*` は SiteShell をバイパスする現行仕様維持（`SiteShell.tsx:8-13`）。

#### E. server / client 境界
- Server: 各 `page.tsx`（データ取得）、`Header` 内の brand / nav 構造（active 判定は client SiteNav に分離）、Footer の static 部分
- Client: `ThemeProvider`, `ThemeToggle`, `SiteNav`（pathname 監視）, `MobileNav`, `ParticleBackground`, `Reveal`, `HeroParticleTitle`, `HeroSpotlight`, `FloatingShapes`, `Ticker`, `PortfolioFilter`, `NewsTagFilter`, `BookGraph`, `BooksContent`, `FooterClock`

---

## 5. 実装方針 / 影響範囲

### 影響範囲（変更が波及する配線）
- `lib/constants.ts:NAV_ITEMS` 変更 → `Header / Footer / Top の Explore` すべてに伝搬
- `app/layout.tsx` のフォント変更 → 全ページのタイポグラフィ
- `tailwind.config.{ts,js}` のカラー再定義 → `bg-turquoise-*` 等を使用しているすべての箇所が破壊：grep ですべて置換が必要
  - 該当ファイル（grep 確認済み）: `app/page.tsx`, `app/profile/page.tsx`, `app/skills/page.tsx`, `app/portfolio/page.tsx`, `app/portfolio/[id]/page.tsx`, `app/news/page.tsx`, `app/news/[date]/page.tsx`, `app/books/page.tsx`, `app/books/BooksContent.tsx`, `app/social/page.tsx`, `components/header/*`, `components/footer.tsx`, `components/animations/*`, `components/ui/card.tsx`
- `globals.css` の HSL → 素案 HEX → `components/ui/*` の HSL 参照（`hsl(var(--background))` 等）も新変数で参照する形に再定義（または互換 shim）
- `app/layout.tsx` で `<html lang="ja">` のまま、`<head>` script は維持

### 後方互換コード
- なし（指示外、明示要求なし）

### 削除対象（今回の変更で新たに未使用になるもの）
- `components/animations/GeometricBackground.tsx`, `FloatingShape.tsx`, `HeroContent.tsx`, `AnimatedSkillCard.tsx`, `AnimatedNavCard.tsx`, `FadeInSection.tsx`
- `components/footer.tsx`（`components/footer/Footer.tsx` で置換、`SiteShell.tsx:4` の import 修正）
- `components/header/HeaderButton.tsx`（`SiteNav.tsx` に統合された場合）

### 維持（既存にあって素案にないが、削除しない）
- `/social` ページ（既存ページの新規削除はスコープ外）
- `/studio/*`（管理画面、認証必須、`SiteShell` バイパス）
- `app/api/*`（API 層、変更なし）
- `lib/db/*`, `drizzle.config.ts`, `scripts/seed.ts`, `middleware.ts`
- Books の検索 / 積読タブ / タグフィルタ / メモモーダル（既存機能、データを表示するために必要）
- News の `/news/[date]` 詳細ルート（generateStaticParams 互換性 + 個別記事への deep link）

---

## 6. 利用者向け配線（到達経路）

| 機能 | 入口 | 経路 |
|------|------|------|
| Theme toggle | ヘッダー右上ボタン | `<ThemeToggle>` → ThemeProvider → `<html data-theme>` |
| Profile / Skills / Portfolio / News / Books | ヘッダー nav, モバイルハンバーガー, top の Explore グリッド, フッター Sitemap | NAV_ITEMS から自動配線 |
| Portfolio detail | `/portfolio` の各カード "View case study" CTA | `Link href={`/portfolio/${project.id}`}` |
| Portfolio prev/next | detail 下部 Pager | `getProjectIds()` の前後参照 |
| Social (GitHub / Zenn / X) | フッター "Find me" カラム + `/social` ページ（既存維持） | フッター直接リンク + `/social` 直 URL |
| Contact | top の CTA band の `mailto:contact@onc-limb.com` | 素案準拠 |

新規ページは追加しない。新規ルートも追加しない（既存ルートの再実装のみ）。

---

## 7. Coder 向け実装ガイドライン

### 参照すべき既存パターン（ファイル:行）
- **Sticky/blur ヘッダー**: `service/components/header/Header.tsx:48-110`（sticky / backdrop-blur / nav の Tailwind パターン。ただし新実装はスクロール検知挙動なし）
- **SiteShell の /studio バイパス**: `service/components/SiteShell.tsx:8-13`（`pathname.startsWith('/studio')` で children のみ返す。維持）
- **Client コンポーネントで URL searchParams を扱うパターン**: `service/app/books/BooksContent.tsx:113-181`（タブ・検索・フィルタの URL 同期。`PortfolioFilter` / `NewsTagFilter` で同様のパターンを採用可）
- **generateStaticParams パターン**: `service/app/portfolio/[id]/page.tsx:19-22`, `service/app/news/[date]/page.tsx:14-19`（pager の前後リンク導出にも `getProjectIds()` を流用）
- **markdown セクション抽出**: `service/lib/skills.ts:101-152`（`extractListItems`）/ `service/lib/profile.ts:14-21`（gray-matter）。profile の career timeline / interest / certs 抽出は既存パターンに沿って `lib/profile.ts` を拡張
- **motion + variants**: `service/components/animations/HeroContent.tsx:1-69`（参考）。**ただし `Reveal` は素案 `[data-reveal]` 仕様準拠で IntersectionObserver 直書きを推奨（命名・delay 仕様一致のため）**
- **Theme 切替の hydration 対応**: 既存になし。layout.tsx 先頭に inline script を `dangerouslySetInnerHTML` で注入する（next-themes ライブラリ未導入のため自前実装）

### 新規パラメータ追加時の波及配線
- `Project` 型に `archDiagram`, `techCategories`, `status` を追加する場合（MISSING_FEATURES の暫定対応で型拡張する場合）:
  - `service/lib/portfolio.ts:23-51` の interface 拡張
  - `service/docs/portfolio/portfolio-site.md` の frontmatter 追加
  - `service/lib/portfolio.ts:113-154` の `parsePortfolioMarkdown` で読み取り
  - `app/portfolio/[id]/page.tsx` で表示
- `NAV_ITEMS` 変更:
  - `service/lib/constants.ts:12-43` の配列定義
  - `Header` (SiteNav, MobileNav)、`Footer`（Sitemap カラム）、`app/page.tsx`（Explore グリッド）すべてに自動反映
  - 順序: `[Home, Profile, Skills, Portfolio, News, Books]`（素案 `shell.js:34-41` 準拠）。Home は href `/`、それ以外は既存の href 維持

### 注意すべきアンチパターン
- **`<html data-theme>` を client 側だけで設定**: SSR 出力と不一致で hydration warning。inline script で先行設定すること
- **Tailwind `darkMode` の二重制御**: 素案 `data-theme="dark"` と shadcn の `class="dark"` を両方扱うと崩れる → `darkMode: ['selector', '[data-theme="dark"]']` に統一
- **ParticleBackground で `clientWidth/Height` を取らずに `window.innerWidth` 使用**: `position: fixed; inset: 0` と相性悪い。`canvas.clientWidth` で取り、`devicePixelRatio` 適用（素案 `shell.js:143-156` 参照）
- **`bg-turquoise-*` 残存**: トークン置換で grep を漏らすと CSS 未定義で透明扱い。**Coder は実装後に `grep -r "turquoise\|terracotta\|watercolor" service/` で残存ゼロを必ず確認**
- **Hero spotlight の CSS 変数 `--mx, --my`**: `style.setProperty('--mx', '50%')` でセット。React の inline `style` では `style={{ '--mx': '50%' } as React.CSSProperties}` 形式
- **Reveal の delay 仕様**: 素案は `data-reveal-delay="120"` を `transitionDelay` に（ms）。motion の `delay` (秒) と単位違い。素案準拠で ms に
- **Particle background のメモリリーク**: requestAnimationFrame ループは unmount 時にキャンセル必須。Reveal IntersectionObserver も同様に cleanup
- **Books Graph は `position: absolute` の % 指定**: SVG viewBox 0-100 で edges 描画 + DOM ノードは % 配置（素案 `book.html:341-345` 参照）
- **`prefers-reduced-motion` 対応**: 素案 tokens.css 末尾に既にあり、`globals.css` で同等のメディアクエリを残す。Particle background / hero spotlight は reduced motion で停止

### MISSING_FEATURES.md に記載する項目
| ページ | 不足機能・データ | 暫定対応 | 推奨追加実装 |
|------|----------------|---------|-------------|
| portfolio | `portfolioMarkdowns` 配列が空（`lib/portfolio.ts:109-112`） | `portfolio-site.md` を import 復活させ 1 件表示 | プロジェクトごとの md を `service/docs/portfolio/` に追加 |
| portfolio detail | 使用技術のカテゴリ別メタ（Frontend/Backend/Data/Infra/DevOps/Quality） | フラットなタグ列を素案 tech-cat スタイルで 1 グループに表示 | `Project.techCategories: { label: string; items: string[] }[]` を md frontmatter で受ける |
| portfolio detail | アーキテクチャ図 SVG の構造データ | `portfolio-site` 専用に SVG をハードコードした `ArchDiagram.tsx` | md/MDX で SVG を直接記述、または独自スキーマで box / arrow を定義 |
| portfolio detail | プロジェクトの `status`（In Production / Archived 等） | `period` から推定（'present' を含めば In Production） | `Project.status` フィールド追加 |
| news | `tags: string[]` 列が schema に無い | UI のみ実装、フィルタは UX dead（または source 別フィルタにすり替え） | `news.tags` 列追加 + crawler 側でタグ付け |
| news | ticker 用のトレンドカウント（"+12" 等） | UI 表示のみ（カウントは固定値・空白） | source / tag 別の前日比集計 |
| news | ncard variant（feat / mono）の判定基準 | `feat` = 各日の先頭、`mono` = source が GitHub Trending / 系をパターンマッチ | `news.featured: boolean` 列追加 |
| books | `status: reading` を区別不能（`isRead: boolean` のみ） | reading は表示せず、isRead=true → read / false → queue | `books.readingStatus: 'read'\|'reading'\|'queue'` 列追加 |
| books | 本同士の `related` 関連付けが無い | グラフでは同タグ間を edge で接続（暫定） | `book_relations` テーブル追加 |
| books | cluster (Architecture / Low-level / Web / Craft) のメタが無い | 既存タグの上位 4 件をクラスタ化（暫定） | `books.cluster` 列または `tags.cluster` フィールド |

### 確認方法
- `cd service && pnpm build` で型チェック + ビルド成功
- `pnpm lint` でリント通過
- 各ページを `pnpm dev` で目視確認、テーマ切替（dark/light）動作確認
- `grep -r "turquoise\|terracotta\|watercolor" service/` で旧テーマ残存ゼロを確認

---

## 8. スコープ判断のサマリ

### スコープ内（実装する）
- 共通基盤: tokens / shell.css / shell.js → React + Tailwind 再実装
- 全 7 ページの素案準拠への再実装（top / profile / skills / portfolio / portfolio detail / news / books）
- `/social` の素案トークン適用更新
- `/news/[date]` の素案カードスタイル適用
- 旧アニメーションコンポーネント・`footer.tsx` の削除（素案で新たに未使用）
- `MISSING_FEATURES.md` 新規作成

### スコープ外（除外、根拠付き）
- 素案 `index.html`（デザインプレビュー目次）の実装 → タスク指示書「素案にあって既存サイトに無いページ → 無視」
- `/studio/*` の素案適用 → 認証必須の管理画面、SiteShell バイパス済みで素案 shell の対象外
- `app/api/*` の変更 → スタイル適用対象外
- `tailwind.config.{ts,js}` の二重 config 解消（一本化） → 既存の構造的問題だがタスクスコープ外。今回は両方を素案トークンに更新するに留める（dead config 削除はリファクタリング扱いで別タスク）
- portfolio / news / books のスキーマ拡張（`status`, `tags`, `related`, `cluster` 等） → 「不足機能のメモ作成」のスコープ。実装はせず MISSING_FEATURES.md に記載
- News crawler 側のタグ付与・要約改修 → スコープ外
- Books の本同士の関連付けデータ整備 → スコープ外

### 後方互換性
- 明示要求なし → 計画に含めず（既存の水彩テーマからの段階移行・旧クラスのエイリアス等は不要）