import Link from "next/link"
import type { BlogArticle } from "./blog-utils"
import { excerpt, formatDate } from "./blog-utils"

/**
 * 公開ブログ一覧のカード。クリックで記事詳細 (/blog/[slug]) に遷移する。
 */
export function BlogCard({ article }: { article: BlogArticle }) {
    return (
        <article className="group relative overflow-hidden rounded-[var(--radius-lg)] border border-hairline-solid bg-surface-solid shadow-card transition-all duration-[250ms] hover:-translate-y-0.5 hover:border-accent">
            <Link href={`/blog/${article.slug}`} className="block px-6 py-5">
                <div className="mb-2.5 flex items-center gap-3 font-mono text-[11px] tracking-[0.1em] text-fg-dim">
                    <span className="inline-flex items-center gap-1.5 before:block before:h-1 before:w-1 before:rounded-full before:bg-accent">
                        ARTICLE
                    </span>
                    <span>{formatDate(article.createdAt)}</span>
                </div>
                <h3 className="mb-2 text-[18px] font-semibold leading-[1.4] tracking-[-0.005em] text-fg-strong transition-colors duration-200 group-hover:text-accent">
                    {article.title}
                </h3>
                <p className="mb-3.5 text-[13.5px] leading-[1.7] text-fg-muted">
                    {excerpt(article.body)}
                </p>
                {article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {article.tags.map((tag) => (
                            <span
                                key={tag}
                                className="rounded-[3px] border border-hairline-solid-strong px-1.5 py-0.5 font-mono text-[10px] text-fg"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </Link>
        </article>
    )
}
