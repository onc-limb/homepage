# テスト作成レポート

## 作成テスト
| ファイル | 種別 | テスト数 | 概要 |
|---------|------|---------|------|
| `service/lib/__tests__/constants.test.ts` | 単体 | 7 | NAV_ITEMS の並び替え (`[Home, Profile, Skills, Portfolio, News, Books]`)、Social 除外、href/label/description の必須性、href 一意性 |
| `service/lib/__tests__/theme.test.ts` | 単体 | 7 | 新規 `lib/theme.ts` の `THEME_STORAGE_KEY = "onclimb-theme"`、`DEFAULT_THEME = "dark"`、`THEMES` の二値、`isTheme` 型ガード |
| `service/lib/__tests__/profile.test.ts` | 単体 | 15 | `parseProfile(rawMarkdown)` の 自己紹介 / 経歴 (CURRENT/PRIOR/START 自動採番) / 関心 (`**title** - desc`) / 資格 (年抽出) 抽出と境界条件 |
| `service/lib/__tests__/skills.test.ts` | 単体 | 14 | `RADAR_AXIS_KEYS` の 8 軸 + `getRadarAxes(skills)` のカテゴリ → 軸マッピング、平均集計、0..5 クランプ、空入力 |
| `service/lib/__tests__/portfolio.test.ts` | 単体 | 8 | `findAdjacentProjectIds(ids, currentId)` の prev/next 導出、ラップなし、欠如 id・空配列・重複 id の境界条件 |

付随成果物:
- `service/vitest.config.ts` — `.md` を raw 文字列化するインライン Vite プラグイン + `require.context` を no-op 化するインラインプラグイン + `@` エイリアス解決
- `service/package.json` — `vitest`, `@vitejs/plugin-react`, `jsdom` を devDependencies へ追加。`scripts.test`, `scripts.test:watch` 追加
- `ASSUMPTIONS.md` (リポジトリルート) — 計画未指定の API 契約 (theme export シンボル / parseProfile スキーマ / period 自動採番ルール / 軸マッピング表 / findAdjacentProjectIds シグネチャ / vitest 採用理由) を記録

## 実行結果（参考）
実装前のためテスト失敗・import エラーは想定内。

実行コマンド: `cd service && pnpm test`
実行サマリ: `Test Files  5 failed (5)` / `Tests  41 failed | 3 passed (44)`

| 状態 | 件数 | 備考 |
|------|------|------|
| Pass | 3 | NAV_ITEMS が 6 件 / 全エントリに href・label・description が揃う / href が一意 — いずれも実装後も成立すべき不変条件 |
| Fail / Import Error（想定内） | 41 | 38 件は `parseProfile is not a function` / `getRadarAxes is not a function` / `findAdjacentProjectIds is not a function` (未実装関数)。`theme.test.ts` は `Cannot find module '@/lib/theme'` で 7 件すべて collect 段階失敗 (新規モジュール未作成)。残り 4 件は NAV_ITEMS の Home 先頭・順序・Social 除外の期待値ミスマッチ (未並び替え) |
| Error（要対応） | 0 | 既存 import パスミス等は無し。テスト基盤 (vitest plugins) は正常動作 |

## 備考（判断がある場合のみ）
- **インテグレーションテストは作成せず**。判定基準 (3 モジュール横断データフロー / 新ステータス合流 / 新オプション伝搬) いずれにも該当しない。テーマ切替の状態合流は React component (`ThemeProvider`) 側の責務でありコンポーネントテストの世界。本ステップは jsdom + RTL 未導入の現状を踏まえユニットに限定した。
- **プロダクションコードを編集せずテスト可能化**。webpack 専用の `.md` `asset/source` import と `require.context` を、`vitest.config.ts` のインライン Vite プラグインで吸収。`lib/skills.ts` の `require.context` を no-op スタブに置換することで top-level 評価でクラッシュさせない。
- **純粋関数前提でテスト契約を設計**。`getRadarAxes(skills)`, `findAdjacentProjectIds(ids, currentId)`, `parseProfile(rawMarkdown)` はすべて引数で入力を受け取る純粋関数として契約。実装担当が getProjectIds() ベースのラッパー (例: `getAdjacentProjectIds(currentId)`) を書く場合、内部で純粋関数を呼ぶ形にしてほしい旨を ASSUMPTIONS.md セクション 4 に記載。
- **推測した契約**は `ASSUMPTIONS.md` に集約: (1) lib/theme.ts の export シンボル名、(2) parseProfile の `period` 自動採番ルール (先頭=CURRENT / 末尾=START / 中間=PRIOR)、(3) SkillCategory → 8 軸のマッピング (backend = framework+api、infra = compute+networking+storage+IaC+container、devops = devops-sre+tools、sec = security+auth、ai = ai-ml、low = language、arch = methodology、frontend = markup-style)、(4) `findAdjacentProjectIds` のシグネチャ。実装が異なる方針を採る場合は対応するテストを修正可。
- **テスト命名・配置**: 既存パターン無しのため `lib/__tests__/*.test.ts` の Next.js 慣例配置を採用。Given-When-Then をコメントで記述し 1 テスト 1 概念を厳守。
- **Pass している 3 件**は計画変更で破壊されない構造的不変条件 (件数 6 / 必須プロパティ揃う / href 一意) であり、実装後もそのまま維持される想定。実装完了時には全 51 アサーション (集計上は 44 ヘッダー) が通る設計。