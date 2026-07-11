"use client"

import Link from "next/link"
import { ALL_TAG } from "./blog-utils"

/**
 * タグ選択 UI。各タグは絞り込みクエリ (/blog?tag=...) へのリンクになっており、
 * 選択状態はサーバー側で searchParams から復元される。
 */
export function BlogTagFilter({
    tags,
    selected,
}: {
    tags: string[]
    selected: string
}) {
    const options = [ALL_TAG, ...tags]
    return (
        <div className="my-5 flex flex-wrap items-center gap-2">
            <span className="mr-2 font-mono text-[11px] uppercase tracking-[0.16em] text-fg-dim">
                FILTER —
            </span>
            {options.map((tag) => {
                const active = (selected || ALL_TAG) === tag
                const href =
                    tag === ALL_TAG
                        ? "/blog"
                        : `/blog?tag=${encodeURIComponent(tag)}`
                return (
                    <Link
                        key={tag}
                        href={href}
                        aria-current={active ? "page" : undefined}
                        className={
                            "rounded-full border px-3.5 py-1.5 font-mono text-xs tracking-[0.04em] transition-all duration-200 " +
                            (active
                                ? "border-accent bg-accent text-white"
                                : "border-hairline-strong bg-transparent text-fg-muted hover:border-fg-muted hover:text-fg")
                        }
                    >
                        {tag === ALL_TAG ? "All" : tag}
                    </Link>
                )
            })}
        </div>
    )
}
