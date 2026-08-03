# DB マイグレーション運用

スキーマ変更は **`drizzle-kit generate` でマイグレーションファイルを作り、`migrate` で適用する**。
以前使っていた `drizzle-kit push` は廃止した（`db:push` スクリプトも削除済み）。

## なぜ push をやめたか

`push` は「スキーマ定義」と「DB から読み取った現状」を比較して差分を当てる方式だが、
drizzle-kit は **SQLite の CHECK 制約を読み取れない**（[drizzle-orm#4574](https://github.com/drizzle-team/drizzle-orm/issues/4574)）。

そのため CHECK 制約を持つテーブルは常に「差分あり」と誤判定される。SQLite では列定義の変更＝
テーブル再作成なので、push はテーブルを作り直そうとし、その過程で既存インデックスを重ねて
作ろうとして落ちる。

```
LibsqlError: SQLITE_ERROR: index articles_slug_unique already exists
```

このリポジトリには `articles_status_check` と `contacts_category_check` があるため、
**push はスキーマ変更のたびに失敗する状態だった**。issue のラベルは `bug/fixed-in-beta` で、
安定版にはまだ来ていない。

`generate` は DB を読まず、前回のスナップショット（`drizzle/meta/*_snapshot.json`）と
スキーマ定義を比較する。DB の introspection を挟まないので、このバグの影響を受けない。

実際、CHECK 制約を持つ `contacts` にカラムを足して試すと、生成されるのは 1 行だけになる。

```sql
ALTER TABLE `contacts` ADD `tmp_migration_probe` text;
```

## 通常の流れ

1. `lib/db/schema.ts` を編集する
2. `pnpm db:generate` — `drizzle/NNNN_*.sql` とスナップショットが生成される
3. **生成された SQL を必ず読む**。意図しないテーブル再作成やデータ喪失が含まれていないか確認する
4. `pnpm db:migrate` — ローカル（`file:local.db`）へ適用して動作確認
5. 生成物を含めてコミットする（`drizzle/` は git 管理下）
6. 本番へは `pnpm db:migrate:prod` で適用する

## コマンド

| コマンド | 対象 | 用途 |
| --- | --- | --- |
| `pnpm db:generate` | — | スキーマ差分からマイグレーションを生成 |
| `pnpm db:migrate` | ローカル | 未適用分を適用 |
| `pnpm db:migrate:prod` | **本番** | 未適用分を適用 |
| `pnpm db:baseline` | ローカル | 既存 DB を管理下に載せる（初回のみ） |
| `pnpm db:baseline:prod` | **本番** | 同上 |

接続先は `TURSO_DATABASE_URL` の有無で決まる（無ければ `file:local.db`）。
`:prod` 付きだけが `--env-file=.env.local` を渡す構成で、本番を触るときは明示的に選ぶことになる。
どのスクリプトも実行時に接続先を表示する。

## ベースライン（初回のみ・実施済み）

`push` 運用時代の DB にはマイグレーション履歴が無いため、そこへ `migrate` を流すと
0000 の `CREATE TABLE` が既存テーブルとぶつかる。`db:baseline` は「現状は 0000 まで適用済み」と
`__drizzle_migrations` に記録して出発点を揃える（テーブルは作らない）。

空の DB に対しては誤って実行しないようガードしてあり、その場合は `db:migrate` を使う。

ローカル・本番とも適用済みなので、通常このコマンドを使うことはない。

## 注意

- **`drizzle/` を手で編集しない。** スナップショットと SQL の整合が崩れると以降の差分が壊れる
- 適用済みのマイグレーションファイルは書き換えない。修正は新しいマイグレーションで行う
- 破壊的な変更（カラム削除・型変更）は、生成された SQL を読んだうえで、
  必要ならデータ移行の SQL を手で追記してから適用する
