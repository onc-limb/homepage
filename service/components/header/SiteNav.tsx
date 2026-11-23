"use client"

import Link from "next/link"
import { TEXT_LINK } from "@/components/ds/link-styles"
import { NAV_ITEMS } from "@/lib/constants"
import { isNavItemActive } from "./nav-utils"

export function SiteNav({ pathname }: { pathname: string }) {
    return (
        <nav
            aria-label="サイト"
            className="hidden justify-center [@media(min-width:880px)]:flex"
        >
            {NAV_ITEMS.map((item) => {
                const active = isNavItemActive(pathname, item.href)
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={`${TEXT_LINK} font-ds-prose text-ds-sm px-ds-2${
                            active ? " decoration-ds-accent decoration-2 font-bold" : ""
                        }`}
                    >
                        {item.label}
                    </Link>
                )
            })}
        </nav>
    )
}
