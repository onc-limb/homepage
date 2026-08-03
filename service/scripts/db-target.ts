import { createClient, type Client } from "@libsql/client"

/**
 * マイグレーション系スクリプトの接続先を決める。
 *
 * TURSO_DATABASE_URL が無ければローカルの file:local.db に落ちる（lib/db/index.ts と同じ規約）。
 * 本番へ流すときだけ `--env-file=.env.local` を明示的に付ける運用にして、
 * 「気づかず本番を触っていた」が起きないようにする。
 */
export function resolveTarget(): { url: string; authToken?: string } {
    const url = process.env.TURSO_DATABASE_URL || "file:local.db"
    return { url, authToken: process.env.TURSO_AUTH_TOKEN || undefined }
}

export function isLocal(url: string): boolean {
    return url.startsWith("file:")
}

/** 接続先をログに出す。認証情報は含めない。 */
export function describeTarget(url: string): string {
    if (isLocal(url)) return `ローカル (${url})`
    try {
        return `リモート (${new URL(url).host})`
    } catch {
        return "リモート (不明なURL)"
    }
}

export function connect(): { client: Client; url: string } {
    const { url, authToken } = resolveTarget()
    console.log(`接続先: ${describeTarget(url)}`)
    return { client: createClient({ url, authToken }), url }
}
