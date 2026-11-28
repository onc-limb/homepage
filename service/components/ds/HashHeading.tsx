import type { ReactNode } from "react"

import { HEADING_MAJOR, HEADING_MINOR } from "./heading-styles"

type HashHeadingProps = {
    /** 2 renders `<h2># …`, 3 `<h3>## …`, 4 `<h4>### …` (Prose uses the same headings). */
    level?: 2 | 3 | 4
    /** Spacing only (margins); type and colour come from the heading scale. */
    className?: string
    children: ReactNode
}

/**
 * Terminal-style heading with a muted `#` marker, e.g. `# フォームで送る`.
 * The marker is decorative, so screen readers hear only the heading text.
 */
export function HashHeading({ level = 2, className, children }: HashHeadingProps) {
    const Tag = (["h2", "h3", "h4"] as const)[level - 2]
    const marker = "#".repeat(level - 1)
    const scale = level === 2 ? HEADING_MAJOR : HEADING_MINOR
    return (
        <Tag className={className ? `${scale} ${className}` : scale}>
            <span aria-hidden="true" className="text-ds-fg-muted">
                {marker}{" "}
            </span>
            {children}
        </Tag>
    )
}
