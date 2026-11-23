import Link from "next/link"
import type { ReactNode } from "react"

import { EXTERNAL_LINK_ATTRS, isExternalHref } from "./href"
import { TEXT_LINK } from "./link-styles"

type TextLinkProps = {
    href: string
    children: ReactNode
}

export function TextLink({ href, children }: TextLinkProps) {
    if (isExternalHref(href)) {
        return (
            <a href={href} className={TEXT_LINK} {...EXTERNAL_LINK_ATTRS}>
                {children}
                <span> ↗</span>
            </a>
        )
    }
    return (
        <Link href={href} className={TEXT_LINK}>
            {children}
        </Link>
    )
}
