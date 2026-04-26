# タスク計画

## 元の要求

`docs/design` 配下の ClaudeDesign 素案を、既存サイト（`service/`）のフレームワーク上に再実装で反映する。デザイントークン・共通スタイル基盤を取り込み、全ページの見た目・構造を素案に合わせる。素案 HTML/CSS をそのまま移植せず、Next.js 15 App Router + Tailwind の構造で再実装する。素案優先で既存スタイル定義を上書き。素案にあって既存にないページは無視、既存にあって素案にないページは整合性を保って適用。不足機能は `docs/design/MISSING_FEATURES.md` に記録する。

## 分析結果

### 目的

- 素案のデザイントークン（青系アクセント・ダーク既定・data-theme 切替・Geist 系フォント）を Next.js + Tailwind 基盤に取り込む。
- 共通シェル（sticky/blur ヘッダー、4 カラムフッター、粒子背景キャンバス、reveal-on-scroll、theme toggle）を React コンポーネントとして再実装する。
- 既存 7 ページ（top / profile / skills / portfolio / portfolio detail / news / books）と整合ページ（social / news detail）を素案準拠に作り直す。
- 既存スキーマでは表現できない要素（reading status、本同士の関連、ニュースのタグ等）を `docs/design/MISSING_FEATURES.md` に整理する。

### 参照資料の調査結果

#### 参照資料（実読了）

- `docs/design/shared/tokens.css` — `:root` ＋ `:root[data-theme="dark"]`（既定）／`:root[data-theme="light"]` の CSS 変数群。`--accent: #5B8DEF`、`--bg: #0A1020`、reset、共通 utility（`.btn`, `.card`, `.eyebrow`, `.container`, `.hairline`, `.grid-bg`, `.dim/.dimmer/.strong`, `.font-mono`）、`prefers-reduced-motion`。
- `docs/design/shared/shell.css` — `.site-header`（sticky / `color-mix` blur / hairline）, `.site-brand`（mark + name + slash + page）, `.site-nav__link`（active = `is-active`）, `.theme-toggle`, `.nav-toggle`, `.site-mobilenav`, `.site-footer`（4 カラム: brand / sitemap / find me / status）, `.site-bg-canvas`, `[data-reveal]`, `.page`。
- `docs/design/shared/shell.js` — `applyTheme`（`localStorage.onclimb-theme`, `<html data-theme>` セット, `themechange` イベント）／フォント動的注入（Geist + Geist Mono + Noto Sans JP + Space Grotesk）／`NAV` 配列順 `[Home, Profile, Skills, Portfolio, News, Books]`／`renderHeader` / `renderFooter`／`mountParticles`（canvas, `clientWidth/Height`, `dpr`, mouse 反応, テーマ追従）／`setupReveal`（IntersectionObserver, threshold 0.12, rootMargin '0px 0px -8% 0px', `data-reveal-delay` を ms 適用）／`tick` で UTC 時計。
- 各ページ HTML（`top / profile / skill / portfolio / portfolio/onc-limb / news / book`）の DOM 構造とインタラクション（filter / view-toggle / radar SVG / news ticker / book graph）を確認。

#### 既存実装との主要差異

| 観点 | 素案 | 既存 |
|------|------|------|
| カラー基盤 | 青系アクセント＋多色（cyan/indigo/violet/amber/rose）／ダーク既定＋data-theme 切替 | 水彩テーマ（turquoise + terracotta）／HSL ライト固定 |
| Tailwind config | — | `.ts`（turquoise/terracotta、実質アクティブ）と `.js`（shadcn HSL、`components.json:7` 参照、dead 推測）の二重 |
| フォント | Geist / Geist Mono / Noto Sans JP / Space Grotesk / JetBrains Mono | Inter (`app/layout.tsx:5`) |
| ヘッダー | sticky/blur + brand mark + 中央 nav + theme-toggle + ハンバーガー | sticky/blur + ロゴ + 右 nav + ハンバーガー、**スクロール検知で mobile 隠す挙動あり**（素案にない） |
| フッター | 4 カラム（brand / sitemap / find me / status with UTC clock） | 著作権 1 行 (`components/footer.tsx`) |
| 背景演出 | 粒子背景 canvas（全ページ） | top のみ `GeometricBackground`（浮遊図形 8 個） |
| ヒーロー演出 | top: 粒子文字「onclimb」 + spotlight + 浮遊 shapes | top: `HeroContent`（テキスト＋ライン） |
| Reveal | `[data-reveal]` IntersectionObserver | motion `whileInView`（`FadeInSection`） |
| Theme toggle | あり | なし（ライト固定） |
| News 構造 | 単一ページに直近数日を展開 | 一覧 → `[date]` 別ルートで詳細 |
| Books | Graph / List の view toggle、status: read/reading/queue、本同士の `related` | 検索 + 積読タブ + タグフィルタ + メモモーダル、`isRead: boolean` のみ、本同士関連なし |

