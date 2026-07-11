import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ArticleForm } from "@/components/studio/articles"
import type { ArticleDetail, TagOption } from "@/components/studio/articles"
// ASSUMPTION: articles 読み取り系は data.ts 経由（@/lib/articles の read 層）で取得する。
//             getArticleById() は本文・タグ込みの記事を返す。
import { getAllTags, getArticleById } from "../../data"
import { updateArticleAction } from "../../actions"

export default async function EditArticlePage({
    params,
}: {
    // Next.js 15 では params は Promise。
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    // ASSUMPTION: 既存 books 管理 UI の id パースに揃え、数値でない id（例: /studio/articles/abc/edit）は
    //             getArticleById に渡す前に明示的に弾く。正の整数以外は 404 とする。
    const articleId = Number(id)
    if (!Number.isInteger(articleId) || articleId <= 0) {
        notFound()
    }

    const [article, tags] = await Promise.all([
        getArticleById(articleId) as Promise<ArticleDetail | null>,
        getAllTags() as Promise<TagOption[]>,
    ])

    if (!article) {
        notFound()
    }

    // id を束ねた更新アクション。フォームからは FormData のみ渡る。
    const action = updateArticleAction.bind(null, articleId)

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Button asChild variant="ghost" size="sm">
                    <Link href="/studio/articles">
                        <ArrowLeft className="mr-1 h-4 w-4" />
                        一覧に戻る
                    </Link>
                </Button>
            </div>
            <h1 className="text-2xl font-bold">記事の編集</h1>
            <ArticleForm
                action={action}
                availableTags={tags}
                defaultValues={{
                    title: article.title,
                    slug: article.slug,
                    body: article.body,
                    status: article.status,
                    tagIds: article.tags?.map((tag) => tag.id) ?? [],
                }}
                submitLabel="更新する"
            />
        </div>
    )
}
