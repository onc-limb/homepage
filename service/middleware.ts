import { NextRequest, NextResponse } from "next/server"

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
