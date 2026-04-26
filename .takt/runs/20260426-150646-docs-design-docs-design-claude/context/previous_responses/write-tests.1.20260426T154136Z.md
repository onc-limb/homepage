作業完了しました。サマリを報告します。

## 実施内容

**テスト基盤の追加** (プロダクションコードは一切変更せず):
- `service/package.json` — `vitest`, `@vitejs/plugin-react`, `jsdom` を devDependencies に追加。`pnpm test` / `pnpm test:watch` スクリプトを追加
- `service/vitest.config.ts` — `.md` を raw 文字列に変換するプラグインと `require.context` を no-op スタブ化するプラグインを内蔵 (webpack 専用の I/O をテスト時に吸収)

**テストファイル 5 本** (`service/lib/__tests__/`):
| ファイル | 検証対象 | 件数 |
|---------|---------|------|
| `constants.test.ts` | NAV_ITEMS が `[Home, Profile, Skills, Portfolio, News, Books]` 順、Social 除外 | 7 |
| `theme.test.ts` | 新規 `lib/theme.ts` の THEME_STORAGE_KEY / DEFAULT_THEME / isTheme | 7 |
| `profile.test.ts` | `parseProfile()` の自己紹介・経歴 (period 自動採番)・関心・資格抽出 | 15 |
| `skills.test.ts` | `getRadarAxes()` の 8 軸 + カテゴリ別平均集計 | 14 |
| `portfolio.test.ts` | `findAdjacentProjectIds()` 純粋関数の prev/next 導出 | 8 |

**ASSUMPTIONS.md** をプロジェクトルートに新規作成。計画レポートで未指定だった API 契約 (theme モジュール export 形・parseProfile スキーマ・SkillCategory→軸マッピング・findAdjacentProjectIds シグネチャ・vitest 採用理由) をすべて記載。

## テスト実行結果 (実装前)

```
Test Files  5 failed (5)
     Tests  41 failed | 3 passed (44)
```

失敗内訳: 38 件は未実装シンボル (`X is not a function`)、1 ファイル分は `lib/theme.ts` 未作成、4 件は NAV_ITEMS 並び替え未実施。これらはすべて implement ステップで解消される想定。3 件のパスは実装後も成立する不変条件 (件数 6・href 一意 等)。

## 設計判断

- **インテグレーションテストは作成せず** (3 つ以上のモジュール横断・新ステータス伝搬・新オプション伝搬のいずれにも該当せず、各 lib 関数は単一責務)
- **純粋関数を前提にテスト契約** (`getRadarAxes(skills)`, `findAdjacentProjectIds(ids, currentId)`, `parseProfile(rawMarkdown)` はすべて引数受け取り型) — webpack 専用 import に依存せずテスト可能。実装担当には ASSUMPTIONS.md で「ラッパー関数を書く場合は内部で純関数を呼ぶ形にしてほしい」旨を記載。

レポートを `.takt/runs/.../reports/test-report.md` に出力済みです。