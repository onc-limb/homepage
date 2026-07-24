# 背景実装 特定調査レポート (background audit)

対象リポジトリ: onc-limb/homepage (`service/` = Next.js 15 App Router)
作成日: 2026-07-24 / 最終更新: 2026-07-25（`theme-solid-background-tokens` タスクで単色背景トークンを既存テーマ機構へ集約定義・§(i) を追記）
ステータス: **背景コンポーネント削除タスク（constellation-background-removal）実行時にソースツリーへアクセスでき、下記 §(c-1)/§(d-4)/§(b-1)/§(a) の未確定項目を実確認して確定・追記した。その後の手動介入（§(h)）で `service/components/animations/ParticleBackground.tsx` をリポジトリからファイルごと削除し、あわせて barrel `service/components/animations/index.ts` の再エクスポートと `service/components/SiteShell.tsx` の import・マウント（唯一の実参照）を除去した。パーティクル背景はいずれのページでもレンダリングされない。さらに `theme-solid-background-tokens` タスクで単色背景トークン（`--surface-solid` / `--surface-solid-strong`）を `app/globals.css` の CSS 変数（両テーマ）と Tailwind 設定へ集約定義した（§(i)）。**

> このドキュメントは後続サブタスク（星座風パーティクル背景の削除／グラデーション廃止・単色化）への
> 唯一の受け渡し手段である。したがって「実際に確認できた事実」と「確認できていない事項」を取り違えないことが最優先である。
> 本 audit 作成タスク自体のスコープは「特定調査 + SiteBrand の独立性固定 + 維持対象アニメーションの分離判定」であったが、
> その後の削除タスク（constellation-background-removal）でソースツリーへアクセスできたため、
> §(g) G1〜G8 の一部を実行し、結果を各セクションへ追記した（実施箇所には「✅ 削除タスクで確定」を付す）。

---

## 0. 一次情報と確度の凡例（重要・前版からの訂正）

**前版は `service/components/animations/` 配下のファイル群・`service/package.json`・`service/app/globals.css`・
ロックファイル・Tailwind config 等を「リポジトリのファイル一覧（file listing）」を根拠に『インベントリ確定 🅘』と
記載していた。しかし audit 作成タスクの実行環境で実際にアクセスできたソースは次の 3 点のみだった:**

- `service/components/header/SiteBrand.tsx`（全文）
- `service/components/header/__tests__/SiteBrand.independence.test.ts`（全文、audit 作成タスクで新設）
- 本 audit doc 自身

すなわち audit 作成タスクでは `service/components/animations/**`・`service/package.json`・`service/app/globals.css`・各ロックファイル・
`service/tailwind.config.*` などを **開けていなかった**。その後の削除タスク（constellation-background-removal）では
`service/package.json`・`service/pnpm-lock.yaml`・`service/components/animations/ParticleBackground.tsx` にアクセスでき、
本版でそれらの実確認結果を追記した。ソースツリーへのアクセスを前提に確定した項目には「✅ 削除タスクで確定」を付す。

| 記号 | 意味 |
| --- | --- |
| ✅ 本文確認済み | 実際に全文を読んだファイルから直接確認した事実。訂正の対象外 |
| ✅ 削除タスクで確定 | constellation-background-removal タスクがソースツリーへアクセスして実確認・追記した事実 |
| ✅ トークン定義タスクで確定 | theme-solid-background-tokens タスクが `app/globals.css` / `tailwind.config.*` を実確認・編集して確定した事実 |
| 🅘 前版推定（未確認） | 名称・配置・barrel 構成から推定した事項。該当ソースを未確認なら **候補**として扱う |
| 🔎 要確認 | 削除・単色化・分離に着手する前に、ソースツリーへアクセスできるタスクがコマンドを実行して確定する事項 |

> 補足: 前版は「packageManager 宣言」「ディレクトリ命名」を根拠に (a)(c)(d) を確定扱いにしていたが、
> 宣言は物理ファイルの存在・実パスを保証せず、命名はファイル本文（canvas/rAF/共有ロジックの有無）を保証しない。
> 本版はこの 2 種の推定を確定から外し、削除タスクの実確認で裏づけの取れた範囲を「✅ 削除タスクで確定」として追記した。

---

