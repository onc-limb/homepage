# 背景実装 特定調査レポート (background audit)

対象リポジトリ: onc-limb/homepage (`service/` = Next.js 15 App Router)
作成日: 2026-07-24
ステータス: **未完了 / 調査ブロック中**

> **このドキュメントは「調査完了レポート」ではない。**
> 記録項目 (a)(c)(d)(e)(f-2) は本タスクの実行環境の制約により **取得できていない**。
> 取得できていない項目には、推測を書かず「未取得」と、取得するための実行コマンドだけを置いている。
> 後続タスクは §0-2 のゲート（G1〜G7）を消化して本ファイルへ追記してから、
> 削除・単色化の実作業に入ること。

目的: 「星座風パーティクル背景の削除」「グラデーション廃止・単色化」の後続サブタスクへ、
必要なファイルパス・依存・テーマ機構の所在を受け渡すこと。

---

## 0. 本レポートの位置づけと検証ステータス

### 0-1. 調査環境の制約（重要・レビュー指摘への回答）

本レポートは、以下の資料 **のみ** が与えられた環境で作成した。

- リポジトリのファイル一覧（テキストとして提示されたもの。実在確認はしていない）
- `service/package.json` の全文
- `service/components/header/SiteBrand.tsx` の全文
- いくつかの既存テストの全文

この環境では **シェル（`ls` / `grep` / `find`）もファイル読み取りツールも利用できなかった**。
そのため、タスクが「実際に確認して記載」と要求している項目のうち、
以下は **実行そのものが不可能**であり、未取得のままである。

| 記録項目 | 状態 | 未取得の理由 |
| --- | --- | --- |
| (a) パーティクル背景を構成する全ファイルの実パス一覧 | **未取得** | 各ファイルを開けず、役割・マウント箇所を確定できない |
| (b) 専用外部依存パッケージ | **取得済み（「なし」）** | `package.json` 全文が与えられたため確定 |
| (c) パッケージマネージャとロックファイルの実パス | **未取得** | `ls` を実行できずファイル実在を確認できない |
| (d) グラデーション使用箇所の全リスト | **未取得** | 横断 `grep` を実行できない |
| (e) 既存テーマ機構の所在 | **未取得（一部推定のみ）** | Tailwind config・`lib/theme` の本文を開けない |
| (f-1) `SiteBrand.tsx` と背景実装の共有 | **取得済み（共有なし）** | 全文が与えられたため確定 |
| (f-2) 維持対象タイトルアニメーションと背景実装の共有 | **未取得** | 実体コンポーネントを特定できない |

**推測を成果物として書かない**ことを本レポートの原則とする。
以前の版には「名称からの推測」に基づく役割表・優先確認先リストが含まれていたが、
これらは検索結果の代替にならないためレビュー指摘に従って削除した（残したのは
「与えられたファイル一覧に現れたパス」という一次情報のみで、確度を明記している）。

| 記号 | 意味 |
| --- | --- |
| ✅ 本文確認済み | 全文が与えられたファイル（`package.json` / `SiteBrand.tsx` / 一部の既存テスト）から直接確認した事実 |
| 🟡 一覧由来・未検証 | 提示されたファイル一覧に基づく。実在確認も本文確認も未実施。**確定ではない** |
| ❌ 未取得 | この環境で実行できず取得できていない。再実行コマンドを併記する |

### 0-2. 後続タスク着手前に必ず消化するゲート

下記はすべて **削除・単色化の作業に入る前**に `service/` で実行し、
出力をそのまま本ファイルの該当セクションに貼ること（本ファイルが唯一の受け渡し手段であるため）。

| # | 未取得事項 | 実行コマンド | 追記先 |
| --- | --- | --- | --- |
| G1 | 背景実装ディレクトリの実在ファイルと各ファイルの役割 | §(a-1) | (a-1) |
| G2 | パーティクル背景のマウント箇所 | §(a-2) | (a-2) |
| G3 | 実装方式（canvas + rAF か CSS/SVG か） | §(b-2) | (b-2) |
| G4 | ロックファイルの実パス | §(c-2) | (c-1) |
| G5 | **グラデーション使用箇所の全リスト** | §(d-1) | (d-2) |
| G6 | Tailwind config の実在ファイルと採用ファイル | §(e-2) | (e-2) |
| G7 | 維持対象タイトルアニメーションの実体と、背景実装との共有有無の判定 | §(f-2) | (f-2) |

