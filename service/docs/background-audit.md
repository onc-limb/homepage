# 背景実装 特定調査レポート (background audit)

対象リポジトリ: onc-limb/homepage (`service/` = Next.js 15 App Router)
作成日: 2026-07-24
ステータス: **一部確定（本タスクの実行環境ではソースツリー全体へアクセスできず、後述の項目は物理未確認）**

> このドキュメントは後続サブタスク（星座風パーティクル背景の削除／グラデーション廃止・単色化）への
> 唯一の受け渡し手段である。したがって「実際に確認できた事実」と「確認できていない事項」を取り違えないことが最優先である。
> 本タスク自体のスコープは「特定調査 + SiteBrand の独立性固定 + 維持対象アニメーションの分離判定」であり、
> 実装ファイルの削除やグラデーションの単色化は行わない（後続タスクが §(g) の手順で実施する）。

---

## 0. 一次情報と確度の凡例（重要・前版からの訂正）

**前版は `service/components/animations/` 配下のファイル群・`service/package.json`・`service/app/globals.css`・
ロックファイル・Tailwind config 等を「リポジトリのファイル一覧（file listing）」を根拠に『インベントリ確定 🅘』と
記載していた。しかし本レポート作成タスクの実行環境で実際にアクセスできたソースは次の 3 点のみである:**

- `service/components/header/SiteBrand.tsx`（全文）
- `service/components/header/__tests__/SiteBrand.independence.test.ts`（全文、本タスクで新設）
- 本 audit doc 自身

すなわち `service/components/animations/**`・`service/package.json`・`service/app/globals.css`・各ロックファイル・
`service/tailwind.config.*` などは **本タスクでは開けていない**。したがって前版が名称・barrel 構成・命名規則から
推定していた事項（背景本体の実パス、維持対象アニメーションの実体、外部依存の有無、グラデーションのヒット箇所、
ロックファイルの実パス）は **物理的な確認を経ていない推定**であり、確定として扱ってはならない。
これらは後続タスク（＝ソースツリーへアクセスできる実作業タスク）が §(g) のコマンドで**実行して確定させ、
本ドキュメントへ結果を貼る**必要がある。前版がこれらを ✅／🅘 と称して「確定した受け渡し」に見せていた点を本版で訂正する。

| 記号 | 意味 |
| --- | --- |
| ✅ 本文確認済み | 本タスクで**実際に全文を読んだファイル**（`SiteBrand.tsx` / 独立性テスト）から直接確認した事実。訂正の対象外 |
| 🅘 前版推定（本タスク未確認） | 前版が名称・配置・barrel 構成から推定した事項。該当ソースを本タスクでは開けていないため **候補**として扱い、§(g) で物理確認する |
| 🔎 要確認（実作業の前に必須） | 削除・単色化・分離に着手する前に、ソースツリーへアクセスできる後続タスクがコマンドを実行して確定する事項 |

> 補足: 前版は「packageManager 宣言」「ディレクトリ命名」を根拠に (a)(c)(d) を確定扱いにしていたが、
> 宣言は物理ファイルの存在・実パスを保証せず、命名はファイル本文（canvas/rAF/共有ロジックの有無）を保証しない。
> 本版はこの 2 種の推定を確定から外し、確認手段（コマンド）と追記先を明示することで受け渡しを成立させる。

---

## (a) パーティクル背景を構成するファイルの実パス一覧

> **本タスクの制約**: `service/components/animations/` 配下は本タスクの実行環境で開けていない。
> 以下は前版が名称・barrel 構成から挙げた**候補**であり、実在・役割・削除/維持・共有有無はいずれも
> §(g) G1 で本文を開いて確定する。**候補のまま一括削除してはならない。**

### a-1. `service/components/animations/` の候補ファイル群 🅘 前版推定（本タスク未確認）

