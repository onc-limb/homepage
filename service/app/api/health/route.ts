import { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
    const url = process.env.TURSO_DATABASE_URL
    const token = process.env.TURSO_AUTH_TOKEN

    const diagnostics: Record<string, unknown> = {
        hasUrl: !!url,
        urlProtocol: url ? url.split("://")[0] : null,
        urlHost: url ? url.split("://")[1]?.split("/")[0] : null,
        hasToken: !!token,
        tokenLength: token?.length ?? 0,
        nodeEnv: process.env.NODE_ENV,
    }

    // Try a simple query
    try {
        const { createClient } = await import("@libsql/client/web")
        const client = createClient({
            url: url!,
            authToken: token || undefined,
        })
        const result = await client.execute("SELECT 1 as ok")
        diagnostics.dbConnection = "success"
        diagnostics.dbResult = result.rows
    } catch (e: unknown) {
        const err = e as Error & { code?: string; cause?: unknown }
        diagnostics.dbConnection = "failed"
        diagnostics.errorMessage = err.message
        diagnostics.errorName = err.name
        diagnostics.errorCode = err.code
        diagnostics.errorCause = err.cause
            ? String(err.cause)
            : undefined
    }

    return Response.json(diagnostics)
}