G5 と G7 は受け入れ条件に直結する（G5 = グラデーション 0 件、G7 = タイトルアニメーション維持）。
**この 2 つを消化せずに削除作業へ進んではならない。**

なお、`SiteBrand.independence.test.ts`（§f-3）の `BACKGROUND_MODULE_PATTERN` は
背景実装ディレクトリが未確定であることを前提に、候補ディレクトリ名
（`animations` / `background` / `particles` / `canvas` / `constellation`）を横断的に拾う形にしてある。
**G1 で実ディレクトリが確定したら、そのパスをパターンに追加すること**（緩めるのではなく足す）。

---

## (a) パーティクル背景を構成するファイルの実パス一覧 ❌ 未取得

### a-1. 実装本体

**未取得。** 実装ファイルの特定は行えていない。

提示されたファイル一覧には `service/components/animations/` 配下として次のパスが現れた。
これは **一覧に現れたという一次情報のみ**であり、実在確認も本文確認もしていない。
各ファイルの役割（どれが削除対象の背景で、どれが維持対象のタイトルアニメーションか）は
**一切判定していない**。

| 一覧に現れた実パス | 確度 |
| --- | --- |
| `service/components/animations/ParticleBackground.tsx` | 🟡 一覧由来・未検証 |
| `service/components/animations/HeroParticleTitle.tsx` | 🟡 一覧由来・未検証 |
| `service/components/animations/HeroSpotlight.tsx` | 🟡 一覧由来・未検証 |
| `service/components/animations/FloatingShapes.tsx` | 🟡 一覧由来・未検証 |
| `service/components/animations/Reveal.tsx` | 🟡 一覧由来・未検証 |
| `service/components/animations/index.ts` | 🟡 一覧由来・未検証 |

> このディレクトリ自体が存在しない可能性もある（一覧は本文確認していない）。
> G1 はまず「背景実装がどのディレクトリにあるか」の確定から始めること。

G1（`service/` で実行）:

```sh
# 背景実装ディレクトリの候補を横断で洗い出す
find app components lib -type d \
  \( -name 'animation*' -o -name 'background*' -o -name 'particle*' -o -name 'canvas*' \)

ls -1 components/animations/ 2>/dev/null
grep -rn "getContext\|requestAnimationFrame\|<canvas" app components lib \
  --include='*.ts' --include='*.tsx'
```

確定させる観点:

1. 背景として全ページに敷かれているのはどれか（＝削除対象）。
2. サイトタイトルの流動アニメーション（＝維持対象）を描いているのはどれか。
3. 両者が canvas 描画ユーティリティ / パーティクル生成ロジックを共有していないか（→ (f-2) G7）。

追記フォーマット:

```
| 実パス | 役割（本文確認の結果） | 削除 or 維持 |
```

### a-2. マウント箇所 ❌ 未取得

**未取得。** 背景がどこでレンダリングツリーに載っているかは特定していない。
候補列挙は行わない（特定結果の代替にならないため）。

G2（`service/` で実行。G1 で判明したコンポーネント名を `<Name>` に入れる）:

```sh
grep -rn "<Name>" app components lib --include='*.ts' --include='*.tsx'
# 名前が不明な段階では layout / shell 側から辿る
grep -rn "children" app/layout.tsx app/*/layout.tsx
```

> 削除タスクは grep 結果を本セクションに貼り付け、
> 「マウント箇所 = <実パス>:<行番号>」と確定させてから除去に入ること。

### a-3. 関連 CSS ❌ 未取得

一覧上、`service/**` に `*.module.css` は現れなかった（🟡 一覧由来）。
実在する CSS ファイルの列挙は未実行。

```sh
find app components lib -name '*.css'
```

参考（`service/` 外・デザイン素案。**アプリ本体ではないので削除対象外**）:
`docs/design/shared/tokens.css` / `docs/design/shared/shell.css` / `docs/design/shared/shell.js`

### a-4. 関連テスト ❌ 未取得

```sh
find app components lib -name '*.test.ts' -o -name '*.test.tsx'
```

一覧上、背景実装ディレクトリ配下にテストファイルは現れなかった（🟡 一覧由来）。
ただし実在確認をしていないため「削除対象テストはゼロ件」と断定はできない。

本タスクで追加したテスト（実在確定）:

- `service/components/header/__tests__/SiteBrand.independence.test.ts` ✅

---

## (b) パーティクル背景専用の外部依存パッケージ