| 候補パス | 名称からの推定役割 | 削除 / 維持（未確定） | 確度 |
| --- | --- | --- | --- |
| `service/components/animations/ParticleBackground.tsx` | 星座風パーティクル背景の本体（想定） | 削除候補 | 🅘 / 🔎 本文で実在・役割確認 |
| `service/components/animations/HeroParticleTitle.tsx` | サイトタイトルの流動アニメーションの実体か（(f-2) 参照。**未確認**） | 維持候補 | 🅘 / 🔎 本文で実在・役割確認 |
| `service/components/animations/HeroSpotlight.tsx` | 装飾スポットライト演出（想定） | 削除候補 | 🅘 / 🔎 |
| `service/components/animations/FloatingShapes.tsx` | 浮遊シェイプの装飾演出（想定） | 削除候補 | 🅘 / 🔎 |
| `service/components/animations/Reveal.tsx` | スクロール表示演出ユーティリティ（背景専用でない可能性） | 維持候補 | 🅘 / 🔎 |
| `service/components/animations/index.ts` | barrel export（想定） | 参照元に応じて整理 | 🅘 / 🔎 |

> **削除タスクへ**: 上表は未確認の候補である。`ls -1 components/animations/` で実在ファイルを確定し、
> 各ファイル本文で役割（背景本体か・維持対象か・汎用か）と共有ロジックの有無を確認してから
> ファイル単位で削除/維持を選り分けること（(f-2)/(g) G1・G7）。

### a-2. マウント箇所 🔎 要確認

背景コンポーネントがレンダリングツリーに載る位置（実パス:行）は未確認。候補はレイアウト系
（`service/app/layout.tsx` およびルートグループの `layout.tsx`）。§(g) G2 で確定する。

### a-3. 関連 CSS 🔎 要確認

- `service/components/` 配下の `*.module.css` の有無、`animations/` 配下の付随 CSS の有無は未確認。§(g) G1 で確定する。
- グローバル CSS の候補は `service/app/globals.css`（単色背景トークンの定義先候補、(e-3)）だが、本文は未確認。

参考（`service/` 外・デザイン素案。アプリ本体ではないので **削除対象外**、実在は未確認）:
`docs/design/shared/tokens.css` / `docs/design/shared/shell.css` / `docs/design/shared/shell.js`

### a-4. 関連テスト

- 本タスクで新設したテスト（本タスクで全文確認済み）:
  `service/components/header/__tests__/SiteBrand.independence.test.ts` ✅
- `service/components/animations/` 配下のテストの有無は未確認。§(g) G1 で確定する。

---

## (b) パーティクル背景専用の外部依存パッケージ

> **本タスクの制約**: `service/package.json` を本タスクでは開けていない。以下は前版が package.json 全文を
> 読んだ前提で記録した内容だが、本タスクでは再確認できていないため §(g) G8 で実確認する。

### b-1. 前版の結論: **なし**（🔎 本タスク未再確認）

前版は `service/package.json` の依存を確認し、以下の particles 系・canvas 描画エンジン系はいずれも存在しないと記録した:

- `tsparticles` / `@tsparticles/*` / `tsparticles-slim` / `tsparticles-engine`
- `react-particles` / `react-tsparticles` / `react-particles-js`
- `particles.js` / `particlesjs`
- `three` / `@react-three/fiber`
- `p5` / `pixi.js`

→ 前版はパーティクル背景を **自作実装**（外部パーティクルライブラリ非使用）と結論。
本タスクでは package.json を開けていないため、削除タスクは §(g) G8 で `grep` して再確認すること。

### b-2. 実装方式（canvas + rAF か CSS/SVG か）🔎 要確認

外部依存が無い前提なら自作実装。canvas + `requestAnimationFrame` か CSS/SVG かは
`ParticleBackground.tsx` / `HeroParticleTitle.tsx` の本文で確定する（§(g) G3）。

### b-3. 受け入れ条件への含意

> 「専用外部ライブラリを使用していた場合、そのパッケージが package.json とロックファイルから削除されている
> （使用していなかった場合、依存関係の変更はない）」

→ b-1 が §(g) G8 で裏付けられれば **依存関係の変更は不要**。逆に particles 系依存が見つかった場合は
package.json とロックファイルから削除が必要になる。G8 の結果で分岐すること。

### b-4. 参考: 前版が記録した隣接の汎用アニメーション依存（見つかっても削除してはならない）🔎 未再確認

