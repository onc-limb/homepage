import { createClient } from "@libsql/client/web"
import { drizzle } from "drizzle-orm/libsql"
import * as schema from "./schema"

const url = process.env.TURSO_DATABASE_URL
const authToken = process.env.TURSO_AUTH_TOKEN

function createDb() {
    if (!url || url === "libsql://" || url.startsWith("file:")) {
        // ローカル開発用: file: プロトコルをサポートする Node.js 版クライアントを使用
        const { createClient: createLocalClient } = require("@libsql/client")
        return drizzle(createLocalClient({ url: url?.startsWith("file:") ? url : "file:local.db" }), { schema })
    }

    return drizzle(createClient({ url, authToken: authToken || undefined }), { schema })
}

export const db = createDb()
