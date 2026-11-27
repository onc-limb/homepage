import Link from "next/link"

import { FOCUS_RING } from "./focus-styles"
import { PROSE_TEXT } from "./prose-styles"

export type LogListItem = { id: string; date: string; title: string; href: string; description?: string }

type LogListProps = {
    items: readonly LogListItem[]
}

export function LogList({ items }: LogListProps) {
    return (
        <ul className="border-t border-ds-border font-ds">
            {items.map((item) => (
                <li key={item.id} className="border-b border-ds-border">
                    <Link
                        href={item.href}
                        className={`grid grid-cols-1 gap-x-ds-4 gap-y-ds-1 py-ds-3 md:grid-cols-ds-log ${FOCUS_RING}`}
                    >
                        <span className="text-ds-sm text-ds-fg-muted">{item.date}</span>
                        <span className="text-ds-sm text-ds-link">{item.id}</span>
                        <span className="flex flex-col gap-ds-1">
                            <span className="text-ds-lg font-bold text-ds-link underline underline-offset-4">
                                {item.title}
                            </span>
                            {item.description ? <span className={PROSE_TEXT}>{item.description}</span> : null}
                        </span>
                    </Link>
                </li>
            ))}
        </ul>
    )
}
