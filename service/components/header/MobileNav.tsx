"use client"

import Link from "next/link"
import { useId, useRef, useState, type KeyboardEvent } from "react"
import { NAV_ITEMS } from "@/lib/constants"
import { isNavItemActive } from "./nav-utils"

export function MobileNav({ pathname }: { pathname: string }) {
    const [open, setOpen] = useState(false)
    const menuId = useId()
    const toggleRef = useRef<HTMLButtonElement>(null)

    function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
        if (event.key === "Escape" && open) {
            event.preventDefault()
            setOpen(false)
            toggleRef.current?.focus()
        }
    }

    return (
        <>
            <button
                type="button"
                ref={toggleRef}
                aria-label={open ? "close menu" : "open menu"}
                aria-expanded={open}
                aria-controls={open ? menuId : undefined}
                onKeyDown={handleKeyDown}
                onClick={() => setOpen((v) => !v)}
                className="grid h-[38px] w-[38px] place-content-center justify-items-center gap-1 rounded-[var(--radius)] border border-hairline-strong [@media(min-width:880px)]:hidden"
            >
                <span className="block h-[1.5px] w-4 bg-fg transition-all duration-200" />
                <span className="block h-[1.5px] w-4 bg-fg transition-all duration-200" />
                <span className="block h-[1.5px] w-4 bg-fg transition-all duration-200" />
            </button>
            {open && (
                <div
                    id={menuId}
                    onKeyDown={handleKeyDown}
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