### b-1. 結論: **なし** ✅ 本文確認済み

`service/package.json` の `dependencies` / `devDependencies` の全エントリを確認した結果、
以下の particles 系・canvas 描画エンジン系パッケージはいずれも **存在しない**:

- `tsparticles` / `@tsparticles/*` / `tsparticles-slim` / `tsparticles-engine`
- `react-particles` / `react-tsparticles` / `react-particles-js`
- `particles.js` / `particlesjs`
- `three` / `@react-three/fiber`
- `p5` / `pixi.js`

### b-2. 実装方式（canvas + rAF か CSS/SVG か）: ❌ 未取得

外部依存が無いことから **自作実装であること**までは確定する。
しかし方式が canvas + `requestAnimationFrame` なのか CSS/SVG なのかは確定していない。
タスクが要求する「particles 系ライブラリか自作 canvas + rAF かを確定させる」は
**particles 系ではないことまでが確定、canvas か否かは未達**である。

G3（`service/` で実行）:

```sh
grep -rn "getContext\|requestAnimationFrame\|<canvas\|<svg" app components lib \
  --include='*.ts' --include='*.tsx'
```

- `getContext("2d")` + `requestAnimationFrame` がヒット → 自作 canvas + rAF
- ヒットせず CSS アニメーション / SVG のみ → CSS/SVG 実装（削除対象は CSS 側にも及ぶ）

### b-3. 受け入れ条件への含意

> 「パーティクル背景専用の外部ライブラリを使用していた場合、そのパッケージが
> package.json とロックファイルから削除されている（使用していなかった場合、依存関係の変更はない）」

→ b-1 より **依存関係の変更は不要**。`service/package.json` とロックファイルは
本 issue で変更しないのが正しい成果物である。

### b-4. 参考: 隣接する汎用アニメーション依存（削除してはならない）✅ 本文確認済み

| パッケージ | バージョン | 備考 |
| --- | --- | --- |
| `motion` | `^12.23.26` | 汎用アニメーションライブラリ。背景以外でも使われる想定のため **削除禁止** |
| `tailwindcss-animate` | `^1.0.7` | Tailwind のアニメーションユーティリティ。shadcn/ui 系が依存するため **削除禁止** |

---

## (c) パッケージマネージャとロックファイル

### c-1. 現状

| 項目 | 値 | 確度 |
| --- | --- | --- |
| パッケージマネージャ | **pnpm 9.15.0**（`service/package.json` の `"packageManager": "pnpm@9.15.0"`） | ✅ 本文確認済み |
| **ロックファイルの実パス** | **未取得** | ❌ ファイル実在確認を実行できず |
| `package-lock.json` の有無 | **未取得** | ❌ |
| `yarn.lock` の有無 | **未取得** | ❌ |
| `bun.lockb` / `bun.lock` の有無 | **未取得** | ❌ |

> `packageManager` フィールドは「宣言」であって「ファイルの実在」ではない。
> `pnpm-lock.yaml` がリポジトリルート直下にあるのか `service/` 直下にあるのかも未確定である。
> 本項目は実パスが 1 つも記録できていないため **未達**であることを明記しておく。

### c-2. G4: 取得コマンドと追記フォーマット

```sh
# リポジトリルートで実行（1 コマンドで全階層を見る）
find . -maxdepth 2 -name 'pnpm-lock.yaml' -o -maxdepth 2 -name 'package-lock.json' \
  -o -maxdepth 2 -name 'yarn.lock' -o -maxdepth 2 -name 'bun.lockb' \
  -o -maxdepth 2 -name 'bun.lock'
```

追記フォーマット（find の出力をそのまま貼ったうえで結論を 2 行書く）:

```
存在するロックファイル: <実パス（複数あれば全部）>
存在しないもの: package-lock.json / yarn.lock / bun.lockb / bun.lock のうち上記に現れなかったもの
```

**なお (b) の結論より、本 issue でロックファイルを変更する必要は生じない。**

### c-3. 検証コマンド（すべて `service/` で実行）

```sh
pnpm install --frozen-lockfile   # 依存導入
pnpm run test                    # vitest run
pnpm run lint                    # next lint
pnpm exec tsc --noEmit           # 型チェック
pnpm run build                   # 全ページのビルド確認
```

---

## (d) グラデーション使用箇所の全リスト ❌ 未取得

### d-1. ステータスと取得コマンド（G5）

