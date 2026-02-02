import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { books, tags, bookTags } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { getBookTags } from "@/lib/books"
import { BookForm } from "../../BookForm"
import type { BookFormValues } from "@/lib/validations/book"

export default async function EditBookPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const bookId = Number(id)

    const book = await db.query.books.findFirst({
        where: eq(books.id, bookId),
    })

    if (!book) {
        notFound()
    }

    const bookTagRows = await db
        .select({ tagName: tags.name })
        .from(bookTags)
        .innerJoin(tags, eq(bookTags.tagId, tags.id))
        .where(eq(bookTags.bookId, bookId))

    const availableTags = await getBookTags()

    const defaultValues: BookFormValues = {
        title: book.title,
        author: book.author,
        publisher: book.publisher ?? "",
        publishedYear: book.publishedYear ?? null,
        isbn: book.isbn ?? "",
        officialUrl: book.officialUrl ?? "",
        memo: book.memo ?? "",
        isRead: book.isRead,
        tagNames: bookTagRows.map((t) => t.tagName),
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-900">書籍を編集</h1>
            <p className="mt-1 text-sm text-slate-500">{book.title}</p>
            <div className="mt-8 rounded-md border bg-white p-6">
                <BookForm
                    defaultValues={defaultValues}
                    bookId={bookId}
                    availableTags={availableTags}
                />
            </div>
        </div>
    )
}
