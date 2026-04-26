import Link from "next/link"

const PAGE_LABELS: Record<string, string> = {
    "/": "home",
    "/profile": "profile",
    "/skills": "skills",
    "/portfolio": "portfolio",
    "/news": "news",
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
            <span
                aria-hidden="true"
                className="relative grid h-[22px] w-[22px] place-items-center overflow-hidden rounded-md"
                style={{
                    background: "linear-gradient(140deg, var(--accent), var(--indigo))",
                }}
            >
                <span
                    className="absolute inset-[3px] rounded-[4px]"
                    style={{
                        background: "var(--bg)",
                        backgroundImage:
                            "radial-gradient(circle at 30% 30%, var(--accent-strong) 0 2px, transparent 3px), radial-gradient(circle at 70% 70%, var(--cyan) 0 1.5px, transparent 2.5px)",
                    }}
                />
            </span>
            <span className="font-semibold text-fg-strong">onclimb</span>
            <span className="text-accent">/</span>
            <span className="text-fg-muted">{pageKey(pathname)}</span>
        </Link>
    )
}