## (a) パーティクル背景を構成するファイルの実パス一覧

### a-1. `service/components/animations/` の候補ファイル群

| 候補パス | 名称からの推定役割 | 削除 / 維持 | 確度 |
| --- | --- | --- | --- |
| `service/components/animations/ParticleBackground.tsx` | 星座風パーティクル背景の本体 | **本タスクでファイルごと削除** | ✅ 削除タスクで確定 |
| `service/components/animations/HeroParticleTitle.tsx` | サイトタイトルの流動アニメーションの実体か（(f-2) 参照） | 維持候補 | 🅘 / 🔎 本タスクの snapshot では未surfacing |
| `service/components/animations/HeroSpotlight.tsx` | 装飾スポットライト演出（想定） | 削除候補 | 🅘 / 🔎 未surfacing |
| `service/components/animations/FloatingShapes.tsx` | 浮遊シェイプの装飾演出（想定） | 削除候補 | 🅘 / 🔎 未surfacing |
| `service/components/animations/Reveal.tsx` | スクロール表示演出ユーティリティ（背景専用でない可能性） | 維持候補 | 🅘 / 🔎 未surfacing |
| `service/components/animations/index.ts` | barrel export | **実在する**（前版の「実在せず」は snapshot 不足による誤認）。`ParticleBackground` の再エクスポート行は手動介入（§(h)）で除去済み。他の export（Reveal / FloatingShapes / HeroSpotlight / HeroParticleTitle）は維持 | ✅ 手動介入で確定 |

> **確定結果（✅ 手動介入 §(h) で最終確定）**: 自動タスクの実行環境（sentinel 経由）は書き込み専用でファイル削除が
> できず、`ParticleBackground.tsx` は canvas 描画コード・粒子生成ロジック・requestAnimationFrame ループを撤去した
> `return null` の no-op スタブとして残っていた。また前版の「barrel（`index.ts`）はソースツリーに存在しない」
> 「`ParticleBackground` を import している箇所は無い」という記述は snapshot 不足による**誤認**で、実際には
> barrel `service/components/animations/index.ts` が再エクスポートし、`service/components/SiteShell.tsx` が
> import してマウントしていた（実参照はこの 1 箇所のみ）。手動介入で `ParticleBackground.tsx` をファイルごと削除し、
> barrel の再エクスポート行と `SiteShell.tsx` の import・マウントを除去した。その結果、モジュール
> `ParticleBackground` はリポジトリから失われ、パーティクル背景はいずれのページでもレンダリングされない。
> 上表の他候補（HeroParticleTitle / HeroSpotlight / FloatingShapes / Reveal）はいずれも実在し（手動確認）、
> 本タスクでは変更していない（削除可否は後続タスクの判断に委ねる）。

### a-2. マウント箇所 ✅ 手動介入で確定

`service/app/layout.tsx` には `ParticleBackground` への参照は無い（✅ 本文確認済み）。
実際のマウント箇所は `service/components/SiteShell.tsx`（import + `<ParticleBackground />` の描画）で、
これが唯一の実参照だった（前版の「参照 0 件」は snapshot 不足による誤認）。手動介入（§(h)）で
呼び出し箇所を除去してから本体を削除した（§(g) G2 の手順どおり）。import 破綻は生じない
（tsc / テストで確認済み）。

### a-3. 関連 CSS 🔎 要確認

- `service/components/` 配下の `*.module.css` の有無、`animations/` 配下の付随 CSS の有無は本タスクでは未surfacing。
- グローバル CSS の候補は `service/app/globals.css`（単色背景トークンの定義先候補、(e-3)）だが、本文は未確認。

参考（`service/` 外・デザイン素案。アプリ本体ではないので **削除対象外**、実在は未確認）:
`docs/design/shared/tokens.css` / `docs/design/shared/shell.css` / `docs/design/shared/shell.js`

### a-4. 関連テスト

- audit 作成タスクで新設したテスト（全文確認済み）:
  `service/components/header/__tests__/SiteBrand.independence.test.ts` ✅
- `service/components/animations/` 配下のテストは本タスクの snapshot には現れず、`__tests__/` にも colocated
  （`*.test.tsx`）にも `ParticleBackground` 専用テストは surfacing しなかった → **削除対象のパーティクル背景専用テストは確認されず、削除は不要**（✅ 削除タスクで確定・当該環境の範囲において）。