### デザイン要素の判定

#### 共通基盤（tokens.css + shell.css + shell.js）

| 要素 | 変更要/不要 | 根拠 |
|------|-------------|------|
| カラー CSS 変数（bg/fg/accent/cyan/indigo/violet/amber/rose 等） | 要変更 | 既存 `app/globals.css:6-58` HSL 水彩、`tailwind.config.ts:17-48` の turquoise/terracotta を素案値で上書き（指示「競合時は素案優先」） |
| ダーク既定 + data-theme 切替 | 要変更 | 既存はライト固定。素案優先（破壊的変更：水彩→青系ダーク既定の視覚転換） |
| フォントスタック | 要変更 | 既存 Inter のみ。`next/font/google` で Geist + Noto Sans JP + Space Grotesk + JetBrains Mono |
| 共通 utility (`.btn`, `.card`, `.eyebrow`, `.container`, `.hairline`, `.grid-bg`, `.dim/.dimmer/.strong`, `.font-mono`) | 要変更 | `globals.css` の `@layer components/utilities` で素案準拠提供 |
| Reset / scrollbar / `::selection` / `prefers-reduced-motion` | 要変更 | 素案準拠で再構成 |
| サイトヘッダー（brand mark + 中央 nav + theme toggle + nav toggle） | 要変更 | 既存 `components/header/Header.tsx:48-110` を素案準拠に再実装。スクロール検知で mobile 隠す既存挙動は素案にないため削除（破壊的） |
| サイトフッター（4 カラム + UTC clock） | 要変更 | 既存 `components/footer.tsx:1-14` をリプレース |
| 粒子背景 canvas（mouse 反応・テーマ追従） | 要変更 | `GeometricBackground` を `ParticleBackground` で置換、layout 全体に適用 |
| Reveal-on-scroll (`[data-reveal]`) | 要変更 | `FadeInSection` を素案仕様の `Reveal`（IntersectionObserver、`data-reveal-delay` ms）で置換 |
| Theme toggle | 要追加 | 既存になし |
| Nav 順序（Home / Profile / Skills / Portfolio / News / Books） | 要変更 | `lib/constants.ts:12-43` の現順序（Profile / Skills / Portfolio / Books / News / Social）を素案順序に。Home 追加、Social はヘッダーから外しフッター "Find me" に降格 |

#### top（`/`）

| 要素 | 変更要/不要 | 根拠 |
|------|-------------|------|
| Hero eyebrow ピル（拍動ドット） | 要追加 | 既存になし |
| Hero 粒子文字「onclimb」 canvas | 要差し替え | 既存 `HeroContent` をリプレース |
| Hero spotlight（mouse 追従の `--mx/--my`） | 要追加 | 既存になし |
| Hero 浮遊 shapes（`.shape--1..6`） | 要差し替え | 既存 `FloatingShape` 8 個を素案配置に再実装 |
| Hero CTA（Profile 見る / 作ったものを見る） | 要差し替え | 既存は News プロモ |
| Hero scroll hint | 要追加 | 既存になし |
| Section 01 cap-grid 3（Backend / Frontend & UX / Infra） | 要差し替え | 既存 highlights 3（Backend / Architecture / Frontend & Infra）を素案ラベルに再構成 |
| Stats 4（5+ years / 4 domains / ¥10K / ∞） | 要追加 | 既存になし |
| Section 02 Explore 5 グリッド | 要差し替え | 既存 `AnimatedNavCard` 6 件（Social 含む）を Profile/Skills/Portfolio/News/Books の 5 件に |
| CTA band（contact mailto + GitHub） | 要追加 | 既存になし |
| 既存「News プロモ」セクション | 削除 | 素案にない／Explore に News 導線あり |

#### profile（`/profile`）

| 要素 | 変更要/不要 | 根拠 |
|------|-------------|------|
| page-hero（crumb / role pill / h1 / lead） | 要差し替え | 既存は中央寄せ avatar+name |
| identity card（avatar + name + title + meta 4） | 要追加 | 既存は Avatar 単独 |
| 自己紹介（pull quote） | 要差し替え | 既存 Card 内 markdown |
| 経歴（career timeline: period + role + bullets） | 要差し替え | `lib/profile.ts:14-21` の `parseSections` を `### 役職 + - 箇条書き` の構造化抽出に拡張 |
| 関心 interest grid 6 | 要差し替え | 既存 markdown プレーン |
| 資格 certs grid 6 | 要差し替え | 既存 markdown のリスト要素を抽出 |
| next-link（→ skills） | 要差し替え | 既存は Card 2 枚 |

