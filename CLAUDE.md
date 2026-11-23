# homepage — Claude Code Rules

onc-limb の個人サイト。Next.js（App Router）を OpenNext で Cloudflare Workers に載せている。
DB は libSQL（本番は Turso、開発は `service/local.db`）を drizzle で扱う。

## 構成

- `service/` — Next.js アプリ本体（pnpm。依存とスクリプトはすべてここ）
  - `app/` — ページと Route Handler（`app/api/`）。`studio/` は管理画面
  - `components/` — UI（`components/ui/` は shadcn/ui）
  - `lib/` — データ取得・検証・ドメインの処理。`lib/db/` にスキーマ、`lib/validations/` に zod のスキーマ
  - `content/` — 取り込むコンテンツ、`drizzle/` — マイグレーション、`scripts/` — DB の運用スクリプト
- `command/` — 補助の CLI（ニュースのクロール）
- `docs/` — デザインの資料

テストは対象の隣か `__tests__/` に置く（vitest + Testing Library）。

## 確認コマンド

リポジトリの直下から `--dir service` で実行する。変更を終える前に 3 つとも通すこと。

```bash
pnpm --dir service exec tsc --noEmit   # 型チェック
pnpm --dir service test                # vitest
pnpm --dir service lint                # eslint（警告は許容、エラーは不可）
```

依存を変えたら `pnpm --dir service install` で lockfile を更新し、`pnpm-lock.yaml` も一緒にコミットする。

## 守ること

- 本番に触れる操作はしない: `pnpm deploy`、`db:*:prod`、`.env.local` を読み込む `db:seed`。必要なら人に頼む。
- `.env*` と `local.db` の中身をコードやログに書き写さない。
- リファクタでは外から見える振る舞い（画面・API の応答・DB に書く内容）を変えない。
  振る舞いを変えたい点が見つかったら、混ぜずに報告する。
- ブランチは `develop` から切り、PR も `develop` へ出す（`main` はリリース用）。
- コミットは Conventional Commits（`feat:` / `fix:` / `refactor:` / `test:` / `docs:` / `chore:` など）。

## 言語

- ドキュメント・議論: 日本語
- コード・コミットメッセージ・ブランチ名・識別子: 英語