**本項目は本タスクの中核データであり、現時点で欠落している。**
この環境では横断 `grep` を実行できず、1 件も取得できていない。
以前の版にあった「優先確認先（推測）」は検索結果の代替にならないため削除した。

後続タスクは **最初に** 下記を実行し、出力（`ファイル:行番号:該当文字列`）を
d-2 にそのまま貼り付けてから単色化に入ること。

```sh
# service/ で実行。docs/design 配下（デザイン素案）はアプリ本体ではないので対象外
grep -rn -E "bg-gradient-|linear-gradient|radial-gradient|conic-gradient" \
  app components lib tailwind.config.js tailwind.config.ts \
  --include='*.ts' --include='*.tsx' --include='*.css' --include='*.mdx'

# Tailwind のカラーストップ（from-/via-/to-）。任意色記法 from-[#...] も含めて広めに拾う
grep -rn -E "(^|[\"'\` ])(from|via|to)-(\[|[a-z])" \
  app components lib \
  --include='*.ts' --include='*.tsx' --include='*.css' --include='*.mdx'
```

> 注: `from-` / `via-` / `to-` は Tailwind ではグラデーションのカラーストップ専用だが、
> 文字列として無関係にヒットしうる。ヒット行は目視で「カラーストップか否か」を判定し、
> 判定結果も d-2 に残すこと。

### d-2. grep 実行結果（後続タスクが追記すること）

```
（未取得。G5 実行後、上記 2 コマンドの出力をそのまま貼り付ける）
```

追記時は各ヒットについて次の 3 列で判定を残すこと:

| 実パス:行 | 該当文字列 | 判定（背景/セクション装飾か・置換先の単色トークン） |
| --- | --- | --- |
| | | |

### d-3. 現時点で確認できているグラデーション情報（部分・確定分のみ）

| 実パス | 結果 | 確度 |
| --- | --- | --- |
| `service/components/header/SiteBrand.tsx` | グラデーション **0 件**。使用色は `text-fg-muted` / `text-fg-strong` / `text-accent` の単色トークンのみ | ✅ 本文確認済み |

`SiteBrand.independence.test.ts` は SiteBrand のモジュールグラフ全体に対して
`linear-gradient` / `radial-gradient` / `conic-gradient` / `bg-gradient-` の不在を契約化している。
**これ以外のファイルについては 1 件も確認できていない。**

### d-4. 受け入れ条件への含意

`docs/design/` 配下（`shared/tokens.css` / `shared/shell.css` / `shared/shell.js` / 各種 `*.html`）は
**デザイン素案であってアプリケーションコードではない**。受け入れ条件の対象は
「`service/` 配下のアプリケーションコード（コンポーネント・スタイル・設定）」であるため、
`docs/design/` のグラデーションは残っていても条件を満たす。判断根拠は PR に残すこと。

---

## (e) 既存テーマ機構の所在 ❌ 未取得（実パス未確定）

### e-1. テーマモジュール 🟡 一覧・テスト由来

| 一覧に現れた実パス | 内容 | 確度 |
| --- | --- | --- |
| `service/lib/theme.ts` | テーマ定義の実体と推定（ディレクトリか単一ファイルかも未確定） | 🟡 未検証 |
| `service/lib/__tests__/theme.test.ts` | テーマ契約テスト（`THEME_STORAGE_KEY` / `DEFAULT_THEME` / `THEMES` / `isTheme()`） | 🟡 未検証 |
| `service/components/theme/ThemeProvider.tsx` | `<html data-theme="...">` を駆動する Provider | 🟡 未検証 |
| `service/components/theme/ThemeToggle.tsx` | ライト/ダーク切替 UI | 🟡 未検証 |
| `service/components/theme/index.ts` | barrel export | 🟡 未検証 |

G6-a（実パスの確定。`service/` で実行）:

```sh
ls -1 lib/ | grep -i theme
find lib components -path '*theme*'
```

> `lib/theme.ts`（ファイル）と `lib/theme/`（ディレクトリ）のどちらであるかを確定してから触ること。
> 同名ディレクトリを新設して二重定義を作らないこと（import 解決が曖昧になる）。

### e-2. Tailwind 設定 ❌ 未取得

| 実パス | 状態 |
| --- | --- |
| `service/tailwind.config.js` | ❌ 実在未検証 |
| `service/tailwind.config.ts` | ❌ 実在未検証 |
| `service/postcss.config.js` | 🟡 一覧由来 |
| `service/components.json` | 🟡 一覧由来（shadcn/ui 設定。採用 config の判定材料） |