#### skill（`/skills`）

| 要素 | 変更要/不要 | 根拠 |
|------|-------------|------|
| page-hero（crumb + h1 + lead） | 要差し替え | 既存ヒーロー再構成 |
| Radar chart SVG（8 軸: backend/frontend/infra/arch/ai/devops/low/sec） | 要追加 | 既存になし。`lib/skills.ts` に軸集計関数 `getRadarAxes()` を追加し、既存 `Skill[]` から平均 level を算出 |
| Radar legend list | 要追加 | 既存になし |
| Level legend（5/4/3/2/1） | 要差し替え | 既存 `levelLabels` を素案配色に置換 |
| カテゴリ別 skill-bars（level 色 + chips） | 要差し替え | 既存 `SkillCard`（icon / experience / knowledge / relatedTech / relatedBooks）を素案 bar に |
| experience / knowledge / relatedBooks | 削除（UI のみ） | 素案優先。データ抽出処理は維持し、画面表示のみ簡素化 |

#### portfolio（`/portfolio`）

| 要素 | 変更要/不要 | 根拠 |
|------|-------------|------|
| page-hero | 要差し替え | 素案 |
| filter-bar（All / Personal / Work, client） | 要追加 | 既存になし |
| proj card（番号 / 期間 / title / desc / highlights / tech / View case study CTA / links） | 要差し替え | 既存 `ProjectCard` を素案準拠に |
| `portfolioMarkdowns` 配列が空（`lib/portfolio.ts:109-112`） | MISSING_FEATURES.md 記載 | 暫定で `portfolio-site.md` を import 復活させ 1 件表示 |

#### portfolio detail（`/portfolio/[id]`）

| 要素 | 変更要/不要 | 根拠 |
|------|-------------|------|
| detail-hero（crumb / num / period / status / h1 / lead / CTA） | 要差し替え | 既存中央寄せ hero を再構成 |
| facts grid 4（CATEGORY / ROLE / DURATION / STATUS） | 要追加 | 既存 meta 2（期間 / 担当）を拡張。STATUS は MISSING_FEATURES.md 記載＋暫定で period から推定 |
| 01 作成背景（pull quote） | 要差し替え | 既存「概要」「背景・課題」を結合 |
| 02 使用技術（tech-cat 6 グループ） | 要差し替え | 既存はフラット。`Project.technologies` にカテゴリ情報なし → MISSING_FEATURES.md 記載、暫定でフラット表示を素案 tech-cat スタイルで |
| 03 インフラ構成図（arch-svg） | 要差し替え | 既存 component カード列。SVG 構造データなし → MISSING_FEATURES.md 記載、暫定で `portfolio-site` 専用ハードコード `ArchDiagram.tsx` |
| 04 工夫した点（craft 6） | 要差し替え | 既存 `detail.technicalPoints[]` を素案 craft カードへ |
| Pager（prev/next） | 要追加 | `getProjectIds()` の前後参照 |
| 既存「課題と解決策」「成果・学び」「今後の展望」 | 削除 | 素案優先。素案 portfolio detail は背景／使用技術／構成図／工夫の 4 セクション構成。型 `Project.detail.challenges/results/futureWork` 自体は維持し画面非表示 |

#### news（`/news`）

| 要素 | 変更要/不要 | 根拠 |
|------|-------------|------|
| page-hero（live-status pill） | 要差し替え | 素案 |
| ticker（横スクロール） | 要追加 | データなし → MISSING_FEATURES.md 記載、暫定 UI のみ |
| tag filter（All / frontend / backend / infra / ai / lang） | 要追加 | `news.tags` 列なし → MISSING_FEATURES.md 記載、UI のみ実装 |
| 日別グリッド（Today / Yesterday / Two days ago の day-head + ncard） | 要差し替え | 既存 `[date]` 別ルートを残しつつ、`/news` は単一ページに直近 N 日分展開 |
| ncard variants（feat / mono） | 要追加 | variant 判定基準なし → MISSING_FEATURES.md 記載、暫定で「各日先頭=feat、source GitHub Trending=mono」 |
| `/news/[date]` 詳細ルート | 要スタイル更新 | generateStaticParams 互換で残置、素案カードスタイル準拠に |

#### book（`/books`）

