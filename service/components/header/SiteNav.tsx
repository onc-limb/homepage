"use client"

import Link from "next/link"
import { NAV_ITEMS } from "@/lib/constants"
import { isNavItemActive } from "./nav-utils"

export function SiteNav({ pathname }: { pathname: string }) {
    return (
        <nav
            aria-label="primary"
            className="hidden justify-center gap-1 [@media(min-width:880px)]:flex"
        >
            {NAV_ITEMS.map((item) => {
                const active = isNavItemActive(pathname, item.href)
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={
                            "site-nav__link relative rounded-[var(--radius)] px-[14px] py-2 text-[13.5px] transition-colors duration-200 " +
                            (active ? "is-active text-fg-strong" : "text-fg-muted hover:text-fg-strong")
                        }
                    >
                        <span>{item.label}</span>
                    </Link>
                )
            })}
        </nav>
    )
}