| パッケージ | 前版記載バージョン | 備考 |
| --- | --- | --- |
| `motion` | `^12.23.26` | 汎用アニメーションライブラリ。背景以外でも使われうるため **削除禁止** |
| `tailwindcss-animate` | `^1.0.7` | Tailwind のアニメーションユーティリティ。shadcn/ui 系が依存するため **削除禁止** |

---

## (c) パッケージマネージャとロックファイル

> **finding 対応**: 前版は `package.json` の `packageManager` 宣言（`pnpm@9.15.0`）を根拠に
> ロックファイルの存在・実パスを ✅ 確定としていた。だが宣言はロックファイルの**物理的な存在・実パス**を
> 保証しない（未生成・パス相違もありうる）。本タスクの実行環境ではロックファイル自体を確認できないため、
> 種別の推定と実確認手段を分けて記載し、実パスの確定は §(g) G4 の実行に委ねる。

| 項目 | 値 | 確度 |
| --- | --- | --- |
| パッケージマネージャ（宣言） | 前版記載: `package.json` の `"packageManager": "pnpm@9.15.0"` | 🔎 本タスクでは package.json 未再確認 |
| ロックファイル形式の推定 | pnpm 宣言が正なら `pnpm-lock.yaml`。ただし宣言≠存在保証 | 🅘 推定 |
| ロックファイルの実パス・実在 | `pnpm-lock.yaml` / `package-lock.json` / `yarn.lock` / `bun.lockb` / `bun.lock` の**どれが実在するか**、およびルート直下か `service/` 直下か | 🔎 §(g) G4 で `find` により実確認・**本ドキュメントへ結果を貼る** |

> したがって現時点で「ロックファイルは `pnpm-lock.yaml` で確定」とは**言えない**。G4 の `find` 出力で実在・実パスを
> 確定し、下表を埋めてから受け渡しとすること。

### c-1. G4 実行結果（後続タスクが追記）

| 探索したパターン | ヒットした実パス（存在すれば） |
| --- | --- |
| `pnpm-lock.yaml` |  |
| `package-lock.json` |  |
| `yarn.lock` |  |
| `bun.lockb` / `bun.lock` |  |

検証コマンド（すべて `service/` で実行、パッケージマネージャは G4 の実結果に合わせる）:

```sh
pnpm install --frozen-lockfile   # 依存導入
pnpm run test                    # vitest run
pnpm run lint                    # next lint
pnpm exec tsc --noEmit           # 型チェック
pnpm run build                   # 全ページのビルド確認
```

---

## (d) グラデーション使用箇所

> **finding 対応**: item2(d) は `bg-gradient-`/`from-`/`via-`/`to-`/`linear-gradient`/`radial-gradient` を
> `service/**/*.{ts,tsx,css,mdx}` に対して検索した**全ヒット一覧**を本ドキュメントへ記録することを履行条件とする。
> しかし本タスクの実行環境では `service/**` のソースツリーへアクセスできず、全数検索を実行できなかった。
> 本タスクでアクセスできたファイルに対する結果のみを d-1 に確定として記録し、残り（`service/**` 全体）は
> **推測でヒット一覧を捏造せず**、後続タスクが §(d-3) のコマンドを実行して d-4 を埋めることとする。
> これは「後続へ委譲」ではなく「本タスクの環境で物理的に実行不能だった範囲の明示的な引き継ぎ」である。

### d-1. 本タスクで実際に検索できた範囲の結果 ✅ 本文確認済み

本タスクでアクセスできた 2 ファイルに対し、`bg-gradient-` / `linear-gradient` / `radial-gradient` /
`conic-gradient` / `from-`・`via-`・`to-`（カラーストップ）を確認した:

| 実パス | 結果 | 確度 |
| --- | --- | --- |
| `service/components/header/SiteBrand.tsx` | グラデーション **0 件**。使用色は `text-fg-muted` / `text-fg-strong` / `text-accent` の単色トークンのみ | ✅ 本文確認済み |
| `service/components/header/__tests__/SiteBrand.independence.test.ts` | `linear-gradient` / `radial-gradient` / `conic-gradient` / `bg-gradient-` の文字列が**検出ロジックのトークン定義・仮想 FS のフィクスチャ**として出現するのみ。実スタイルとしての使用は 0 件（全数 grep すると本ファイルはヒットするが装飾ではない） | ✅ 本文確認済み |