| 要素 | 変更要/不要 | 根拠 |
|------|-------------|------|
| page-hero + view toggle（Graph / List） | 要差し替え | 素案 |
| Graph view（cluster + book ノード + edges + detail パネル + legend + help） | 要追加 | `related` / cluster / `reading` 状態が schema に無い → MISSING_FEATURES.md 記載、暫定で「クラスタ＝既存タグ上位 4／edges＝同タグ間／status＝isRead で read/queue 二値（reading は省略）」 |
| List view（cluster 別 bcard） | 要追加 | 素案 |
| 既存：検索 / 積読タブ / タグフィルタ / メモモーダル | 維持（素案トークン適用のみ） | 素案にない既存機能だが、データ表示に必要。素案優先＋既存機能保持の両立 |

#### social（`/social`）

| 要素 | 変更要/不要 | 根拠 |
|------|-------------|------|
| GitHub / Zenn / X カードリスト | スタイル更新 | 既存にあって素案にないページ。タスク指示「他ページの雰囲気で整合」→ 素案 `.card` トークンで再描画 |

### スコープ

#### 影響範囲（変更が波及）

- `lib/constants.ts:NAV_ITEMS` 変更 → Header / Footer / top の Explore 全配線
- `app/layout.tsx` のフォント変更 → 全ページのタイポグラフィ
- `tailwind.config.{ts,js}` カラー再定義 → `bg-turquoise-*` / `terracotta` / `watercolor` 全使用箇所が破壊。grep で一掃必要（対象: `app/page.tsx`, `app/profile/page.tsx`, `app/skills/page.tsx`, `app/portfolio/page.tsx`, `app/portfolio/[id]/page.tsx`, `app/news/page.tsx`, `app/news/[date]/page.tsx`, `app/books/page.tsx`, `app/books/BooksContent.tsx`, `app/social/page.tsx`, `components/header/*`, `components/footer.tsx`, `components/animations/*`, `components/ui/card.tsx`）
- `app/globals.css` HSL → 素案 HEX/rgba。`components/ui/*` の `hsl(var(--background))` 参照は新変数定義で互換性を確保

#### 新規追加ファイル

- `service/components/ThemeProvider.tsx`, `ThemeToggle.tsx`
- `service/components/header/SiteBrand.tsx`, `SiteNav.tsx`, `MobileNav.tsx`（`Header.tsx` 再実装に伴う分割）
- `service/components/footer/Footer.tsx`, `FooterClock.tsx`, `index.ts`
- `service/components/animations/ParticleBackground.tsx`, `Reveal.tsx`, `FloatingShapes.tsx`, `HeroParticleTitle.tsx`, `HeroSpotlight.tsx`
- `service/components/skills/RadarChart.tsx`, `SkillBar.tsx`, `SkillCategorySection.tsx`
- `service/components/portfolio/ProjectCard.tsx`, `PortfolioFilter.tsx`, `DetailHero.tsx`, `TechGrid.tsx`, `CraftCard.tsx`, `ArchDiagram.tsx`, `Pager.tsx`
- `service/components/news/Ticker.tsx`, `NewsCard.tsx`, `NewsTagFilter.tsx`, `DayHead.tsx`
- `service/components/books/BookGraph.tsx`, `BookListView.tsx`, `BookCard.tsx`, `BookDetailPanel.tsx`
- `service/lib/theme.ts`
- `docs/design/MISSING_FEATURES.md`

#### 既存変更ファイル

- `service/app/layout.tsx`（フォント差し替え + ThemeProvider 注入 + `<html data-theme="dark">` SSR + 先行 inline script）
- `service/app/globals.css`（全面書き換え：tokens.css + shell.css 相当）
- `service/tailwind.config.ts`, `tailwind.config.js`（カラー全置換、`darkMode: ['selector', '[data-theme="dark"]']` 統一）
- `service/components/SiteShell.tsx`（ParticleBackground + Header + Footer 構成）
- `service/components/header/Header.tsx`, `index.ts`
- `service/lib/constants.ts`（NAV_ITEMS 並び替え＋Home 追加・Social 削除）
- `service/lib/profile.ts`（career / interests / certs 構造抽出）
- `service/lib/skills.ts`（`getRadarAxes()` 追加）
- `service/lib/portfolio.ts`（`portfolio-site.md` import 復活）
- `service/app/page.tsx`, `profile/page.tsx`, `skills/page.tsx`, `portfolio/page.tsx`, `portfolio/[id]/page.tsx`, `news/page.tsx`, `news/[date]/page.tsx`, `books/page.tsx`, `books/BooksContent.tsx`, `social/page.tsx`（全面書き換え or スタイル更新）

#### 削除ファイル（今回の変更で新たに未使用）

