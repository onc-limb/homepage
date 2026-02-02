import Link from "next/link"
import { getBooks } from "@/lib/books"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"
import { DeleteBookButton } from "./DeleteBookButton"

export default async function StudioBooksPage() {
    const books = await getBooks()

    return (
        <div>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Books 管理</h1>
                    <p className="mt-1 text-sm text-slate-500">{books.length}冊</p>
                </div>
                <Button asChild>
                    <Link href="/studio/books/new">
                        <Plus className="mr-1 h-4 w-4" />
                        新規登録
                    </Link>
                </Button>
            </div>

            <div className="mt-6 rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>タイトル</TableHead>
                            <TableHead>著者</TableHead>
                            <TableHead>出版社</TableHead>
                            <TableHead>出版年</TableHead>
                            <TableHead>ISBN</TableHead>
                            <TableHead>公式URL</TableHead>
                            <TableHead>メモ</TableHead>
                            <TableHead>タグ</TableHead>
                            <TableHead className="text-center">既読</TableHead>
                            <TableHead className="w-[100px]">操作</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {books.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={10}
                                    className="py-8 text-center text-slate-500"
                                >
                                    書籍が登録されていません
                                </TableCell>
                            </TableRow>
                        ) : (
                            books.map((book) => (
                                <TableRow key={book.id}>
                                    <TableCell className="font-medium">
                                        {book.title}
                                    </TableCell>
                                    <TableCell>{book.author}</TableCell>
                                    <TableCell className="text-sm text-slate-600">
                                        {book.publisher ?? "—"}
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-600">
                                        {book.publishedYear ?? "—"}
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-600">
                                        {book.isbn ?? "—"}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {book.officialUrl ? (
                                            <a
                                                href={book.officialUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline"
                                            >
                                                リンク
                                            </a>
                                        ) : (
                                            <span className="text-slate-600">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate text-sm text-slate-600">
                                        {book.memo ?? "—"}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {book.tags.map((tag) => (
                                                <Badge
                                                    key={tag}
                                                    variant="secondary"
                                                    className="text-xs"
                                                >
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {book.isRead ? "✓" : "—"}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link
                                                    href={`/studio/books/${book.id}/edit`}
                                                >
                                                    編集
                                                </Link>
                                            </Button>
                                            <DeleteBookButton
                                                bookId={book.id}
                                                bookTitle={book.title}
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
