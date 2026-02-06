import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { books } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { getBookById, syncBookTags } from "@/lib/books"
import { bookFormSchema } from "@/lib/validations/book"

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params
    const book = await getBookById(Number(id))

    if (!book) {
        return Response.json({ error: "Not found" }, { status: 404 })
    }

    return Response.json(book)
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const session = await auth()
    if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const bookId = Number(id)
    const body = await request.json()

    const parsed = bookFormSchema.safeParse(body)
    if (!parsed.success) {
        return Response.json(
            { error: "Validation failed", details: parsed.error.flatten() },
            { status: 400 },
        )
    }

    const { tagNames, ...data } = parsed.data

    const result = await db.transaction(async (tx) => {
        const [updated] = await tx
            .update(books)
            .set({
                title: data.title,
                author: data.author,
                publisher: data.publisher || null,
                publishedYear: data.publishedYear ?? null,
                isbn: data.isbn || null,
                officialUrl: data.officialUrl || null,
                memo: data.memo || null,
                isRead: data.isRead ?? false,
                updatedAt: new Date().toISOString(),
            })
            .where(eq(books.id, bookId))
            .returning()

        if (!updated) return null

        await syncBookTags(tx, bookId, tagNames)

        return updated
    })

    if (!result) {
        return Response.json({ error: "Not found" }, { status: 404 })
    }

    return Response.json(result)
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const session = await auth()
    if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const bookId = Number(id)

    const [deleted] = await db
        .delete(books)
        .where(eq(books.id, bookId))
        .returning()

    if (!deleted) {
        return Response.json({ error: "Not found" }, { status: 404 })
    }

    return Response.json({ success: true })
}
