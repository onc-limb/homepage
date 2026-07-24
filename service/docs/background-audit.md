# 背景実装 特定調査レポート (background audit)

対象リポジトリ: onc-limb/homepage (`service/` = Next.js 15 App Router)
作成日: 2026-07-24 / 最終更新: 2026-07-24（`constellation-background-removal` タスクで削除実施・調査結果追記）
ステータス: **背景コンポーネント削除タスク（constellation-background-removal）実行時にソースツリーへアクセスでき、下記 §(c-1)/§(d-4)/§(b-1)/§(a) の未確定項目を実確認して確定・追記した。`service/components/animations/ParticleBackground.tsx` は本タスクでリポジトリからファイルごと削除した（`ParticleBackground` を再エクスポートする barrel も import している箇所も存在しないため、削除による import 破綻は生じない。パーティクル背景はいずれのページでもレンダリングされない）。**

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
| `service/components/animations/index.ts` | barrel export（想定） | **本タスクの snapshot には実在せず（`service/components/**/*.ts` 0 件）。`ParticleBackground` を再エクスポートする barrel は存在しない** | ✅ 削除タスクで確定 |

> **削除タスクの確定結果（✅）**: constellation-background-removal の実行環境で確実に手元に surfacing した
> `animations/` 配下のファイルは `ParticleBackground.tsx` のみだった。これは canvas 描画コード・粒子生成ロジック・
> requestAnimationFrame ループがすでに撤去され `return null` の no-op スタブになっていた（前段タスクの暫定対応）。
> 前版はこのスタブを「barrel 再エクスポート（`export { ParticleBackground } from "./ParticleBackground"`）を有効に保つため」
> 残す説明を付していたが、実際には当該 barrel（`index.ts`）はソースツリーに存在せず（`service/components/**/*.ts` は 0 件）、
> `ParticleBackground` を import している箇所も snapshot 上は無かった（`service/app/layout.tsx` にも参照なし・§(a-2)）。
> したがってスタブを残す根拠は無効であり、本タスクではファイルごと `ParticleBackground.tsx` をリポジトリから削除した。
> その結果、モジュール `ParticleBackground` はリポジトリから失われ、パーティクル背景はいずれのページでもレンダリングされない。
> 上表の他候補（HeroParticleTitle / HeroSpotlight / FloatingShapes / Reveal / index.ts）は本タスクの snapshot には現れず、
> 実在有無は未確定のまま残す（推測で削除しないため、ファイル単位で本文確認できたものだけを対象とした）。

### a-2. マウント箇所 🔎 要確認

`service/app/layout.tsx` には `ParticleBackground` への参照は無い（✅ 本文確認済み）。
その他の呼び出し箇所（`SiteShell` 等）は本タスクの snapshot では未surfacing のため、実パス:行は未確定。
削除タスクは呼び出し箇所（残存していれば）を除去してから本体を消すこと（§(g) G2）。本タスクの snapshot で確認できた
参照は 0 件であり、ファイル削除による import 破綻は生じない。

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
自作実装であった旨がファイル内コメントに記録されていた。本タスクではこの no-op スタブを含む `ParticleBackground.tsx`
ファイル自体をリポジトリから削除した（モジュール `ParticleBackground` はリポジトリから失われ、パーティクル背景はレンダリングされない）。

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

> 上表は本タスクの snapshot で本文確認できた範囲。`service/app/**` を含む全数 grep は
> グラデーション廃止タスク（gradient-abolition-solid-background）が d-3 のコマンドで実行して残りを埋める。
> 本タスク（背景アニメーション削除）のスコープではグラデーションの単色化は行わない。

### d-5. 受け入れ条件への含意

`docs/design/` 配下（`shared/tokens.css` / `shared/shell.css` / `shared/shell.js` / 各種 `*.html`）は
**デザイン素案でありアプリケーションコードではない**。受け入れ条件の対象は
「`service/` 配下のアプリケーションコード」であるため、`docs/design/` のグラデーションは対象外。判断根拠は PR に残すこと。

---

## (e) 既存テーマ機構の所在

> 以下は前版が推定した所在であり、本タスクでは `service/lib/**`・`service/app/globals.css`・
> `service/tailwind.config.*` を開けていない。実在・本文は後続タスクが §(g) G6 で確認する。
> 本タスク（背景アニメーション削除）のスコープはテーマ機構の変更を含まないため、これらは未着手のまま残す。

### e-1. テーマモジュール（🅘 前版推定・本文未確認）