---

## (b) パーティクル背景専用の外部依存パッケージ

### b-1. 結論: **なし**（✅ 削除タスクで確定）

削除タスクで `service/package.json` を実確認した結果、以下の particles 系・canvas 描画エンジン系はいずれも存在しなかった:

- `tsparticles` / `@tsparticles/*` / `tsparticles-slim` / `tsparticles-engine`
- `react-particles` / `react-tsparticles` / `react-particles-js`
- `particles.js` / `particlesjs`
- `three` / `@react-three/fiber`
- `p5` / `pixi.js`

→ パーティクル背景は **自作実装**（外部パーティクルライブラリ非使用）であり、
受け入れ条件の「専用外部ライブラリを使用していた場合に限り package.json / ロックファイルから削除」の条件に該当しない。
したがって **依存関係の変更（package.json / pnpm-lock.yaml の編集）は不要**（✅ 削除タスクで確定）。

### b-2. 実装方式（canvas + rAF か CSS/SVG か）✅

削除前の `ParticleBackground.tsx` はすでに canvas 描画コード・粒子生成ロジック・`requestAnimationFrame` ループ・
テーマ追従・マウス反応が撤去され `return null` の no-op となっていた（前段タスクの暫定対応）。元実装は canvas + rAF ベースの
自作実装であった旨がファイル内コメントに記録されていた。この no-op スタブを含む `ParticleBackground.tsx`
ファイル自体は手動介入（§(h)）でリポジトリから削除した（モジュール `ParticleBackground` はリポジトリから失われ、パーティクル背景はレンダリングされない）。

### b-3. 受け入れ条件への含意

b-1 が確定したため **依存関係の変更は不要**。particles 系依存は存在しないため package.json / pnpm-lock.yaml の更新は行わない。

### b-4. 参考: 隣接の汎用アニメーション依存（見つかっても削除してはならない）✅ 削除タスクで確認

| パッケージ | `service/package.json` の記載 | 備考 |
| --- | --- | --- |
| `motion` | `^12.23.26` | 汎用アニメーションライブラリ。背景以外でも使われうるため **削除禁止**（本タスクでも未変更） |
| `tailwindcss-animate` | `^1.0.7` | Tailwind のアニメーションユーティリティ。shadcn/ui 系が依存するため **削除禁止**（本タスクでも未変更） |

---

## (c) パッケージマネージャとロックファイル

| 項目 | 値 | 確度 |
| --- | --- | --- |
| パッケージマネージャ（宣言） | `service/package.json` の `"packageManager": "pnpm@9.15.0"` | ✅ 削除タスクで確定 |
| ロックファイル形式 | `pnpm-lock.yaml`（`lockfileVersion: '9.0'`） | ✅ 削除タスクで確定 |
| ロックファイルの実パス | `service/pnpm-lock.yaml`（`service/` 直下に実在。ルート直下ではない） | ✅ 削除タスクで確定 |

> 依存変更は不要（b-1）のため、ロックファイルの再生成は行っていない。もし将来 particles 系依存を削除する場合は、
> `service/` で `pnpm install`（`pnpm-lock.yaml` を更新）を実行すること。

### c-1. ロックファイル探索結果（✅ 削除タスクで確定）

| 探索したパターン | ヒットした実パス（存在すれば） |
| --- | --- |
| `pnpm-lock.yaml` | `service/pnpm-lock.yaml`（実在） |
| `package-lock.json` | （なし） |
| `yarn.lock` | （なし） |
| `bun.lockb` / `bun.lock` | （なし） |

検証コマンド（すべて `service/` で実行、パッケージマネージャは pnpm）:

```sh
pnpm install --frozen-lockfile   # 依存導入（本タスクでは依存変更なしのため lockfile 不変）
pnpm run test                    # vitest run
pnpm run lint                    # next lint
pnpm exec tsc --noEmit           # 型チェック
pnpm run build                   # 全ページのビルド確認
```

---

## (d) グラデーション使用箇所

### d-1. 本文確認できた範囲の結果 ✅ 本文確認済み

