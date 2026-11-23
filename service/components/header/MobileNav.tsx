"use client"

import Link from "next/link"
import { useId, useRef, useState, type KeyboardEvent } from "react"
import { DoorButton } from "@/components/ds/DoorButton"
import { FOCUS_RING } from "@/components/ds/focus-styles"
import { NARROW_SCREEN_ONLY } from "@/components/ds/screen-styles"
import { NAV_ITEMS } from "@/lib/constants"
import { isNavItemActive, toPromptPath } from "./nav-utils"

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
        <div className={NARROW_SCREEN_ONLY} onKeyDown={handleKeyDown}>
            <DoorButton
                ref={toggleRef}
                aria-expanded={open}
                aria-controls={open ? menuId : undefined}
                onClick={() => setOpen((value) => !value)}
            >
                メニュー
            </DoorButton>
            {open && (
                <nav
                    id={menuId}
                    aria-label="サイト"
                    className="absolute inset-x-0 top-full flex flex-col border-y border-ds-border bg-ds-bg px-ds-3 pb-ds-3 pt-ds-1"
                >
                    {NAV_ITEMS.map((item) => {
                        const active = isNavItemActive(pathname, item.href)
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-current={active ? "page" : undefined}
                                onClick={() => setOpen(false)}
                                className={`flex items-center justify-between gap-ds-3 border-b border-ds-border py-ds-2 text-ds-fg ${FOCUS_RING}`}
                            >
                                <span className={`font-ds-prose underline underline-offset-4${active ? " font-bold" : ""}`}>
                                    {item.label}
                                </span>
                                <span className="text-ds-sm text-ds-link">{toPromptPath(item.href)}</span>
                            </Link>
                        )
                    })}
                </nav>
            )}
        </div>
    )
}
