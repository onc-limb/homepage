import React from "react"
import type { Metadata } from "next"

// ASSUMPTION: articles-data-access (@/lib/articles) の公開用関数のみを利用する。
// 一覧は published のみを返す listPublishedArticles() を用いる（公開関数のみ利用の制約）。
// 返り値は articles テーブル形状 + 関連タグ (ArticleTag[]) を想定する。
import { listPublishedArticles } from "@/lib/articles"
import { BlogListContent, type BlogArticle } from "@/components/blog"
import { createPageMetadata } from "@/lib/seo"

export const metadata: Metadata = createPageMetadata({
    title: "Blog",
    description: "学んだ技術知識をまとめた記事の一覧。",
    path: "/blog",
})

// 公開/下書きの切り替えを即時反映させるため動的レンダリングにする。
export const dynamic = "force-dynamic"

export default async function BlogPage({
    searchParams,
}: {
    searchParams: Promise<{ tag?: string | string[] }>
}) {
    const { tag } = await searchParams
    const selectedTag = typeof tag === "string" ? tag : undefined

    const published = await listPublishedArticles()
    const articles: BlogArticle[] = published.map((a) => ({
        id: a.id,
        slug: a.slug,
        title: a.title,
        body: a.body,
        status: a.status === "published" ? "published" : "draft",
        // ASSUMPTION: 公開用一覧関数は関連タグを ArticleTag[]（{ id, name }）で同梱して返す想定。
        // 表示層の BlogArticle.tags は string[]（タグ名）なので name を取り出して写像する。
        tags: (a.tags ?? []).map((tag) => tag.name),
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
    }))

    return <BlogListContent articles={articles} selectedTag={selectedTag} />
}
