import Link from "next/link"

import { FOCUS_RING } from "@/components/ds/focus-styles"
import { toPromptPath } from "@/lib/building/floors"
import { SITE_NAME } from "@/lib/seo"

export function SiteBrand({ pathname }: { pathname: string }) {
    return (
        <Link
            href="/"
            className={`whitespace-nowrap font-ds text-ds-sm text-ds-fg ${FOCUS_RING}`}
        >
            <span className="text-ds-prompt">guest@{SITE_NAME}</span>:
            <span className="text-ds-link">{toPromptPath(pathname)}</span>$
        </Link>
    )
}
