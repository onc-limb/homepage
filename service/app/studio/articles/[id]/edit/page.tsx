import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ArticleForm } from "@/components/studio/articles"
import type { ArticleDetail, TagOption } from "@/components/studio/articles"
// ASSUMPTION: articles 読み取り系は data.ts で補う。getArticleById() は本文・タグ込みの記事を返す。
import { getAllTags, getArticleById } from "../../data"
import { updateArticleAction } from "../../actions"

export default async function EditArticlePage({
    params,
}: {
    // Next.js 15 では params は Promise。
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const articleId = Number(id)

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
