import * as React from "react"
import Image from "next/image"
import Link from "next/link"

const PAGE_LABELS: Record<string, string> = {
    "/": "home",
    "/profile": "profile",
    "/skills": "skills",
    "/portfolio": "portfolio",
    "/books": "books",
    "/social": "social",
}

function pageKey(pathname: string): string {
    if (pathname === "/") return "home"
    const normalized = pathname.replace(/\/$/, "")
    if (PAGE_LABELS[normalized]) return PAGE_LABELS[normalized]
    // For dynamic sub-routes (e.g. /portfolio/onc-limb) fall back to the top-level label.
    const top = "/" + normalized.split("/")[1]
    return PAGE_LABELS[top] ?? "home"
}

export function SiteBrand({ pathname }: { pathname: string }) {
    return (
        <Link
            href="/"
            aria-label="onclimb home"
            className="inline-flex items-center gap-[10px] font-mono text-[13px] tracking-[0.02em] text-fg-muted"
        >
            {/* 全ページのヘッダーで必ずファーストビューに入るため、
                既定の遅延読み込みをやめて LCP を遅らせないようにする。 */}
            <Image
                src="/MainLogo.png"
                alt="onclimb logo"
                width={22}
                height={22}
                priority
                className="h-[22px] w-[22px] rounded-md object-contain"
            />
            <span className="font-semibold text-fg-strong">onclimb</span>
            <span className="text-accent">/</span>
            <span className="text-fg-muted">{pageKey(pathname)}</span>
        </Link>
    )
}
