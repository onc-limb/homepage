import { readMigrationFiles } from "drizzle-orm/migrator"
import { connect } from "./db-target"

/**
 * 既に中身がある DB を、マイグレーション管理下へ載せ替える（1 回だけ実行する）。
 *
 * これまでスキーマは `drizzle-kit push` で当てており、マイグレーション履歴が無い。
 * その DB に対して migrate をそのまま流すと 0000 の CREATE TABLE が既存テーブルと
 * ぶつかって落ちるため、「現状は 0000 まで適用済み」と __drizzle_migrations に記録して
 * 出発点を揃える。以降の差分は 0001 以降として通常どおり適用される。
 *
 *   ローカル: pnpm db:baseline
 *   本番    : pnpm db:baseline:prod
 */
async function run() {
    const { client } = connect()

    const migrations = readMigrationFiles({ migrationsFolder: "./drizzle" })
    if (migrations.length === 0) {
        throw new Error(
            "drizzle/ にマイグレーションがありません。先に db:generate を実行してください"
        )
    }

    const baseline = migrations[0]

    // 中身のある DB かを確認する。空の DB にベースラインを打つと、テーブルが無いのに
    // 「適用済み」と記録されてしまい、以後 migrate しても何も作られなくなる。
    const existing = await client.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name <> '__drizzle_migrations'"
    )
    if (existing.rows.length === 0) {
        console.error(
            "この DB は空です。ベースラインではなく `db:migrate` で作成してください（何もしていません）"
        )
        client.close()
        process.exit(1)
    }
    console.log(`既存テーブル: ${existing.rows.map((r) => r.name).join(", ")}`)

    await client.execute(`CREATE TABLE IF NOT EXISTS __drizzle_migrations (
	id SERIAL PRIMARY KEY,
	hash text NOT NULL,
	created_at numeric
)`)

    const already = await client.execute("SELECT count(*) AS n FROM __drizzle_migrations")
    if (Number(already.rows[0].n) > 0) {
        console.log("既にマイグレーション履歴があります。何もしません")
        client.close()
        return
    }

    await client.execute({
        sql: 'INSERT INTO __drizzle_migrations ("hash", "created_at") VALUES (?, ?)',
        args: [baseline.hash, baseline.folderMillis],
    })

    console.log(
        `ベースラインを記録しました: ${baseline.hash.slice(0, 12)}… (created_at=${baseline.folderMillis})`
    )
    console.log("以降 `db:migrate` は 0001 以降の差分だけを適用します")

    client.close()
}

run().catch((err) => {
    console.error("Baseline failed:", err)
    process.exit(1)
})