- `service/components/animations/GeometricBackground.tsx`
- `service/components/animations/FloatingShape.tsx`
- `service/components/animations/HeroContent.tsx`
- `service/components/animations/AnimatedSkillCard.tsx`
- `service/components/animations/AnimatedNavCard.tsx`
- `service/components/animations/FadeInSection.tsx`
- `service/components/footer.tsx`（`footer/Footer.tsx` で置換）
- `service/components/header/HeaderButton.tsx`（`SiteNav.tsx` に統合）

#### 触らないファイル

- `service/app/studio/*`（認証必須の管理画面、SiteShell バイパス済み）
- `service/app/api/*`
- `service/lib/db/*`, `drizzle.config.ts`, `scripts/seed.ts`, `service/middleware.ts`
- `service/components/ui/*`（CSS 変数経由で自動的にダーク青系へ追従）
- `service/public/*`（ロゴ画像は維持）

### 検討したアプローチ

#### A. デザイントークンの取り込み方

| アプローチ | 採否 | 理由 |
|-----------|------|------|
| (A) 既存 HSL 変数を残し素案変数を追加 | 不採用 | 既存 turquoise/terracotta が大量箇所で使用中 → 削除しないと dead code が残る。指示「競合時は素案優先」と整合しない |
| (B) 既存テーマを素案カラーで全置換、shadcn 変数も再マッピング、`globals.css` を素案 tokens.css ベースに書き換え | **採用** | 指示「素案優先」に合致。`components/ui/*` は CSS 変数経由なので shadcn 互換維持可能 |
| (C) Tailwind config を全置換し tokens.css を `@import` | 不採用 | shadcn コンポーネントの HSL `hsl(var(--background))` 参照と整合しない |

#### B. ダークモードの扱い

| アプローチ | 採否 | 理由 |
|-----------|------|------|
| 既存ライト固定を維持、素案カラーのみライトテーマで適用 | 不採用 | 素案は dark default 設計で、tokens.css の構造そのものがダーク基調。指示「素案優先」と整合しない |
| dark default + data-theme 切替（素案準拠）／layout.tsx 先行 inline script で hydration 回避 | **採用** | 素案の `applyTheme(getTheme())` を SSR 互換で再現。next-themes 導入なしで自前 ThemeProvider 実装 |

#### C. Tailwind config の二重問題

| アプローチ | 採否 | 理由 |
|-----------|------|------|
| `.ts` を削除し `.js` 一本化 | 不採用 | `.ts` が現状アクティブ（turquoise クラスが効いている事実から推定）。一気の削除は破壊リスク高、リファクタリング扱いで別タスク |
| `.ts`/`.js` 両方を素案トークンに更新（最小差分） | **採用** | `components.json:7` が `.js` を参照する都合と、`.ts` がアクティブな現状の両方に対応 |

#### D. shell.js の Header / Footer 描画

| アプローチ | 採否 | 理由 |
|-----------|------|------|
| `dangerouslySetInnerHTML` で素案 HTML を注入 | 不採用 | React コンポーネントの作法に反する／active 判定や client インタラクションが扱いづらい |
| React コンポーネントとして再実装（SiteBrand / SiteNav / MobileNav / Footer / FooterClock） | **採用** | 既存 `components/header/Header.tsx` パターンに整合、Server / Client 境界を明示できる |

#### E. Reveal の実装

| アプローチ | 採否 | 理由 |
|-----------|------|------|
| 既存 `FadeInSection`（motion `whileInView`）を流用 | 不採用 | 素案の `data-reveal-delay`（ms 単位）と motion `delay`（秒）で単位が違う／命名が一致しない |
| 素案準拠の `<Reveal>` を IntersectionObserver で新規実装 | **採用** | threshold 0.12, rootMargin '0px 0px -8% 0px', `transitionDelay` を ms で適用と仕様完全一致 |

#### F. News のページ構造

| アプローチ | 採否 | 理由 |
|-----------|------|------|
| 既存「一覧 → `[date]` 詳細」を維持しつつ、`[date]` に素案グリッドを展開 | 不採用 | 素案は単一ページに複数日を並列展開するデザインで、ナビゲーションの認知負荷が変わる |
| `/news` 単一ページに直近 N 日分を素案グリッドで展開、`/news/[date]` は generateStaticParams 互換のため残置（素案カードスタイル適用） | **採用** | 素案準拠＋既存 deep link 互換の両立 |

#### G. Books の Graph データ不足対応

| アプローチ | 採否 | 理由 |
|-----------|------|------|
| Graph view を実装せず List のみ | 不採用 | 素案の中核要素を落とすのは指示違反 |
| Graph view を実装、データは暫定（タグでクラスタ化／同タグ本を edge／isRead で read/queue 二値）、不足は MISSING_FEATURES.md | **採用** | 指示「不足機能を MISSING_FEATURES.md に記録」に合致 |

