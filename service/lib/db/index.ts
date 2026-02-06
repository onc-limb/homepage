import { createClient } from "@libsql/client/web"
import { drizzle } from "drizzle-orm/libsql/web"
import * as schema from "./schema"

type Database = ReturnType<typeof drizzle<typeof schema>>

function createDb(): Database {
    const url = process.env.TURSO_DATABASE_URL
    const authToken = process.env.TURSO_AUTH_TOKEN

    // ローカル開発用: file: プロトコルをサポートする Node.js 版クライアントを使用
    // 本番ビルドでは @libsql/client が webpack alias で除外されるため使用不可
    if (process.env.NODE_ENV !== "production" && (!url || url === "libsql://" || url.startsWith("file:"))) {
        const { createClient: createLocalClient } = require("@libsql/client")
        return drizzle(createLocalClient({ url: url?.startsWith("file:") ? url : "file:local.db" }), { schema })
    }

    if (!url) {
        throw new Error("TURSO_DATABASE_URL is required in production")
    }

    return drizzle(createClient({ url, authToken: authToken || undefined }), { schema })
}

// ビルド時のモジュール評価で createDb() が実行されないよう遅延初期化
let _db: Database
export const db: Database = new Proxy({} as Database, {
    get(_, prop) {
        if (!_db) _db = createDb()
        const value = (_db as any)[prop]
        return typeof value === "function" ? value.bind(_db) : value
    },
})