| 実パス | 結果 | 確度 |
| --- | --- | --- |
| `service/components/header/SiteBrand.tsx` | グラデーション **0 件**。使用色は `text-fg-muted` / `text-fg-strong` / `text-accent` の単色トークンのみ | ✅ 本文確認済み |
| `service/components/header/__tests__/SiteBrand.independence.test.ts` | `linear-gradient` / `radial-gradient` / `conic-gradient` / `bg-gradient-` の文字列が**検出ロジックのトークン定義・仮想 FS のフィクスチャ**として出現するのみ。実スタイルとしての使用は 0 件 | ✅ 本文確認済み |
| `service/components/animations/ParticleBackground.tsx` | 削除前は `return null` の no-op で **グラデーション 0 件**。本タスクでファイルごと削除済み | ✅ 削除タスクで確定 |

`SiteBrand.independence.test.ts` は SiteBrand のモジュールグラフ全体に対して上記トークンの不在を契約化しており、
SiteBrand 経路のグラデーション 0 件は回帰込みで固定されている。

### d-2. グラデーションが存在しうる高確度の候補（🅘 前版推定・本文未確認）

親 issue が「背景・セクションにグラデーションが多用されている」と明記しているため、
グラデーション廃止・単色化タスク（gradient-abolition-solid-background）が **最優先で本文 grep する対象**（未確認の候補）:

| 候補パス | 理由 |
| --- | --- |
| `service/app/globals.css` | 全体背景・`body`/`:root` のグラデーション定義候補 |
| 各ページ/セクション（`service/app/**`, `service/components/**`） | `bg-gradient-*` / `from-*`/`via-*`/`to-*` の Tailwind クラス |

> 背景アニメーション削除タスク（本タスク）のスコープはコンポーネント・CSS・テスト・依存の削除であり、
> グラデーションの単色化は後続 `gradient-abolition-solid-background` に委譲する。d-2 の全数 grep は後続で実施する。

> 補足（theme-solid-background-tokens で確認）: `service/app/globals.css` 本文には背景・セクション装飾としての
> `linear-gradient`/`radial-gradient` は無い。`linear-gradient` の出現は `.grid-bg`（グリッド線パターン）と
> `.scroll-hint::after`（スクロールヒントの線）の 2 箇所のみで、いずれも背景・セクションの面塗り装飾ではない。
> `.card-surface` は `var(--surface)`（半透明単色）+ `backdrop-filter: blur()` でありグラデーションではない。
> 後続タスクの単色化ではこれらを §(i) の単色トークンで置換する（面塗りが必要な箇所は `--surface-solid` 系へ）。

### d-3. 全数 grep（§(g) G5・グラデーション廃止タスクが実行し d-4 へ貼る）

```sh
# service/ で実行。docs/design 配下（デザイン素案）はアプリ本体ではないので対象外
grep -rn -E "bg-gradient-|linear-gradient|radial-gradient|conic-gradient" \
  app components lib tailwind.config.js tailwind.config.ts \
  --include='*.ts' --include='*.tsx' --include='*.css' --include='*.mdx'

# Tailwind のカラーストップ（from-/via-/to-）。任意色記法 from-[#...] も広めに拾う
grep -rn -E "(^|[\"'\` ])(from|via|to)-(\[|[a-z])" \
  app components lib \
  --include='*.ts' --include='*.tsx' --include='*.css' --include='*.mdx'
```

### d-4. grep 実行結果

各ヒットについて次の 3 列で判定を残す:

| 実パス:行 | 該当文字列 | 判定（背景/セクション装飾か・置換先の単色トークン） |
| --- | --- | --- |
| `service/components/header/SiteBrand.tsx` | （ヒットなし） | グラデーション 0 件（✅ 本タスク確認済み） |
| `service/components/header/__tests__/SiteBrand.independence.test.ts` | `linear-gradient` 等のトークン定義・フィクスチャ | 検出ロジック・除外（装飾ではない、✅ 本タスク確認済み） |
| `service/components/animations/ParticleBackground.tsx` | （ファイル削除済み。削除前も 0 件） | 対象コンポーネント削除（✅ 削除タスク確定） |
| `service/app/globals.css` `.grid-bg` | `linear-gradient(... 1px, transparent 1px)` | グリッド線パターン（面塗り装飾ではない・除外候補、判断は後続タスク） |
| `service/app/globals.css` `.scroll-hint::after` | `linear-gradient(180deg, var(--fg-dim), transparent)` | スクロールヒントの線（背景・セクション装飾ではない） |

