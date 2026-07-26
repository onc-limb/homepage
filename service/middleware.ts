import { NextRequest, NextResponse } from "next/server"

// Next.js 16 は middleware を deprecated とし proxy への改名を促すが、proxy は
// Node.js ランタイム固定で、@opennextjs/cloudflare が Node.js middleware を
// サポートしていない（build 時に "Node.js middleware is not currently supported.
// Consider switching to Edge Middleware." で失敗する）。
// Cloudflare Workers へデプロイしている間は edge ランタイムで動く middleware を維持する。
export function middleware(request: NextRequest) {
    const sessionCookie =
        request.cookies.get("authjs.session-token") ??
        request.cookies.get("__Secure-authjs.session-token")

    if (!sessionCookie) {
        const signInUrl = new URL("/api/auth/signin", request.url)
        signInUrl.searchParams.set("callbackUrl", request.url)
        return NextResponse.redirect(signInUrl)
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/studio/:path*"],
}
