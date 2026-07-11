import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    ArticleStatusBadge,
    ArticleStatusToggle,
    DeleteArticleButton,
} from "@/components/studio/articles"
import type { ArticleListItem } from "@/components/studio/articles"
// 一覧は下書きも含めた全記事を扱う（公開サイト側の絞り込みとは別）。
import { getArticles } from "./data"
import { deleteArticleAction, toggleArticleStatusAction } from "./actions"

export default async function StudioArticlesPage() {
    // 一覧は下書きも含めた全記事を扱う（公開サイト側の絞り込みとは別）。
    const articles = (await getArticles()) as ArticleListItem[]

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">記事管理</h1>
                <Button asChild>
                    <Link href="/studio/articles/new">
                        <Plus className="mr-1 h-4 w-4" />
                        新規作成
                    </Link>
                </Button>
            </div>

            {articles.length === 0 ? (
                <p className="text-muted-foreground">まだ記事がありません。</p>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>タイトル</TableHead>
                            <TableHead>slug</TableHead>
                            <TableHead>状態</TableHead>
                            <TableHead className="text-right">操作</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {articles.map((article) => {
                            // 各行ごとに id / 現在状態を束ねたサーバーアクションを渡す。
                            const toggle = toggleArticleStatusAction.bind(
                                null,
                                article.id,
                                article.status
                            )
                            const remove = deleteArticleAction.bind(null, article.id)
                            return (
                                <TableRow key={article.id}>
                                    <TableCell className="font-medium">
                                        {article.title}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {article.slug}
                                    </TableCell>
                                    <TableCell>
                                        <ArticleStatusBadge status={article.status} />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-end gap-2">
                                            <ArticleStatusToggle
                                                status={article.status}
                                                action={toggle}
                                            />
                                            <Button asChild variant="ghost" size="sm">
                                                <Link
                                                    href={`/studio/articles/${article.id}/edit`}
                                                >
                                                    編集
                                                </Link>
                                            </Button>
                                            <DeleteArticleButton
                                                title={article.title}
                                                action={remove}
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            )}
        </div>
    )
}
