import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { books, tags, bookTags } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const bookId = Number(id)

    const book = await db.query.books.findFirst({
        where: eq(books.id, bookId),
    })

    if (!book) {
        return Response.json({ error: "Not found" }, { status: 404 })
    }

    const bookTagRows = await db
        .select({ tagName: tags.name })
        .from(bookTags)
        .innerJoin(tags, eq(bookTags.tagId, tags.id))
        .where(eq(bookTags.bookId, bookId))

    return Response.json({
        ...book,
        tags: bookTagRows.map((t) => t.tagName),
    })
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth()
    if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const bookId = Number(id)
    const body = await request.json()
    const { tagNames, ...bookData } = body as {
        title?: string
        author?: string
        publisher?: string
        publishedYear?: number
        isbn?: string
        officialUrl?: string
        memo?: string
        isRead?: boolean
        tagNames?: string[]
    }

    const result = await db.transaction(async (tx) => {
        const [updated] = await tx
            .update(books)
            .set({
                ...bookData,
                updatedAt: new Date().toISOString(),
            })
            .where(eq(books.id, bookId))
            .returning()

        if (!updated) {
            return null
        }

        if (tagNames !== undefined) {
            // 洗い替え: DELETE → INSERT
            await tx.delete(bookTags).where(eq(bookTags.bookId, bookId))

            for (const name of tagNames) {
                await tx.insert(tags).values({ name }).onConflictDoNothing()
                const [tag] = await tx
                    .select()
                    .from(tags)
                    .where(eq(tags.name, name))
                    .limit(1)
                await tx.insert(bookTags).values({ bookId: updated.id, tagId: tag.id })
            }
        }

        return updated
    })

    if (!result) {
        return Response.json({ error: "Not found" }, { status: 404 })
    }

    return Response.json(result)
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth()
    if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const bookId = Number(id)

    const [deleted] = await db.delete(books).where(eq(books.id, bookId)).returning()

    if (!deleted) {
        return Response.json({ error: "Not found" }, { status: 404 })
    }

    return Response.json({ success: true })
}