> 上表は本タスク／トークン定義タスクの snapshot で本文確認できた範囲。`service/app/**` を含む全数 grep は
> グラデーション廃止タスク（gradient-abolition-solid-background）が d-3 のコマンドで実行して残りを埋める。

### d-5. 受け入れ条件への含意

`docs/design/` 配下（`shared/tokens.css` / `shared/shell.css` / `shared/shell.js` / 各種 `*.html`）は
**デザイン素案でありアプリケーションコードではない**。受け入れ条件の対象は
「`service/` 配下のアプリケーションコード」であるため、`docs/design/` のグラデーションは対象外。判断根拠は PR に残すこと。

---

## (e) 既存テーマ機構の所在

> 以下は前版が推定した所在であり、背景削除タスクでは `service/lib/**`・`service/app/globals.css`・
> `service/tailwind.config.*` を開けていなかった。`theme-solid-background-tokens` タスクで
> `service/app/globals.css` と `service/tailwind.config.ts` / `service/tailwind.config.js` を実確認・編集して
> §(e-2)/§(e-3)/§(e-4) の一部を確定した（実確認箇所には「✅ トークン定義タスクで確定」を付す）。

### e-1. テーマモジュール（🅘 前版推定・本文未確認 / 一部 ✅）

| 候補パス | 内容（推定） |
| --- | --- |
| `service/lib/theme.ts` | テーマ定義の実体（**単一ファイル**。`lib/theme/` ディレクトリではない）。`THEME_STORAGE_KEY`（`"onclimb-theme"`）/ `DEFAULT_THEME`（`"dark"`）/ `THEMES`（`dark` \| `light`）/ `isTheme()` を export。**ここに色は持たない**（色は CSS 変数 + Tailwind 側）✅ トークン定義タスクで確定（`service/lib/__tests__/theme.test.ts` 経由） |
| `service/lib/__tests__/theme.test.ts` | テーマ契約テスト（`THEME_STORAGE_KEY` / `DEFAULT_THEME` / `THEMES` / `isTheme()`） |
| `service/components/theme/ThemeProvider.tsx` | `<html data-theme="...">` を駆動する Provider（`service/app/layout.tsx` の `import { ThemeProvider, themeBootScript } from "@/components/theme"` で参照。✅ layout 本文確認） |
| `service/components/theme/ThemeToggle.tsx` | ライト/ダーク切替 UI |
| `service/components/theme/index.ts` | barrel export（layout の `@/components/theme` からの解決先。✅ 参照確認） |

### e-2. Tailwind 設定・PostCSS ✅ トークン定義タスクで確定

| 候補パス | 状態 |
| --- | --- |
| `service/tailwind.config.ts` | **実在**。`theme.extend.colors` に CSS 変数エイリアス（`bg` / `bg-elev` / `surface` 等）を定義。単色背景トークン `surface-solid` / `surface-solid-strong` を追記済み ✅ |
| `service/tailwind.config.js` | **実在**（`.ts` とほぼ同一のミラー）。同じ 2 トークンを追記済み ✅ |
| `service/postcss.config.js` | **実在**（`postcss.config.mjs` は無い）。本タスクでは未変更 ✅ |
| `service/components.json` | 🅘 推定（shadcn/ui 設定） |

### e-3. CSS 変数定義 ✅ トークン定義タスクで確定

| 実パス | 備考 |
| --- | --- |
| `service/app/globals.css` | `:root`（共通 + `:root[data-theme="dark"]`）/ `:root[data-theme="light"]` の CSS 変数定義先。`--bg` / `--bg-elev` / `--bg-elev-2`（単色）、`--surface` / `--surface-strong`（半透明）を既存定義。**本タスクで両テーマに `--surface-solid` / `--surface-solid-strong`（単色・不透明）を追記**（§(i)）。`service/app/layout.tsx` が `import "./globals.css"` で読み込む（✅ 参照確認） |

### e-4. 稼働中のカラートークン名 ✅

