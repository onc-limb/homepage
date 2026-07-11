import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ArticleForm } from "@/components/studio/articles"
import type { TagOption } from "@/components/studio/articles"
// ASSUMPTION: タグは既存 tags テーブルを再利用し、getAllTags() で選択候補を取得する。
import { getAllTags } from "../data"
import { createArticleAction } from "../actions"

export default async function NewArticlePage() {
    const tags = (await getAllTags()) as TagOption[]

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
            <h1 className="text-2xl font-bold">記事の新規作成</h1>
            <ArticleForm
                action={createArticleAction}
                availableTags={tags}
                submitLabel="作成する"
            />
        </div>
    )
}
