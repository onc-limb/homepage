import Link from "next/link"
import type { ReactNode } from "react"

import { FOCUS_RING } from "./focus-styles"
import { EXTERNAL_LINK_ATTRS, isExternalHref } from "./href"

type TextLinkProps = {
    href: string
    children: ReactNode
}

const LINK_CLASS = `text-ds-link underline underline-offset-4 ${FOCUS_RING}`

export function TextLink({ href, children }: TextLinkProps) {
    if (isExternalHref(href)) {
        return (
            <a href={href} className={LINK_CLASS} {...EXTERNAL_LINK_ATTRS}>
                {children}
                <span> ↗</span>
            </a>
        )
    }
    return (
        <Link href={href} className={LINK_CLASS}>
            {children}
        </Link>
    )
}
