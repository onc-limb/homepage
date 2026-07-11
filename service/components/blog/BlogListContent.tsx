import { Reveal } from "@/components/animations"
import { BlogCard } from "./BlogCard"
import { BlogTagFilter } from "./BlogTagFilter"
import {
    ALL_TAG,
    collectTags,
    filterByTag,
    filterPublished,
    type BlogArticle,
} from "./blog-utils"

/**
 * 公開ブログ一覧の本体。渡された記事から published のみを表示し、
 * タグ選択 UI と選択タグによる絞り込みを行う。
 */
export function BlogListContent({
    articles,
    selectedTag = ALL_TAG,
}: {
    articles: BlogArticle[]
    selectedTag?: string
}) {
    const published = filterPublished(articles)
    const tags = collectTags(published)
    const selected = selectedTag || ALL_TAG
    const visible = filterByTag(published, selected)

    return (
        <main className="relative z-[1] mx-auto max-w-[1080px] px-6 pb-20 pt-10 md:px-10">
            <header className="mb-2 flex items-baseline gap-3.5 border-b border-hairline pb-3.5">
                <span className="font-mono text-xs tracking-[0.18em] text-accent">
                    /blog
                </span>
                <h1 className="text-[26px] font-semibold tracking-[-0.01em]">
                    Articles
                </h1>
                <span className="ml-auto font-mono text-[11px] tracking-[0.16em] text-fg-dim">
                    {visible.length} posts
                </span>
            </header>

            <BlogTagFilter tags={tags} selected={selected} />

            {visible.length === 0 ? (
                <div className="py-16 text-center text-fg-muted">
                    記事はまだありません
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3.5 [@media(min-width:720px)]:grid-cols-2 [@media(min-width:1100px)]:grid-cols-3">
                    {visible.map((article, i) => (
                        <Reveal key={article.slug} delay={i * 40}>
                            <BlogCard article={article} />
                        </Reveal>
                    ))}
                </div>
            )}
        </main>
    )
}