### 実装アプローチ

1. **基盤**: `tailwind.config.{ts,js}` のカラー全置換 → `app/globals.css` を素案 tokens.css + shell.css ベースに書き換え → `app/layout.tsx` で `<html data-theme="dark">` SSR + 先行 inline script + フォント差し替え + ThemeProvider 注入。
2. **シェル**: `ParticleBackground` / `Reveal` / `ThemeToggle` / `Header`（SiteBrand / SiteNav / MobileNav 分割）/ `Footer`（FooterClock）を新規実装。`SiteShell.tsx` を ParticleBackground + Header + main + Footer 構成に。`NAV_ITEMS` を素案順に再定義（Home 追加・Social ヘッダー除外）。
3. **ページ単位の再実装**: top → profile → skills → portfolio → portfolio/[id] → news → books → social → news/[date] の順で、各ページの View component を素案 DOM 構造に合わせて Tailwind + 素案トークンで再描画。データ取得は server pages 維持、インタラクションは client component に分離。
4. **データ層拡張**: `lib/profile.ts` の `parseSections` を構造化（career timeline / interest / certs 抽出）。`lib/skills.ts` に `getRadarAxes()` を追加。`lib/portfolio.ts` の `portfolioMarkdowns` に `portfolio-site.md` を import 復活。
5. **削除**: 旧 animations 6 ファイル、`components/footer.tsx`、`components/header/HeaderButton.tsx` を削除し、import 参照を更新。
6. **MISSING_FEATURES.md** を新規作成し、portfolio / news / books の不足項目を「該当ページ／不足機能・データ／暫定対応／推奨される追加実装」の表で記録。
7. **`bg-turquoise-*` / `terracotta` / `watercolor` 残存ゼロ確認**を実装後に grep で実施。

## 実装ガイドライン

### 参照すべき既存パターン（ファイル:行）

- **Sticky/blur ヘッダー**: `service/components/header/Header.tsx:48-110`（sticky / `backdrop-blur` / nav の Tailwind パターンを参考。ただしスクロール検知挙動は新実装で削除）
- **SiteShell の /studio バイパス**: `service/components/SiteShell.tsx:8-13`（`pathname.startsWith('/studio')` で children のみ返す現行仕様を維持）
- **Client コンポーネントで URL searchParams を扱うパターン**: `service/app/books/BooksContent.tsx:113-181`（タブ・検索・フィルタの URL 同期）。`PortfolioFilter` / `NewsTagFilter` で同パターンを採用
- **generateStaticParams パターン**: `service/app/portfolio/[id]/page.tsx:19-22`, `service/app/news/[date]/page.tsx:14-19`。Pager の前後リンクには `getProjectIds()` を流用
- **markdown セクション抽出**: `service/lib/skills.ts:101-152` の `extractListItems`、`service/lib/profile.ts:14-21` の gray-matter。`lib/profile.ts` の career timeline / interest / certs 抽出は同パターンで拡張
- **Theme 切替の hydration 対応**: 既存になし。layout.tsx 先頭に `dangerouslySetInnerHTML` で `localStorage.onclimb-theme` 読み出し inline script を注入

### 新規パラメータ追加時の波及配線

- `NAV_ITEMS` 変更（順序 `[Home, Profile, Skills, Portfolio, News, Books]`、Home href `/`、Social はフッター "Find me" カラムへ降格）:
  - `service/lib/constants.ts:12-43` の配列定義
  - Header（SiteNav, MobileNav）、Footer（Sitemap カラム）、`app/page.tsx`（Explore グリッド）に自動反映
- `Project` 型を将来拡張する場合（MISSING_FEATURES の暫定実装）:
  - `service/lib/portfolio.ts:23-51` の interface
  - `service/docs/portfolio/*.md` の frontmatter
  - `service/lib/portfolio.ts:113-154` の `parsePortfolioMarkdown`
  - `app/portfolio/[id]/page.tsx` の表示

### 注意すべきアンチパターン