`SiteBrand.independence.test.ts` は SiteBrand のモジュールグラフ全体に対して上記トークンの不在を契約化しており、
SiteBrand 経路のグラデーション 0 件は回帰込みで固定されている。

### d-2. グラデーションが存在しうる高確度の候補（🅘 前版推定・本文未確認）

親 issue が「背景・セクションにグラデーションが多用されている」と明記しているため、
後続タスクが **最優先で本文 grep する対象**（実在・ヒット有無ともに未確認の候補）:

| 候補パス | 理由 |
| --- | --- |
| `service/components/animations/ParticleBackground.tsx` | 背景本体（候補）。背景グラデーションの第一候補 |
| `service/components/animations/HeroSpotlight.tsx` | スポットライト演出は radial-gradient の常用箇所 |
| `service/components/animations/FloatingShapes.tsx` | シェイプ塗りにグラデーションを使う公算 |
| `service/app/globals.css` | 全体背景・`body`/`:root` のグラデーション定義候補 |
| 各ページ/セクション（`service/app/**`, `service/components/**`） | `bg-gradient-*` / `from-*`/`via-*`/`to-*` の Tailwind クラス |

### d-3. 全数 grep（§(g) G5・後続タスクが実行し d-4 へ貼る）

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

> `from-`/`via-`/`to-` は無関係にヒットしうる。各ヒットを「カラーストップか否か」で目視判定し、判定も残すこと。
> `SiteBrand.independence.test.ts` はトークン定義でヒットするが装飾ではない（d-1 参照）ため、d-4 では「検出ロジック・除外」と判定すること。

### d-4. grep 実行結果（後続タスクが追記）

各ヒットについて次の 3 列で判定を残す:

| 実パス:行 | 該当文字列 | 判定（背景/セクション装飾か・置換先の単色トークン） |
| --- | --- | --- |
| `service/components/header/SiteBrand.tsx` | （ヒットなし） | グラデーション 0 件（✅ 本タスク確認済み） |
| `service/components/header/__tests__/SiteBrand.independence.test.ts` | `linear-gradient` 等のトークン定義・フィクスチャ | 検出ロジック・除外（装飾ではない、✅ 本タスク確認済み） |

### d-5. 受け入れ条件への含意

`docs/design/` 配下（`shared/tokens.css` / `shared/shell.css` / `shared/shell.js` / 各種 `*.html`）は
**デザイン素案でありアプリケーションコードではない**。受け入れ条件の対象は
「`service/` 配下のアプリケーションコード」であるため、`docs/design/` のグラデーションは対象外。判断根拠は PR に残すこと。

---

## (e) 既存テーマ機構の所在

> **本タスクの制約**: 以下は前版が推定した所在であり、本タスクでは `service/lib/**`・`service/app/globals.css`・
> `service/tailwind.config.*` を開けていない。実在・本文は §(g) G6 で確認する。

### e-1. テーマモジュール（🅘 前版推定・本文未確認）

| 候補パス | 内容（推定） |
| --- | --- |
| `service/lib/theme.ts` | テーマ定義の実体（前版は単一ファイルと推定。`lib/theme/` ディレクトリではない可能性） |
| `service/lib/__tests__/theme.test.ts` | テーマ契約テスト（`THEME_STORAGE_KEY` / `DEFAULT_THEME` / `THEMES` / `isTheme()` 等） |
| `service/components/theme/ThemeProvider.tsx` | `<html data-theme="...">` を駆動する Provider |
| `service/components/theme/ThemeToggle.tsx` | ライト/ダーク切替 UI |
| `service/components/theme/index.ts` | barrel export |

> 単色トークンを追加する際、`service/lib/theme.ts`（ファイル）と `service/lib/theme/`（ディレクトリ）の
> 二重定義を作らないよう、G6 で実体の形（ファイルかディレクトリか）を確認してから触ること。

### e-2. Tailwind 設定・PostCSS（🅘 前版推定・本文未確認）

