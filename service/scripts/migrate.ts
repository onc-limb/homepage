import { drizzle } from "drizzle-orm/libsql"
import { migrate } from "drizzle-orm/libsql/migrator"
import { connect } from "./db-target"

/**
 * drizzle/ 配下の未適用マイグレーションを順に適用する。
 *
 * 適用済みかどうかは __drizzle_migrations テーブルの created_at で判定される
 * （drizzle-orm/libsql/migrator の仕様）。既存 DB を初めてこの仕組みに載せるときは、
 * 先に `db:baseline` で現状を適用済みとして登録すること。
 *
 *   ローカル: pnpm db:migrate
 *   本番    : pnpm db:migrate:prod
 */
async function run() {
    const { client } = connect()
    const db = drizzle(client)

    await migrate(db, { migrationsFolder: "./drizzle" })

    const applied = await client.execute(
        "SELECT hash, created_at FROM __drizzle_migrations ORDER BY created_at"
    )
    console.log(`適用済みマイグレーション: ${applied.rows.length} 件`)
    for (const row of applied.rows) {
        console.log(`  ${String(row.hash).slice(0, 12)}…  created_at=${row.created_at}`)
    }

    client.close()
}

run().catch((err) => {
    console.error("Migration failed:", err)
    process.exit(1)
})