- **`<html data-theme>` を client 側だけで設定**: SSR 出力との不一致で hydration warning。layout.tsx 先頭に inline script で先行設定し、その後 ThemeProvider が React state 同期する形にする。
- **Tailwind `darkMode` の二重制御**: 素案 `data-theme="dark"` と shadcn の `class="dark"` を両方扱うと崩れる → `darkMode: ['selector', '[data-theme="dark"]']` に統一。
- **ParticleBackground の resize**: `window.innerWidth` ではなく `canvas.clientWidth/Height` を使う（素案 `shell.js:143-156` 準拠）。`devicePixelRatio` は `Math.min(window.devicePixelRatio || 1, 2)` でクランプ。
- **`bg-turquoise-*` / `terracotta` / `watercolor` 残存**: トークン置換漏れで CSS 未定義になり透明扱い。**実装後に `grep -r "turquoise\|terracotta\|watercolor" service/` で残存ゼロを必ず確認**。
- **Hero spotlight の CSS 変数**: `style.setProperty('--mx', ...)` を React で扱うときは `style={{ '--mx': '50%' } as React.CSSProperties}` 形式。
- **Reveal の delay 単位**: 素案は ms。`transitionDelay = ${delay}ms`。motion 流用時の秒単位と混同しない。
- **canvas / IntersectionObserver の cleanup**: requestAnimationFrame ID と observer.disconnect() を unmount 時に必ず破棄。
- **Books Graph の座標系**: SVG viewBox は 0-100 で edges 描画、DOM ノードは `%` 配置（素案 `book.html:341-345` 準拠）。
- **`prefers-reduced-motion` 対応**: globals.css の reduced-motion クエリは素案準拠で残す。ParticleBackground / HeroSpotlight / FloatingShapes は `useReducedMotion()` で停止または非表示。
- **Server / Client 境界の漏れ**: `usePathname()` / `useSearchParams()` / `localStorage` / `IntersectionObserver` / `canvas` を使うコンポーネントは必ず `"use client"`。ページ本体は Server Component を維持。

### 利用者向け配線（到達経路）

| 機能 | 入口 | 経路 |
|------|------|------|
| Theme toggle | ヘッダー右上ボタン | `<ThemeToggle>` → ThemeProvider → `<html data-theme>` + `localStorage.onclimb-theme` |
| Profile / Skills / Portfolio / News / Books | ヘッダー nav、モバイルハンバーガー、top の Explore グリッド、フッター Sitemap | `NAV_ITEMS` 経由で自動配線 |
| Portfolio detail | `/portfolio` 各カードの "View case study" CTA | `Link href={`/portfolio/${project.id}`}`。素案ファイル名 `portfolio/onc-limb.html` ↔ 既存 id `portfolio-site` のマッピング適用（id は維持、表記揺れとして読み替え） |
| Portfolio prev/next | detail 下部 Pager | `getProjectIds()` の前後参照 |
| News detail | `/news` 単一ページ内のカード or 既存 deep link | `/news/[date]` を維持 |
| Social | フッター "Find me" カラム + `/social` 直 URL | フッター直接リンク + 既存ページ |
| Contact | top の CTA band | `mailto:contact@onc-limb.com`（素案準拠） |

新規ページは追加しない。新規ルートも追加しない（既存ルートの再実装のみ）。

### MISSING_FEATURES.md に記載する項目

| ページ | 不足機能・データ | 暫定対応 | 推奨追加実装 |
|------|----------------|---------|-------------|
| portfolio | `portfolioMarkdowns` 配列が空（`lib/portfolio.ts:109-112`） | `portfolio-site.md` を import 復活させ 1 件表示 | プロジェクト毎の md を `service/docs/portfolio/` に追加 |
| portfolio detail | 使用技術のカテゴリ別メタ（Frontend / Backend / Data / Infra・CDN / DevOps / Quality） | フラットなタグ列を素案 tech-cat スタイルで 1 グループ表示 | `Project.techCategories: { label: string; items: string[] }[]` を md frontmatter で受ける |
| portfolio detail | アーキテクチャ図 SVG の構造データ | `portfolio-site` 専用に SVG をハードコードした `ArchDiagram.tsx` | md/MDX で SVG を直接記述、または独自スキーマ（box / arrow）を定義 |
| portfolio detail | プロジェクトの `status`（In Production / Archived 等） | `period` から推定（`'present'` 含めば In Production） | `Project.status` フィールド追加 |
| news | `tags: string[]` 列が news スキーマに無い | UI のみ実装、フィルタは UX dead | `news.tags` 列追加 + crawler でタグ付け |
| news | ticker 用のトレンドカウント（"+12" 等） | UI 表示のみ（カウントは固定値・空） | source / tag 別の前日比集計 |
| news | ncard variant（feat / mono）判定基準 | feat = 各日先頭、mono = source が GitHub Trending 系 | `news.featured: boolean` 列追加 |
| books | `status: reading` を区別不能（`isRead: boolean` のみ） | reading は表示せず、isRead=true → read / false → queue | `books.readingStatus: 'read'\|'reading'\|'queue'` 列追加 |
| books | 本同士の `related` 関連付けが無い | 同タグ本を edge で接続 | `book_relations` テーブル追加 |
| books | cluster（Architecture / Low-level / Web / Craft）のメタが無い | 既存タグの上位 4 件をクラスタ化 | `books.cluster` 列または `tags.cluster` フィールド |

