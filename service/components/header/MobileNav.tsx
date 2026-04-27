"use client"

import Link from "next/link"
import { useState } from "react"
import { NAV_ITEMS } from "@/lib/constants"
import { isNavItemActive } from "./nav-utils"

export function MobileNav({ pathname }: { pathname: string }) {
    const [open, setOpen] = useState(false)

    return (
        <>
            <button
                type="button"
                aria-label="open menu"
                onClick={() => setOpen((v) => !v)}
                className="grid h-[38px] w-[38px] place-content-center justify-items-center gap-1 rounded-[var(--radius)] border border-hairline-strong [@media(min-width:880px)]:hidden"
            >
                <span className="block h-[1.5px] w-4 bg-fg transition-all duration-200" />
                <span className="block h-[1.5px] w-4 bg-fg transition-all duration-200" />
                <span className="block h-[1.5px] w-4 bg-fg transition-all duration-200" />
            </button>
            {open && (
                <div
                    className="absolute left-0 right-0 top-full flex flex-col border-t border-hairline px-6 pb-4 pt-2 [@media(min-width:880px)]:hidden"
                    style={{ background: "var(--bg-elev)" }}
                >
                    {NAV_ITEMS.map((item) => {
                        const active = isNavItemActive(pathname, item.href)
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className={
                                    "border-b border-hairline py-2.5 text-sm " +
                                    (active ? "text-accent" : "text-fg-muted")
                                }
                            >
                                {item.label}
                            </Link>
                        )
                    })}
                </div>
            )}
        </>
    )
}