| 候補パス | 状態 |
| --- | --- |
| `service/tailwind.config.*`（`.ts` または `.js`） | 🔎 拡張子・採用ファイルは G6 で確定（色トークン追加先） |
| `service/postcss.config.js` | 🅘 推定 |
| `service/components.json` | 🅘 推定（shadcn/ui 設定） |

色トークンの追加先を誤ると「定義したのに効かない」事故になるため、実在する Tailwind config の拡張子を
G6 で確定してから触ること（Tailwind v3 の解決順は `tailwind.config.js` → `.cjs` → `.mjs` → `.ts`）。

### e-3. CSS 変数定義（🅘 前版推定・本文未確認）

| 候補パス | 備考 |
| --- | --- |
| `service/app/globals.css` | `:root` / `[data-theme="dark"]` / `[data-theme="light"]` の CSS 変数定義先。単色背景の定義先の第一候補。変数名は G6 で本文確認 |

デザイン素案側の対応ファイル（値の出典として参照可・変更対象外）:
`docs/design/shared/tokens.css`（トークンの原典） / `docs/design/shared/shell.js`（`THEME_STORAGE_KEY` の原典）

### e-4. 稼働中のカラートークン名 ✅ / 🔎

| 事実 | 確度 |
| --- | --- |
| `SiteBrand.tsx` が `text-fg-muted` / `text-fg-strong` / `text-accent` クラスを使用 | ✅ 本文確認済み |
| Tailwind の `theme.extend.colors` に `fg.muted` / `fg.strong` / `accent` が定義されている | 🔎 config 本文で確定 |

**単色化の実装方針（削除タスクへの推奨）**:
新しい背景色をコンポーネントにハードコードせず、`globals.css` の CSS 変数
（`[data-theme="dark"]` / `[data-theme="light"]` の両方）に定義し、Tailwind config でトークン化して
`bg-*` クラス経由で参照する。これが受け入れ条件「置き換え後の背景色は既存テーマ機構で定義されており、
コンポーネント内のハードコードされた場当たりな色指定として追加されていない」を満たす形である。
定義先の実パス（config 拡張子・変数名）は §(g) G6 で確定してから着手すること。

---

## (f) 背景実装との共有ロジックの有無（本タスクの分離判定）

### f-1. `SiteBrand.tsx` と背景実装の共有: **共有なし** ✅ 本文確認済み

`service/components/header/SiteBrand.tsx` の全文確認結果:

- import は `react` / `next/image` / `next/link` の 3 つのみ。背景実装からの import は無い。
- `canvas` 要素・`getContext`・`requestAnimationFrame` を使用していない。
- `motion` 等のアニメーションライブラリも使用していない。
- 出力は `<Link>` + `<Image>` + テキスト 3 スパンのみ（静的なヘッダーロゴ + パンくず表記）。

→ `SiteBrand.tsx` および周辺（`Header` / `SiteNav` / `MobileNav` 等）へのコード変更は不要で、行っていない。
これにより親 issue が流動アニメーションの実体と *推測* していた `SiteBrand` は **静的コンポーネントであり
維持対象アニメーションを持たない**ことが確定した。

### f-2. 維持対象の「サイトタイトルの流動アニメーション」の実体と共有判定: **本タスクでは実体を確定できず（保守的に分離前提）**

> **finding 対応**: 前版は維持対象の実体を `HeroParticleTitle.tsx` と**断定**し「共有あり（分離必須）」を
> ハード前提化していたが、これは命名（Hero + Particle + Title）と barrel 同居からの推測のみで、本文未確認である。
> 本タスクの実行環境では `service/components/animations/` を開けておらず、`HeroParticleTitle.tsx` の実在・実装方式・
> `ParticleBackground.tsx` との共有有無はいずれも確認できない。したがって実体の**断定を取り下げ**、候補と保守的方針のみ記録する。

- **確定していること（✅）**: 親 issue が実体と推測した `SiteBrand.tsx` は静的で、アニメーションを持たない（f-1）。
  よって維持対象の実体は `SiteBrand` 以外にある。