### 確認方法

- `pnpm --dir service build` で型チェック + ビルド成功
- `pnpm --dir service lint` でリント通過
- `pnpm --dir service dev` で各ページ目視確認、テーマ切替（dark/light）動作確認
- `grep -r "turquoise\|terracotta\|watercolor" service/` で旧テーマ残存ゼロを確認

## スコープ外

| 項目 | 除外理由 |
|------|---------|
| 素案 `index.html`（デザインプレビュー目次） | タスク指示「素案にあって既存サイトに無いページ → 無視」。index.html は素案集の目次でありプロダクト機能ではない |
| `/studio/*` の素案適用 | 認証必須の管理画面、`SiteShell` バイパス済みで素案 shell の対象外。指示書の「全ページに素案デザインを適用」は公開ページが対象 |
| `service/app/api/*` の変更 | スタイル適用対象外、データ層 |
| `tailwind.config.{ts,js}` の二重 config 解消（一本化） | 既存の構造的問題だがリファクタリング扱い。今回は両方を素案トークンに更新するに留める |
| portfolio / news / books のスキーマ拡張（status / tags / related / cluster 等） | 「不足機能のメモ作成」のスコープ。実装はせず MISSING_FEATURES.md に記載 |
| News crawler 側のタグ付与・要約改修 | スコープ外（crawler はリポジトリ内別領域） |
| Books の本同士関連付けデータ整備 | データ整備はスコープ外 |
| `components/ui/*` shadcn コンポーネントの個別書き換え | CSS 変数経由で自動的にダーク青系へ追従するため、原則として個別変更不要 |
| 後方互換コード（旧 turquoise クラスのエイリアス等） | 明示要求なし。CLAUDE.md「後方互換コードは計画に含めない」 |

### デザイン参照で除外した要素

- **素案 `index.html`（デザインプレビュー一覧）**: 既存サイトに対応ページなし、新規追加もしない。除外理由：タスク指示書「素案にあって既存サイトに無いページ → 無視」。代替実装も採らない理由：このファイルは素案カタログの目次であり、プロダクトとしての機能性を持たないため。
- **既存 portfolio detail の「課題と解決策」「成果・学び」「今後の展望」セクション**: 素案優先で画面から非表示にする。除外理由：素案 portfolio detail は背景／使用技術／構成図／工夫の 4 セクション構成で、これらに該当する位置がない。代替表示（折りたたみ等）を採らない理由：素案の構成意図（4 セクションで完結）を歪めるため。型 `Project.detail.challenges/results/futureWork` 自体は維持し、将来素案にない情報を別ページで使う余地を残す。
- **既存 skill の experience / knowledge / relatedBooks**: 素案優先で画面から非表示。除外理由：素案 skill ページは radar + bar + chips のみで、長文情報が表示できない。代替表示を採らない理由：素案の情報密度（一目で全体像）を破壊するため。markdown データ自体は残すので、後の再表示も可能。
- **既存ヘッダーのスクロール検知でモバイル隠す挙動 (`Header.tsx:18-47`)**: 素案優先で削除。除外理由：素案にこの挙動が定義されておらず、`is-open` 開閉のみ。代替実装を採らない理由：素案優先方針（破壊的変更だが指示書「競合時は素案を採用」に従う）。
- **素案 `top.html` の「scroll hint」を `/profile` 等の他ページにも展開**: しない。除外理由：素案では top 専用要素として位置づけられている（他ページには配置されていない）。
- **素案 portfolio detail で `Live demo` / `GitHub` 以外の「Article」「Notes」等のリンク**: 素案にないため追加しない。既存 `Project.links.article` データ型は維持するが、detail-hero CTA には素案準拠の 2 ボタン（demo + github）のみ表示。

## 確認事項

なし。タスク指示書 Open Questions の 2 点はいずれもコード調査で結論を出した：

1. **既存サイトのフレームワーク・スタイル方式** → Next.js 15 App Router + Tailwind v3（`tailwind.config.ts`/`tailwind.config.js` の二重 config、`tailwind.config.ts` がアクティブ・`tailwind.config.js` は `components.json:7` 経由の shadcn 互換用）+ 水彩 HSL ライト固定テーマ。
2. **shell.js のクライアント挙動の差分** → 素案優先方針で上書き。破壊的変更箇所として「水彩→青系ダーク既定の全面色変更」「ヘッダーのスクロール検知 mobile 隠し挙動の削除」「`GeometricBackground` の差し替え」を本計画に明記済み。