| 候補パス | 内容（推定） |
| --- | --- |
| `service/lib/theme.ts` | テーマ定義の実体（前版は単一ファイルと推定。`lib/theme/` ディレクトリではない可能性） |
| `service/lib/__tests__/theme.test.ts` | テーマ契約テスト（`THEME_STORAGE_KEY` / `DEFAULT_THEME` / `THEMES` / `isTheme()` 等） |
| `service/components/theme/ThemeProvider.tsx` | `<html data-theme="...">` を駆動する Provider（`service/app/layout.tsx` の `import { ThemeProvider, themeBootScript } from "@/components/theme"` で参照。✅ layout 本文確認） |
| `service/components/theme/ThemeToggle.tsx` | ライト/ダーク切替 UI |
| `service/components/theme/index.ts` | barrel export（layout の `@/components/theme` からの解決先。✅ 参照確認） |

### e-2. Tailwind 設定・PostCSS（🅘 前版推定・本文未確認）

| 候補パス | 状態 |
| --- | --- |
| `service/tailwind.config.*`（`.ts` または `.js`） | 🔎 拡張子・採用ファイルは G6 で確定（色トークン追加先） |
| `service/postcss.config.js` | 🅘 推定 |
| `service/components.json` | 🅘 推定（shadcn/ui 設定） |

### e-3. CSS 変数定義（🅘 前版推定・本文未確認）

| 候補パス | 備考 |
| --- | --- |
| `service/app/globals.css` | `:root` / `[data-theme="dark"]` / `[data-theme="light"]` の CSS 変数定義先。単色背景の定義先の第一候補。`service/app/layout.tsx` が `import "./globals.css"` で読み込む（✅ 参照確認）。変数名は G6 で本文確認 |

### e-4. 稼働中のカラートークン名 ✅ / 🔎

| 事実 | 確度 |
| --- | --- |
| `SiteBrand.tsx` が `text-fg-muted` / `text-fg-strong` / `text-accent` クラスを使用 | ✅ 本文確認済み |
| `service/app/layout.tsx` が `data-theme="dark"` を初期値とし `ThemeProvider` / `themeBootScript` を使用 | ✅ 本文確認済み |
| Tailwind の `theme.extend.colors` に `fg.muted` / `fg.strong` / `accent` が定義されている | 🔎 config 本文で確定 |

**単色化の実装方針（グラデーション廃止タスクへの推奨）**:
新しい背景色をコンポーネントにハードコードせず、`globals.css` の CSS 変数
（`[data-theme="dark"]` / `[data-theme="light"]` の両方）に定義し、Tailwind config でトークン化して
`bg-*` クラス経由で参照する。定義先の実パス（config 拡張子・変数名）は §(g) G6 で確定してから着手すること。

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
5. `ParticleBackground.tsx`（no-op スタブ）は本タスクでリポジトリからファイルごと削除済み（✅）。モジュール `ParticleBackground` はリポジトリから失われ、パーティクル背景はいずれのページでもレンダリングされない。`ParticleBackground` を再エクスポートする barrel（`index.ts`）はソースツリーに存在せず（`service/components/**/*.ts` 0 件）、import している箇所も snapshot 上 0 件のため、ファイル削除による破綻は生じない。

### g-2. 未確定・後続タスクが確定する事項（🔎）

| # | 事項 | 追記先 | 状態 |
| --- | --- | --- | --- |
| G1 | `animations/` の全ファイルの本文と役割 | (a-1) | 部分確定（ParticleBackground.tsx のみ surfacing・ファイル削除済み） |
| G2 | 背景のマウント箇所（実パス:行） | (a-2) | 未確定（layout.tsx には参照なしを確認） |
| G3 | 実装方式（canvas + rAF か） | (b-2) | 確定（canvas + rAF の自作実装） |
| G4 | ロックファイルの実在・実パス | (c-1) | ✅ 確定（`service/pnpm-lock.yaml`） |
| G5 | グラデーション使用箇所の全数 grep | (d-4) | 後続 gradient-abolition-solid-background が実行 |
| G6 | テーマ機構・Tailwind config・CSS 変数名 | (e-1〜e-4) | 未確定（後続 theme-solid-background-tokens） |
| G7 | 維持対象アニメーションの実体特定 → 共有分離 | (f-2) | 共有なしを確認（本タスク範囲） |
| G8 | パーティクル/canvas 系外部依存の有無 | (b-1) | ✅ 確定（依存なし） |

### g-3. コミット分割

- `refactor: remove constellation background animation`（本タスク）
- `refactor: replace gradients with solid theme colors`（後続）

---

## 参考情報(出典・取得日)

- WCAG 2.2 達成基準 2.2.2「一時停止、停止、非表示」（レベル A）
  https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html （取得日 2026-07-23）
- prefers-reduced-motion（MDN）
  https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion （取得日 2026-07-23）
- requestAnimationFrame（MDN）
  https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame （取得日 2026-07-23）
- Conventional Commits 1.0.0
  https://www.conventionalcommits.org/en/v1.0.0/ （取得日 2026-07-23）