- **候補（🅘 未確認）**: 前版が挙げた `service/components/animations/HeroParticleTitle.tsx` は命名上の候補だが、
  実在・実装・共有有無は未確認。他の候補（`animations/` 配下の別ファイル等）を排除もできていない。
- **保守的方針（🔎 後続で確定）**: タイトルを絶対に壊さないため、後続タスクは背景を消す前に §(g) G7 で
  維持対象アニメーションの実体を**本文で特定**し、背景実装（`ParticleBackground.tsx` 等）との共有ロジック
  （canvas ユーティリティ / パーティクル生成 / 型・定数）の有無を確認する。**共有があれば分離してから背景を削除**、
  **共有が無ければコード変更不要**（その旨を本節に追記）。共有有無を確認するまでは「共有ありうる」前提で作業し、
  実体不明のまま `animations/` を一括削除しないこと。

> 前版の「実体 = `HeroParticleTitle.tsx`、共有あり確定・分離必須」という結論は、本文未確認の推測を確定に
> 見せていた点で誤りだったため撤回した。実体特定と共有判定は G7 の本文確認に委ねる（推測での断定はしない）。

### f-3. 本タスクで追加した回帰テスト

`service/components/header/__tests__/SiteBrand.independence.test.ts` を新設し、
`SiteBrand.tsx` の **モジュールグラフ全体**（直接 import・副作用 import・動的 import・CSS `@import`・
推移的な内部 import）が背景実装（背景モジュール / canvas 描画プリミティブ / グラデーション /
パーティクル描画パッケージ）に依存しないことを契約として固定した。

設計上の注意点:

- `BACKGROUND_MODULE_PATTERN` は `animations` / `background(s)` / `particles?` / `canvas` / `constellation` を
  ディレクトリ区切りで拾い、加えて `particle` / `constellation` を名称一致で拾う。
  背景実装の実ディレクトリは本タスクで確定できていない（(a) は未確認）ため、パターンは特定の 1 ディレクトリに
  賭けず名称ベースで横断的に拾う設計とし、実パスが確定した後続タスクで **足す方向**で締める。
- SiteBrand のローカル import は 0 件のため実グラフは 1 ファイルであり、そのままではアサーションが自明に真になる。
  これを避けるため検出ロジックを純関数（`backgroundOffenders` / `canvasOffenders` / `gradientOffenders`）へ切り出し、
  仮想ファイルシステム上の 3 段グラフ（entry → 中間モジュール → 背景 CSS）に対して
  **推移的結合・副作用 import・グラデーション・rAF を実際に検出する**ことを自己検査している。
  これにより将来 SiteBrand に import が追加された場合の回帰ガードとして機能する。

このテストは f-1 の範囲（SiteBrand の独立性）を保証するものであり、f-2（維持対象アニメーションの分離）を
代替するものではない。分離の担保は §(g) G7 の実施と、その際のタイトル挙動不変テストで行う。

---

## (g) 後続サブタスクへの受け渡しサマリ

### g-1. 本タスクで確定している事項（✅ 実際に読んだファイルに基づく）

1. `SiteBrand.tsx` は背景実装に依存せず、グラデーション（`linear/radial/conic-gradient`・`bg-gradient-`）も
   使用していない（✅）。独立性は `SiteBrand.independence.test.ts` で回帰込みで固定済み。
2. 親 issue が維持対象アニメーションの実体と推測した `SiteBrand` は**静的**であり、実体は別にある（✅ f-1）。
3. 本タスクの実行環境では `service/components/animations/**`・`service/package.json`・`service/app/globals.css`・
   ロックファイル・`service/tailwind.config.*` を開けなかった。したがって背景本体の実パス・維持対象の実体・
   外部依存の有無・グラデーションの全ヒット・ロックファイルの実パスは **未確定**であり、下表 G1〜G8 の実行で確定する。

### g-2. ソースツリーへアクセスできる後続タスクが着手前に実行して確定する事項（🔎）

すべて `service/` で実行し、出力を本ファイルの該当セクションへ貼ること（本ファイルが唯一の受け渡し手段のため）。

