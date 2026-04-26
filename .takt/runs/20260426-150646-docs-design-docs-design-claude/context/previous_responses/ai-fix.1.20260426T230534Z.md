修正完了。リント、テスト、コンパイルすべて成功（ビルド時の TURSO_DATABASE_URL エラーは環境変数不足で既存の問題）。

## 確認したファイル
- `service/components/animations/HeroParticleTitle.tsx:148-174` — `start` 関数が `document.fonts.ready.then(start)` と `setTimeout(start, 1500)` の2系統で実行され、listener 登録/cleanup も2つの分岐に重複していたことを確認
- `service/components/news/NewsContent.tsx:31-34, L120` — `useMemo` が `tag` に関わらず `days` 等価を返すだけで dead code、また `inferTags` が空配列時に `["frontend"]` を返すことを確認
- `service/components/news/NewsCard.tsx:111-121` — `formatTime` の try-catch 内で throw しうる API がなく catch が到達不能であることを確認
- `service/app/page.tsx:92-99` — `style` プロパティが空オブジェクト（コメントのみ）であることを確認
- `service/tailwind.config.ts:68-71` — `accent-shadcn` キーが定義されているが `tailwind.config.js` 側にも未定義、コードベースで未参照（grep で確認）
- `service/app/profile/page.tsx:130-145` — `para.startsWith("最も大切にしているのは")` で md 文言とハードコード結合していることを確認
- `service/app/portfolio/[id]/page.tsx:76-78, 294-301, 310-317` — `(category==="personal"?"P/":"W/")+padStart(...)` のロジックが3か所重複していることを確認
- `service/components/footer/Footer.tsx:69` — `© 2026 onclimb` ハードコードを確認
- `service/lib/profile.ts:3` + `service/app/profile/page.tsx:5-6` — `profile.md` を `getProfile()` 内部と page の両方で import していることを確認
- `service/components/skills/index.ts:2` — `SkillBar` を export しているが利用箇所は `SkillCategorySection.tsx:4` の相対 import のみ
- `service/components/theme/index.ts:1` — `useTheme` を export しているが利用箇所は `ThemeToggle.tsx:3` の相対 import のみ

## 実行した検索
- `Grep "accent-shadcn"` → `tailwind.config.ts:68` の1件のみ。js 側にも未定義であることを確認
- `Grep "SkillBar"` / `Grep "useTheme"` → どちらも `index.ts` 経由の参照は無く、相対 import のみ
- `Grep "profileRaw|parseProfile|getParsedProfile"` → 修正後、`profileRaw` の二重 import が解消されていることを確認

## 修正内容

| # | ファイル | 修正 |
|---|---------|------|
| 1 | `HeroParticleTitle.tsx` | `started` フラグを追加して `start()` の多重実行を抑止。listener 登録/cleanup を分岐外に出し、`fallback` を関数スコープに引き上げ |
| 2 | `NewsContent.tsx` | `useMemo`/`filteredDays` を削除して `days` を直接 map。`useMemo` import も除去 |
| 3 | `NewsCard.tsx` | `formatTime` の try-catch を撤去（直線フロー化） |
| 4 | `app/page.tsx` | 空 `style={...}` プロパティと What/How コメントを削除 |
| 5 | `tailwind.config.ts` | 未使用 `accent-shadcn` ブロックを削除 |
| 6 | `docs/profile.md` + `lib/profile.ts` + `profile/page.tsx` | md を `>` blockquote に変更。`ParsedProfile.selfIntroduction` を `IntroBlock[]` (paragraph/pullQuote 判定) に構造化。page のハードコード判定を type 判定に変更 |
| 7 | `portfolio/[id]/page.tsx` | `projectNumber(project, all)` helper を定義し、3 か所を置換 |
| 8 | `footer/Footer.tsx` | `© 2026 onclimb` → `© {new Date().getFullYear()} onclimb` |
| 9 | `lib/profile.ts` + `profile/page.tsx` | `getParsedProfile()` を export し、page の `import profileRaw` を削除（配線責任を lib に集約） |
| 10 | `components/skills/index.ts` + `components/theme/index.ts` | `SkillBar` / `useTheme` の barrel export を削除（既存の相対 import で動作） |
| 11 | `components/news/NewsContent.tsx` | `inferTags` の `tags.length===0 ? ["frontend"] : tags` を `return tags` に変更（タグ未確定時はフォールバックせず空配列） |

修正6に伴い `lib/__tests__/profile.test.ts` の selfIntroduction 期待値を `IntroBlock[]` に対応するよう更新。`pullQuote` ブロックの分類テストも追加。

## テスト結果
- `pnpm test`: ✅ 51 tests passed (5 files)
  - `lib/__tests__/profile.test.ts` (16 tests) — selfIntroduction の構造変更に伴う期待値更新後も全件パス
  - その他 theme / constants / skills / portfolio もすべてパス
- `pnpm lint`: ✅ No ESLint warnings or errors
- `pnpm build`: ✅ 「Compiled successfully」（型チェック通過）。`Failed to collect page data for /news/[date]` は `TURSO_DATABASE_URL` 環境変数不足による既存問題で、本修正範囲外（生成元コード `news/[date]/page.js` の generateStaticParams が DB を要求）