| 事実 | 確度 |
| --- | --- |
| `SiteBrand.tsx` が `text-fg-muted` / `text-fg-strong` / `text-accent` クラスを使用 | ✅ 本文確認済み |
| `service/app/layout.tsx` が `data-theme="dark"` を初期値とし `ThemeProvider` / `themeBootScript` を使用 | ✅ 本文確認済み |
| Tailwind の `theme.extend.colors` に `bg` / `bg-elev` / `bg-elev-2` / `surface` / `surface-strong` / `fg.*` / `accent` 等を CSS 変数エイリアスとして定義 | ✅ トークン定義タスクで確定 |
| `theme.extend.colors` に `surface-solid` / `surface-solid-strong` を追記（`bg-surface-solid` 等で参照可能） | ✅ トークン定義タスクで確定（§(i)） |

**単色化の実装方針（グラデーション廃止タスクへの推奨）**:
新しい背景色をコンポーネントにハードコードせず、`globals.css` の CSS 変数
（`[data-theme="dark"]` / `[data-theme="light"]` の両方）に定義し、Tailwind config でトークン化して
`bg-*` クラス経由で参照する。**本タスクで単色背景トークンは §(i) の通り定義済み**なので、後続タスクは
新しい色を足さず §(i) の対応表に従って既存クラス/新トークンへ置換すること。

---

## (f) 背景実装との共有ロジックの有無（分離判定）

### f-1. `SiteBrand.tsx` と背景実装の共有: **共有なし** ✅ 本文確認済み

`service/components/header/SiteBrand.tsx` の全文確認結果:

- import は `react` / `next/image` / `next/link` の 3 つのみ。背景実装からの import は無い。
- `canvas` 要素・`getContext`・`requestAnimationFrame` を使用していない。
- `motion` 等のアニメーションライブラリも使用していない。
- 出力は `<Link>` + `<Image>` + テキスト 3 スパンのみ（静的なヘッダーロゴ + パンくず表記）。

→ `SiteBrand.tsx` および周辺（`Header` / `SiteNav` / `MobileNav` 等）へのコード変更は不要で、本タスクでも行っていない。

### f-2. 維持対象の「サイトタイトルの流動アニメーション」の実体と共有判定

- **確定していること（✅）**: 親 issue が実体と推測した `SiteBrand.tsx` は静的で、アニメーションを持たない（f-1）。
- **削除タスクでの確認（✅）**: 削除前の `ParticleBackground.tsx` は no-op（canvas ロジック撤去済み）であり、
  他モジュールへ export する共有ユーティリティ（canvas ヘルパ / 粒子生成 / 型・定数）を持っていなかった。
  よってファイル削除によって共有ロジックが失われる維持対象は無く、タイトルアニメーションへの影響は無い。
- **保守的方針（🔎 後続で確定）**: `HeroParticleTitle.tsx` 等のタイトル流動アニメーション実体は本タスクの snapshot に
  現れなかった。もし後続で当該ファイルが surfacing した場合は本文で実装・共有有無を確認すること。

### f-3. 追加した回帰テスト（audit 作成タスク）

`service/components/header/__tests__/SiteBrand.independence.test.ts` により、
`SiteBrand.tsx` の **モジュールグラフ全体**が背景実装（背景モジュール / canvas 描画プリミティブ / グラデーション /
パーティクル描画パッケージ）に依存しないことを契約として固定している。

---

## (g) 後続サブタスクへの受け渡しサマリ

### g-1. 確定している事項

1. `SiteBrand.tsx` は背景実装に依存せず、グラデーションも使用していない（✅）。`SiteBrand.independence.test.ts` で回帰込みで固定済み。
2. 親 issue が維持対象アニメーションの実体と推測した `SiteBrand` は**静的**である（✅ f-1）。
3. ロックファイルは `service/pnpm-lock.yaml`（pnpm）で確定（✅ 削除タスク c-1）。
4. パーティクル背景専用の外部依存は無し（自作実装）。依存関係の変更は不要（✅ 削除タスク b-1）。
5. `ParticleBackground.tsx`（no-op スタブ）は削除タスクでリポジトリからファイルごと削除済み（✅）。モジュール `ParticleBackground` はリポジトリから失われ、パーティクル背景はいずれのページでもレンダリングされない。
6. 単色背景トークン（`--surface-solid` / `--surface-solid-strong`）を両テーマに定義し Tailwind へマッピング済み（✅ トークン定義タスク・§(i)）。ページ/セクション層は既存の単色 `--bg` / `--bg-elev` / `--bg-elev-2` を継続利用する。