| # | 事項 | 実行コマンド | 追記先 |
| --- | --- | --- | --- |
| G1 | `animations/`（実在するなら）各ファイルの本文と役割（削除/維持・付随 CSS/テストの有無） | 下記 | (a-1) |
| G2 | 背景のマウント箇所（実パス:行） | 下記 | (a-2) |
| G3 | 実装方式（canvas + rAF か CSS/SVG か） | 下記 | (b-2) |
| G4 | **ロックファイルの実在・実パス**（種別も実確認） | 下記 | (c-1) |
| G5 | **グラデーション使用箇所の全数 grep** | §(d-3) | (d-4) |
| G6 | テーマ機構の実在・Tailwind config の拡張子・色トークン名・CSS 変数名 | 下記 | (e-1〜e-4) |
| G7 | **維持対象アニメーションの実体特定 → 背景実装との共有モジュール分離**（背景削除より前・独立コミット） | 下記 | (f-2) |
| G8 | **パーティクル/canvas 系外部依存の有無**（package.json 実確認） | 下記 | (b-1) |

```sh
# G1
ls -1 components/animations/ 2>/dev/null
grep -rn "getContext\|requestAnimationFrame\|<canvas\|particles\|constellation" \
  components/animations --include='*.ts' --include='*.tsx' 2>/dev/null

# G2（背景コンポーネント名を <Name> に）
grep -rn "ParticleBackground" app components --include='*.ts' --include='*.tsx'
grep -rn "children" app/layout.tsx app/*/layout.tsx

# G3
grep -rn "getContext\|requestAnimationFrame\|<canvas\|<svg" components/animations \
  --include='*.ts' --include='*.tsx' 2>/dev/null

# G4（リポジトリルートで実行。実在するロックファイルを確定し (c-1) へ貼る）
find . -maxdepth 2 \( -name 'pnpm-lock.yaml' -o -name 'package-lock.json' \
  -o -name 'yarn.lock' -o -name 'bun.lockb' -o -name 'bun.lock' \)

# G6
ls -1 lib/theme.ts lib/theme 2>/dev/null
ls -1 tailwind.config.* postcss.config.* components.json 2>/dev/null
head -60 tailwind.config.* 2>/dev/null
grep -n "^\s*--\|data-theme\|:root" app/globals.css 2>/dev/null

# G7（維持対象の実体を特定 → 共有モジュールの洗い出し → 分離）
grep -rn "requestAnimationFrame\|<canvas\|getContext\|particles" components app \
  --include='*.tsx' --include='*.ts'
grep -n "^import\|from \"" components/animations/*.tsx 2>/dev/null

# G8（パーティクル/canvas 系依存の有無を実確認）
grep -nE "tsparticles|react-particles|particles\.js|particlesjs|\"three\"|@react-three|\"p5\"|pixi\.js" \
  package.json
```

G7 の手順:

1. まず維持対象「サイトタイトルの流動アニメーション」の実体ファイルを本文で特定する
   （`SiteBrand` は静的で該当しない — f-1）。前版が候補とした `HeroParticleTitle.tsx` を含め、実在と役割を確認する。
2. その実体と背景実装（`ParticleBackground.tsx` 等）の import を突き合わせ、共有モジュール
   （canvas ユーティリティ / パーティクル生成ロジック / 型 / 定数）を確定する。
3. **共有があった場合**: 共有ロジックを維持対象側（またはタイトル専用の新モジュール）へ複製・移設し、
   背景を削除してもタイトルが壊れない状態にしてから背景を削除する。独立コミットにする。
4. **共有が無かった場合**: コード変更は不要。その旨を (f-2) に追記する。
5. いずれの場合も `pnpm exec tsc --noEmit` / `pnpm run test` / `pnpm run lint` を通し、
   タイトルの見た目・挙動を変更しないこと。

> 背景実装ディレクトリの **一括削除は禁止**。維持対象アニメーション・汎用ユーティリティ（`Reveal` の類）が
> 同居しうるため、必ずファイル単位で削除/維持を選り分けること。

### g-3. コミット分割

- `refactor: remove constellation background animation`
- `refactor: replace gradients with solid theme colors`
- 分離が必要な場合はその前に `refactor: decouple title animation from background implementation` を独立コミットで置く。

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
