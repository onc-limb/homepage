import Link from "next/link"
import { NAV_ITEMS, SOCIAL_LINKS } from "@/lib/constants"

export default function Footer() {
    return (
        <footer
            className="relative z-[1] mt-20 border-t border-hairline px-0 pb-10 pt-[60px]"
            style={{
                background:
                    "linear-gradient(180deg, transparent, color-mix(in srgb, var(--accent-soft) 60%, transparent))",
            }}
        >
            <div className="mx-auto grid max-w-[var(--container)] grid-cols-1 gap-8 px-6 md:px-10 [@media(min-width:720px)]:grid-cols-4">
                <div className="flex flex-col gap-1.5 text-[13px]">
                    <div className="text-[20px] font-semibold tracking-[-0.02em] text-fg-strong">
                        onclimb
                    </div>
                    <p className="text-xs text-fg-muted">
                        Fullstack engineer / software architect — Tokyo
                    </p>
                </div>
                <div className="flex flex-col gap-1.5 text-[13px]">
                    <div className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-fg-dim">
                        Sitemap
                    </div>
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="py-0.5 text-fg-muted transition-colors duration-150 hover:text-accent"
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
                <div className="flex flex-col gap-1.5 text-[13px]">
                    <div className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-fg-dim">
                        Find me
                    </div>
                    {SOCIAL_LINKS.map((s) => (
                        <a
                            key={s.name}
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-0.5 text-fg-muted transition-colors duration-150 hover:text-accent"
                        >
                            {s.name} ↗
                        </a>
                    ))}
                </div>
                <div className="flex flex-col gap-1.5 text-[13px]">
                    <div className="font-mono text-fg-muted">© {new Date().getFullYear()} onclimb</div>
                </div>
            </div>
        </footer>
    )
}
