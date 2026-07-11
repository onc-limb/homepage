import React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import type { BlogArticle } from "./blog-utils"
import { formatDate } from "./blog-utils"

/**
 * 記事詳細ページの本体。Markdown 本文を導入済みの
 * react-markdown + remark-gfm で表示する。
 */
export function ArticleDetail({ article }: { article: BlogArticle }) {
    return (
        <main className="relative z-[1] mx-auto max-w-[820px] px-6 py-14 md:px-10">
            <header className="mb-8 border-b border-hairline pb-6">
                <div className="mb-3 flex items-center gap-3 font-mono text-[11px] tracking-[0.1em] text-fg-dim">
                    <span className="text-accent">ARTICLE</span>
                    <span>{formatDate(article.createdAt)}</span>
                </div>
                <h1 className="mb-4 text-[32px] font-semibold leading-[1.25] tracking-[-0.02em] text-fg-strong">
                    {article.title}
                </h1>
                {article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {article.tags.map((tag) => (
                            <span
                                key={tag}
                                className="rounded-[3px] border border-hairline-strong px-2 py-0.5 font-mono text-[11px] text-fg"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </header>

            <div className="prose max-w-none prose-headings:text-fg-strong prose-p:text-fg prose-li:text-fg prose-a:text-accent prose-strong:text-fg-strong prose-code:text-accent prose-blockquote:text-fg-muted prose-blockquote:border-accent">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {article.body}
                </ReactMarkdown>
            </div>
        </main>
    )
}