### g-2. 未確定・後続タスクが確定する事項（🔎）

| # | 事項 | 追記先 | 状態 |
| --- | --- | --- | --- |
| G1 | `animations/` の全ファイルの本文と役割 | (a-1) | 部分確定（ParticleBackground.tsx のみ surfacing・ファイル削除済み） |
| G2 | 背景のマウント箇所（実パス:行） | (a-2) | ✅ 確定（`SiteShell.tsx`・手動介入で除去） |
| G3 | 実装方式（canvas + rAF か） | (b-2) | ✅ 確定（canvas + rAF の自作実装） |
| G4 | ロックファイルの実在・実パス | (c-1) | ✅ 確定（`service/pnpm-lock.yaml`） |
| G5 | グラデーション使用箇所の全数 grep | (d-4) | 後続 gradient-abolition-solid-background が実行（globals.css は §(d-2) 補足で確認済み） |
| G6 | テーマ機構・Tailwind config・CSS 変数名 | (e-1〜e-4) | ✅ 確定（theme-solid-background-tokens・§(i)） |
| G7 | 維持対象アニメーションの実体特定 → 共有分離 | (f-2) | 共有なしを確認（背景削除タスク範囲） |
| G8 | パーティクル/canvas 系外部依存の有無 | (b-1) | ✅ 確定（依存なし） |

### g-3. コミット分割

- `refactor: remove constellation background animation`（削除タスク）
- `refactor: define solid background tokens in theme`（本タスク・単色化側の一部）
- `refactor: replace gradients with solid theme colors`（後続 gradient-abolition-solid-background）

---

## (h) 手動介入の記録（2026-07-25）

自動タスクの書き込み経路（sentinel）は check / write / inventory のみでファイル削除ができず、
自動ループは `ParticleBackground.tsx` を no-op スタブ化するところまでしか到達できなかった
（レビューは「完全削除」の受け入れ条件未達として正しく reject）。このデッドロックを解消するため、
人間側の介入として以下を実施した:

1. `service/components/animations/ParticleBackground.tsx` を `git rm` でリポジトリから削除。
2. barrel `service/components/animations/index.ts` から `ParticleBackground` の再エクスポート行を除去
   （他の export は維持）。
3. 唯一の実参照だった `service/components/SiteShell.tsx` の import と `<ParticleBackground />` マウントを除去。
4. 本ドキュメント内の snapshot 不足による誤認（「barrel は実在しない」「参照 0 件」）を実態に合わせて訂正。

`SiteBrand.independence.test.ts` 内の `ParticleBackground` への言及はすべて文字列フィクスチャ
（テストデータ）であり、実モジュールへの import ではないため削除の影響を受けない。

---

## (i) 単色背景トークンの定義と用途（theme-solid-background-tokens タスクで追記・2026-07-25）

グラデーション廃止・単色化（gradient-abolition-solid-background）が「場当たりな色」を足さずに済むよう、
背景の面塗りに使う単色トークンを **既存テーマ機構（`app/globals.css` の CSS 変数 + `tailwind.config.*` の
`theme.extend.colors`）へ集約定義**した。新しい色管理の仕組みは導入していない（既存の
`--bg` 系トークン + Tailwind エイリアスの延長線上）。

### i-1. ベースカラーの選定

既存テーマカラーからの選定（オーナー委任済み）。落ち着いた単色として、既存のページ背景系
（ダーク = 深いネイビー `#0a1020`、ライト = ほぼ白 `#f2f5fb`）と、その elevation 段階
（`--bg-elev` / `--bg-elev-2`）を**そのままベース**に採用する。アクセント青（`--accent`）は
面塗りには使わない（テキスト/線/ボタン用に温存）。

### i-2. 層とトークンの対応（後続の単色化はこの表に従って置換する）