**「`.js` と `.ts` の両方が存在する」という前提は未検証である。**
まず実在ファイルを確定させ、複数存在した場合にのみ解決順の議論を行うこと
（Tailwind v3 の解決順は `tailwind.config.js` → `.cjs` → `.mjs` → `.ts`）。
色トークンの追加先を誤ると「定義したのに効かない」事故になる。

G6-b（`service/` で実行）:

```sh
ls -1 tailwind.config.* postcss.config.* components.json 2>/dev/null
cat components.json
head -40 tailwind.config.*
```

追記フォーマット:

```
実在する Tailwind config: <実パス（複数あれば全部）>
実際に読まれている config: <実パスと判定根拠>
色トークンの追加先: <実パス>
```

### e-3. CSS 変数定義 ❌ 未取得

| 実パス | 備考 | 確度 |
| --- | --- | --- |
| `service/app/globals.css` | `:root` / `[data-theme="dark"]` / `[data-theme="light"]` の CSS 変数定義があると推定。単色背景の定義先の第一候補 | 🟡 未検証 |

```sh
grep -n "^\s*--\|data-theme\|:root" app/globals.css
```

デザイン素案側の対応ファイル（値の出典として参照可・変更対象外）:
`docs/design/shared/tokens.css`（トークンの原典） / `docs/design/shared/shell.js`（`THEME_STORAGE_KEY` の原典）

### e-4. 稼働中のカラートークン名

| 事実 | 確度 |
| --- | --- |
| `SiteBrand.tsx` が `text-fg-muted` / `text-fg-strong` / `text-accent` クラスを使用している | ✅ 本文確認済み |
| Tailwind の `theme.extend.colors` に `fg.muted` / `fg.strong` / `accent` が定義されている | 🟡 上記からの推定（config 本文は未確認） |

**単色化の実装方針（後続タスクへの推奨）**:
新しい色をコンポーネントにハードコードせず、`globals.css` の CSS 変数
（`[data-theme="dark"]` / `[data-theme="light"]` の両方）に背景色を定義し、
Tailwind config でトークン化して `bg-*` クラス経由で参照する。
これが受け入れ条件「置き換え後の背景色は既存テーマ機構で定義されており、
コンポーネント内のハードコードされた場当たりな色指定として追加されていない」を満たす形である。
ただし **定義先の実パスは G6 で確定させてから着手すること**。

---

## (f) 背景実装との共有ロジックの有無（本タスクの分離作業）

本項目は 2 つの問いに分かれる。**片方は確定、もう片方は未取得である。**

### f-1. `SiteBrand.tsx` と背景実装の共有: **共有なし** ✅ 本文確認済み

`service/components/header/SiteBrand.tsx` の全文を確認した結果:

- import は `react` / `next/image` / `next/link` の 3 つのみ。背景実装からの import は無い。
- `canvas` 要素・`getContext`・`requestAnimationFrame` を使用していない。
- `motion` などのアニメーションライブラリも使用していない。
- 出力は `<Link>` + `<Image>` + テキスト 3 スパンのみ。

→ `SiteBrand.tsx` および周辺（`Header.tsx` / `SiteNav.tsx` / `MobileNav.tsx` / `nav-utils.ts`）への
コード変更は行っていない。見た目・挙動は完全に据え置きである。

### f-2. 維持対象の「サイトタイトルの流動アニメーション」と背景実装の共有: ❌ 未取得（判定していない）

親 issue は流動アニメーションの実体を `SiteBrand` と *推測* していたが、f-1 の通り
`SiteBrand` は静的なヘッダーロゴ + パンくず表記であり、アニメーションを持たない。
つまり **維持対象の実体は SiteBrand ではない**。

実体のコンポーネントを特定できていないため、タスク仕様が求める二択

- 共有している → 分離する
- 共有していない → コード変更を行わずその旨を明記する

の **どちらとも結論できていない**。したがって「背景側を消しても維持対象アニメーションが
壊れない状態」は未達成であり、後続タスクの前提条件は満たされていない。
この判定は G7 として引き継ぐ。

G7 の手順:

1. `service/app/page.tsx` を開き、サイトタイトルを描いているコンポーネントの実パスを確定する。

   ```sh
   grep -n "import\|<" app/page.tsx | head -60
   ```

