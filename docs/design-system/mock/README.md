# モックの読み方

形・並び・寸法の見本。本人が画面で見て「形とレイアウトはこれでよい」と決めたもの。
実装は Next.js の部品として作り直す。**このファイルのコードの書き方はまねない。寸法・並び・色の使い方・文面をここから読み取る。**

## ファイル

| ファイル | 中身 |
|---|---|
| `Maze.dc.html` | 案内所（Home）・最初の画面（外観）・階のページ・のぞき窓。地図、フロアガイド、案内人の PC、扉、外観の描き方 |
| `Site.dc.html` | 分類のページ（プロフィール・連絡先・経歴・スキル・自己学習・ポートフォリオ）と詳細のページ。前後へ移る扉 |
| `Main.dc.html` | 色と文字の見本 |

## 書式

デザインキャンバス用の独自の書式で、ブラウザで開いても動かない。上半分がテンプレート、下半分（`<script>`）がデータと計算。

- `{{a.b}}` は、下の `class Component` の `renderVals()` が返す値の差し込み
- `<sc-if value="{{x}}">` は条件、`<sc-for list="{{xs}}" as="x">` は繰り返し
- `<dc-import name="Maze" mode="peek" ...>` は、`Maze.dc.html` をのぞき窓の形で埋め込んでいる
- スタイルはすべて `style="..."` に直に書いてある。実装では Tailwind のユーティリティと `--ds-*` のトークンに置き換える
- 色は `c.bg` のように引いている。対応は下の表

| モック | トークン | モック | トークン |
|---|---|---|---|
| `c.bg` | `--ds-bg` | `c.wd` | `--ds-map-wood` |
| `c.sf` | `--ds-surface` | `c.wdl` | `--ds-map-wood-joint` |
| `c.fg` | `--ds-fg` | `c.wdw` / `c.wl` | `--ds-map-wood-wall` |
| `c.mu` | `--ds-fg-muted` | `c.wdd` | `--ds-map-wood-shade` |
| `c.bd` | `--ds-border` | `c.stn` / `c.stl` / `c.stw` / `c.std` | `--ds-map-stone` / `-joint` / `-wall` / `-shade` |
| `c.dl` | `--ds-border-strong` | `c.dk` / `c.dkl` | `--ds-map-deck` / `-joint` |
| `c.ac` | `--ds-accent` | `c.hb` | `--ds-map-corridor` |
| `c.onac` | `--ds-on-accent` | `c.at` | `--ds-map-lit` |
| `c.gr` | `--ds-prompt` | `c.sh` | `--ds-map-slab` |
| `c.bl` | `--ds-link` | `c.tr1` / `c.tr2` / `c.trk` / `c.hill` | `--ds-map-tree-1` / `-tree-2` / `-trunk` / `-hill` |

## モックと実装で変えるところ

- **データはモックの手書き。** 実装では `lib/building` のデータ（`FLOORS`・`getEntries()`・`layoutFloor()`）から作る。モックの技術名・件数・検索の結果は見本であり、写さない
- **板の目地**を、モックは `repeating-linear-gradient` で描いている。実装では CSS のグラデーションを使わない（`lib/__tests__/no-gradients.test.ts` が禁じている）。SVG の pattern など、グラデーションを使わない方法で同じ見た目にする
- モックの「初期 / ターミナル実装後」の切替、テーマの切替ボタン、`stage` `layout` などの props は、キャンバスで見比べるための仕掛け。実装しない
- ノートと本棚（`notes` `books`）、中間部屋（`hub`。`h:` で始まる部屋、`find ~ -type l` のコマンド）は、まだ作らない
- モックの `head.lead`・`pcNote`・`room.kicker` など、テンプレートから参照されていない値は、決定で外した説明文の名残。画面には出さない

## どこを見るか

| 作るもの | 見る場所（`Maze.dc.html`） |
|---|---|
| 配置の計算 | `function place(...)` と、その下の `FLOORS.forEach`（部屋・廊下・階段・扉・1F の入口とデッキ） |
| 地図 | テンプレートの `sc-for list="{{floors}}"` の中（床板・部屋・壁・廊下・階段・扉・ラベル）と、`renderVals()` の `floors` `tags` を作るところ |
| フロアガイド | `floorBtns`（案内所の左）と `peekGuide`（のぞき窓の左） |
| 案内人の PC | `guide`（文章と行き先）、`room`（置いてあるもの）、`cmds` と `out`（探しもの） |
| 扉 | `L.doorW` `L.doorH` を使っているところ（大）と、`B.leaf` `B.frame` を使っているボタン（小） |
| 外観と中に入る動き | `X`（`plates` `faces` `tops` `door` `hills` `treesBack` `treesFront`）と `S`、定数 `TREES` `HILLS` |
| のぞき窓 | `isPeek` の中 |
| 狭い画面 | `L` の 2 つ目（`max: 390`）と、`desk` が false のときの分岐 |

分類と詳細のページの並び・表・一覧・前後へ移る扉は `Site.dc.html` を見る。
