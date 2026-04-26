# ASSUMPTIONS

このドキュメントは、計画レポートに明示されていなかったため write_tests ステップで
推測したテスト契約を記録する。実装担当 (implement ステップ) は、各推測を実装で
具現化する、または計画から外れる場合はテストを修正すること。

---

## 1. lib/theme.ts (新規モジュール) の API

### 不足情報

計画レポート 4.1 は `lib/theme.ts` を「テーマキー / 型 / 既定値の定数」と記述している
が、export シンボルの正確な名前と形は未指定。

### 推測した契約

```ts
export const THEME_STORAGE_KEY: "onclimb-theme"  // localStorage key
export const DEFAULT_THEME: "dark"               // 設計素案のダーク既定
export const THEMES: readonly ["dark", "light"]
export type Theme = (typeof THEMES)[number]
export function isTheme(value: unknown): value is Theme
```

### 根拠

- `docs/design/shared/shell.js:6-15` の `THEME_KEY = "onclimb-theme"` と
  `getTheme() = localStorage.getItem(THEME_KEY) || "dark"` から逆算。
- 設計素案は dark / light の二値のみ切替可能。

### テスト箇所

- `service/lib/__tests__/theme.test.ts`

---

## 2. lib/profile.ts の `parseProfile(rawMarkdown: string)` 関数

### 不足情報

計画レポート 4.1 / 3 は「`parseSections` を強化し、構造化データに」と書いているが、
新しい関数のシグネチャ・戻り値の形・既存 `getProfile()` との関係は未指定。

### 推測した契約

```ts
export interface CareerItem {
    period: "CURRENT" | "PRIOR" | "START"
    role: string
    bullets: string[]
}
export interface InterestItem { title: string; description: string }
export interface CertItem { title: string; year: string }
export interface ParsedProfile {
    selfIntroduction: string
    career: CareerItem[]
    interests: InterestItem[]
    certs: CertItem[]
}
export function parseProfile(rawMarkdown: string): ParsedProfile
```

`period` は markdown 上に存在しないので、配列順序から自動採番:
- 先頭 → CURRENT
- 末尾 → START
- それ以外 → PRIOR
（career が 1 件のみの場合は CURRENT のみ）

### 根拠

- `docs/design/profile.html:354-394` で career 各エントリに `CURRENT` / `PRIOR` /
  `START` が手動付与されており、新しい順 → 古い順の並びになっている。
- `docs/profile.md` の `### 役職 + 箇条書き` 構造に対応。
- 関心 / 資格は `### サブセクション` 内のリスト要素であり、ネストされた章
  (`## エンジニアとしての今` の下) でも parser が拾えるよう設計。

### テスト箇所

- `service/lib/__tests__/profile.test.ts`

---

## 3. lib/skills.ts の `getRadarAxes()` 関数と軸マッピング

### 不足情報

計画レポート 3 は `getRadarAxes()` の戻り値形と、SkillCategory → 8 軸への具体マッピングを
「マッピング: backend = `framework`+`api` の平均など」とのみ記述。「など」以降は不明。

### 推測した契約

```ts
export const RADAR_AXIS_KEYS = [
    "backend", "frontend", "infra", "arch",
    "ai", "devops", "low", "sec",
] as const
export type RadarAxisKey = (typeof RADAR_AXIS_KEYS)[number]
export interface RadarAxis {
    key: RadarAxisKey
    label: string
    value: number  // 0..5
}
export function getRadarAxes(skills: Skill[]): RadarAxis[]
```

### 推測した SkillCategory → 軸マッピング

| 軸 | 含まれる SkillCategory |
|----|----------------------|
| backend | framework, api |
| frontend | markup-style |
| infra | compute, networking, storage, IaC, container |
| arch | methodology |
| ai | ai-ml |
| devops | devops-sre, tools |
| low | language |
| sec | security, auth |

各軸の値は対応カテゴリの `level` の平均。対応スキルが 0 件のときは 0。
`integration`, `database`, `testing` は計画にマッピング指示が無く、
今回のテストでは寄与しない前提で書いている。実装側で別マッピングを採用するなら、
テストの軸期待値を調整すること。

### 根拠

- 8 軸は `docs/design/skill.html:217-224` のリテラル定義。
- 平均集計は計画レポート「`framework`+`api` の平均」の文言。

### テスト箇所

- `service/lib/__tests__/skills.test.ts`

---

## 4. lib/portfolio.ts の `findAdjacentProjectIds()` 純粋関数

### 不足情報

計画レポート 3 は portfolio 詳細 pager について「`getProjectIds()` の順序で前後を導出」
としか書いていない。専用ヘルパー関数の有無・名称は未指定。

### 推測した契約

```ts
export function findAdjacentProjectIds(
    ids: string[],
    currentId: string
): { prev?: string; next?: string }
```

- `ids` 配列内で `currentId` が見つからない場合は両方 undefined
- 末尾でラップしない（`next` は最後の要素では undefined）
- 重複 id は最初のインデックスを採用

### 根拠

- ページコンポーネントから直接 `getProjectIds()` を呼びインデックスを引く実装も
  可能だが、テスト容易性 (純粋関数化) の観点で別ヘルパーを推奨。
- 「1 関数 1 責務 / 30 行目安」のポリシーに沿う。

### テスト箇所

- `service/lib/__tests__/portfolio.test.ts`

### 実装担当へのノート

実装担当が `getProjectIds()` ベースの `getAdjacentProjectIds(currentId)` を直接
書く場合は、内部で `findAdjacentProjectIds` を呼ぶ形にして純粋関数を export して
ほしい (テストが落ちないようにするため)。代替として、テストを
`findAdjacentProjectIds` ではなく `getAdjacentProjectIds` に書き換えることも
検討してよい。

---

## 5. テスト基盤 (vitest + jsdom + plugins)

### 不足情報

既存サイトには testing framework が未導入だった。計画レポートも追加を明記していない。

### 推測した対応

- `vitest` + `jsdom` + `@vitejs/plugin-react` を devDependencies に追加。
- `service/vitest.config.ts` を新規作成し、以下のインライン Vite プラグインを追加:
  - `markdown-as-raw`: `.md` の import を default-export 文字列にトランスフォーム
    （production ビルドの `next.config.mjs` の `asset/source` に相当）。
  - `require-context-stub`: webpack 専用 `require.context(...)` 呼び出しを
    no-op スタブに置換し、テスト時に top-level 評価でクラッシュしないようにする。
- 既存テストパターンが無かったため、`lib/__tests__/*.test.ts` のディレクトリ構成を
  採用 (Next.js コミュニティで一般的な配置)。

### 根拠

- order.md「既存サイトのテストが通ること」を満たすには test runner が必要。
- 計画 7 章の「実装方針」では production build の確認のみ言及されており、
  test runner 選定は Coder の判断に委ねられる形だった。
- 既存コードに変更を加えずテスト可能にするため、ビルド系特殊機能 (asset/source,
  require.context) をプラグインで吸収する方式を選択。

### 実装担当へのノート

- 実装フェーズで `pnpm install` を実行して新規 devDependencies を反映する必要あり。
- テストが落ちる場合、まず `vitest.config.ts` のプラグインが期待通り動作しているか
  確認すること。
