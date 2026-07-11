import React from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

// ASSUMPTION: articles-schema で確定した slug ルーティング契約に従い、公開用の
// slug 単体取得関数 getPublishedArticleBySlug(slug)（published のみ）で記事を引く。
// id ルーティングは不採用。返り値は articles テーブル形状 + 関連タグ (ArticleTag[]) を想定する。
import { getPublishedArticleBySlug } from "@/lib/articles"
import { ArticleDetail, type BlogArticle } from "@/components/blog"

export const dynamic = "force-dynamic"

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>
}): Promise<Metadata> {
    const { slug } = await params
    const article = await getPublishedArticleBySlug(slug)
    if (!article) {
        return { title: "記事が見つかりません — onclimb" }
    }
    return { title: `${article.title} — onclimb` }
}

export default async function ArticlePage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const article = await getPublishedArticleBySlug(slug)
    if (!article) {
        // 下書き・未存在の slug への直接アクセスは 404 にする（公開ページに draft を出さない）。
        notFound()
    }

    const mapped: BlogArticle = {
        id: article.id,
        slug: article.slug,
        title: article.title,
        body: article.body,
        status: article.status === "published" ? "published" : "draft",
        // ASSUMPTION: 公開用 slug 取得関数は関連タグを ArticleTag[]（{ id, name }）で同梱して返す想定。
        // 表示層の BlogArticle.tags は string[]（タグ名）なので name を取り出して写像する。
        tags: (article.tags ?? []).map((tag) => tag.name),
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
    }

    return <ArticleDetail article={mapped} />
}