2. そのコンポーネントの import と、背景実装コンポーネントの import を突き合わせ、
   共有モジュール（canvas ユーティリティ / パーティクル生成ロジック / 型 / 定数）の有無を確定する。

   ```sh
   grep -n "^import\|from \"" <title-component> <background-component>
   ```

3. **共有があった場合**: 背景を消す前に分離する。
   共有ロジックをタイトル側へ複製・移設し、背景実装を削除してもタイトルが壊れない状態にしてから
   背景を削除する。分離は独立コミット
   （例: `refactor: decouple title animation from background implementation`）にする。
4. **共有がなかった場合**: コード変更は行わず、その旨を本セクションに追記する。
5. いずれの場合も `pnpm exec tsc --noEmit` / `pnpm run test` / `pnpm run lint` を通し、
   タイトルの見た目・挙動を変更しないこと。

> したがって背景実装ディレクトリの **一括削除は禁止**。
> 必ずファイル単位で「削除対象」「維持対象」を選り分けること。

### f-3. 本タスクで追加した回帰テスト

`service/components/header/__tests__/SiteBrand.independence.test.ts` を新設し、
`SiteBrand.tsx` の **モジュールグラフ全体**（直接 import・副作用 import・動的 import・
CSS `@import`・推移的な内部 import）が背景実装（背景モジュール / canvas 描画プリミティブ /
グラデーション / パーティクル描画パッケージ）に依存しないことを契約として固定した。

レビュー指摘を受けた設計上の注意点:

- 背景実装のディレクトリが未確定（(a) 未取得）であるため、`BACKGROUND_MODULE_PATTERN` は
  `animations` 決め打ちをやめ、`animations` / `background` / `backgrounds` / `particles` /
  `canvas` / `constellation` をディレクトリ区切りで拾う形にした。
  **G1 で実ディレクトリが確定したら、そのパスをパターンへ追加すること。**
- SiteBrand のローカル import は 0 件のため、実グラフは 1 ファイルであり、
  そのままではアサーションが自明に真になる。これを避けるため、検出ロジックを純関数
  （`backgroundOffenders` / `canvasOffenders` / `gradientOffenders`）へ切り出し、
  仮想ファイルシステム上の 3 段グラフ（entry → 中間モジュール → 背景 CSS）に対して
  **推移的結合・副作用 import・グラデーション・rAF を実際に検出する**ことを自己検査している。

これは f-1 の範囲（SiteBrand の独立性）を保証するものであり、
**f-2 の判定を代替するものではない**。

---

## (g) 後続サブタスクへの受け渡しサマリ

### g-1. 確定している事項

1. **パーティクル背景専用の外部依存は存在しない** → `service/package.json` とロックファイルは変更不要（✅）。
2. `motion` / `tailwindcss-animate` は背景専用依存ではないため **削除禁止**（✅）。
3. パッケージマネージャの宣言は **pnpm 9.15.0**（✅。ロックファイルの実パスは未取得）。
4. `SiteBrand.tsx` は背景実装に依存しておらず、グラデーションも使用していない（✅）。
   独立性は `SiteBrand.independence.test.ts` で固定済み。
5. 単色背景の定義方針: CSS 変数（ライト/ダーク両方）+ Tailwind トークン経由で参照。
   コンポーネントへのハードコードは不可（定義先の実パスは G6 で確定）。
6. コミット分割: `refactor: remove constellation background animation` と
   `refactor: replace gradients with solid theme colors` の 2 本に分ける。

### g-2. 未取得のまま引き継ぐ事項（着手前に必ず消化）

| # | 内容 | 参照 |
| --- | --- | --- |
| G1 | 背景実装ディレクトリと各ファイルの役割（削除対象／維持対象の選り分け） | (a-1) |
| G2 | 背景のマウント箇所の実パスと行番号 | (a-2) |
| G3 | 実装方式（canvas + rAF か CSS/SVG か） | (b-2) |
| G4 | ロックファイルの実パス、他マネージャのロックファイルの有無 | (c) |
| G5 | **グラデーション使用箇所の全リスト（grep 実行結果）** | (d) |
| G6 | Tailwind config / テーマモジュールの実パスと採用ファイルの確定 | (e) |
| G7 | **維持対象タイトルアニメーションと背景実装の共有有無の判定、必要なら分離** | (f-2) |

上記を消化して本ファイルに追記するまで、削除・単色化の実作業に入らないこと。

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