| 層（用途） | 使うトークン（Tailwind クラス） | ダーク値 | ライト値 |
| --- | --- | --- | --- |
| ページ全体の背景（`body` / ページ最外郭） | `--bg`（`bg-bg` / `bg-background`） | `#0a1020` | `#f2f5fb` |
| セクション背景（区切り/一段持ち上げ） | `--bg-elev`（`bg-bg-elev`） | `#0f1830` | `#ffffff` |
| セクション背景（さらに一段） | `--bg-elev-2`（`bg-bg-elev-2`） | `#141f3d` | `#f7f9fe` |
| カード / サーフェス（単色・不透明） | `--surface-solid`（`bg-surface-solid`） | `#141f3d` | `#ffffff` |
| 強調カード / パネル（単色・不透明） | `--surface-solid-strong`（`bg-surface-solid-strong`） | `#1e2c4e` | `#ffffff` |

補足:

- ページ/セクション層は**既存の単色トークンをそのまま**使う（新規追加なし）。
- カード/サーフェス層のみ、既存 `--surface` / `--surface-strong` が**半透明（rgba）+ backdrop blur 前提**で
  単色化に直接使えないため、その**不透明版**として `--surface-solid` / `--surface-solid-strong` を新設した。
  `--surface`（`--surface-solid` の元 rgb は `rgba(20, 31, 61, ...)` = `#141f3d`）と一致させ、
  ダークの強調版はワンステップ明るい `#1e2c4e` にして重なりの視認性を確保した。ライトは面が白で十分に立つため
  両者とも `#ffffff`。
- 既存の `--surface` / `--surface-strong`（半透明）や `.card-surface`（backdrop blur）は削除していない。
  ガラス調をやめて面を単色で塗りたい箇所で `--surface-solid` 系に差し替える、という置換の受け皿である。

### i-3. テーマ切り替え機構への載り方

- 値は `app/globals.css` の `:root[data-theme="dark"]`（= `:root` 既定）と `:root[data-theme="light"]` の
  両ブロックに定義してあり、`ThemeProvider` が切り替える `<html data-theme="...">` にそのまま追従する。
  トークン名はテーマ間で同一なので、参照側（`bg-surface-solid` 等）は分岐不要。
- Tailwind 側は `--surface-solid` → `surface-solid`、`--surface-solid-strong` → `surface-solid-strong` を
  `tailwind.config.ts` と `tailwind.config.js` の両方に追加（2 ファイルはミラー関係のため同期）。

### i-4. WCAG AA コントラスト確認（本文 `--fg` との組み合わせ）

本文テキスト色 `--fg`（ダーク `#e6ecfb` / ライト `#0f1830`）に対する各単色背景トークンのコントラスト比
（WCAG 2.2、通常サイズ本文の AA しきい値 = 4.5:1）。いずれも AA を大きく上回り、AAA（7:1）も満たす:

| 背景トークン | ダーク（vs `#e6ecfb`） | ライト（vs `#0f1830`） |
| --- | --- | --- |
| `--bg` | ≈ 16.0:1 | ≈ 16.1:1 |
| `--bg-elev` | ≈ 14.9:1 | ≈ 17.6:1 |
| `--bg-elev-2` | ≈ 13.7:1 | ≈ 15.6:1 |
| `--surface-solid` | ≈ 13.7:1 | ≈ 17.6:1 |
| `--surface-solid-strong` | ≈ 11.6:1 | ≈ 17.6:1 |

この検証は `service/lib/__tests__/background-tokens.test.ts` で自動化しており、`app/globals.css` を実読み込みして
各トークンが両テーマで不透明 hex として定義されていること・`--fg` とのコントラストが 4.5:1 以上であること・
Tailwind 両 config にマッピングされていることを契約として固定している（回帰で崩れれば検知できる）。

---

## 参考情報(出典・取得日)

- WCAG 2.2 達成基準 2.2.2「一時停止、停止、非表示」（レベル A）
  https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html （取得日 2026-07-23）
- WCAG 2.2 達成基準 1.4.3「コントラスト（最低限）」（レベル AA・通常テキスト 4.5:1）
  https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html （取得日 2026-07-25）
- prefers-reduced-motion（MDN）
  https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion （取得日 2026-07-23）
- requestAnimationFrame（MDN）
  https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame （取得日 2026-07-23）
- Conventional Commits 1.0.0
  https://www.conventionalcommits.org/en/v1.0.0/ （取得日 2026-07-23）
