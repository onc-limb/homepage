import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { books } from "@/lib/db/schema"
import { auth } from "@/lib/auth"
import { getBooks, syncBookTags, updateOgpImageUrl } from "@/lib/books"
import { bookFormSchema } from "@/lib/validations/book"
import { fetchOgpImage } from "@/lib/ogp"
import type { SortKey, SortOrder } from "@/lib/types/book"

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const tab = searchParams.get("tab")
    const q = searchParams.get("q")
    const tag = searchParams.get("tag")
    const sort = (searchParams.get("sort") as SortKey) ?? "title"
    const order = (searchParams.get("order") as SortOrder) ?? "asc"

    const result = await getBooks({
        isRead: tab === "read" ? true : tab === "unread" ? false : undefined,
        query: q || undefined,
        tag: tag || undefined,
        sort,
        order,
    })

    return Response.json(result)
}

export async function POST(request: NextRequest) {
    const session = await auth()
    if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

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
        const [newBook] = await tx
            .insert(books)
            .values({
                title: data.title,
                author: data.author,
                publisher: data.publisher || null,
                publishedYear: data.publishedYear ?? null,
                isbn: data.isbn || null,
                officialUrl: data.officialUrl || null,
                memo: data.memo || null,
                isRead: data.isRead ?? false,
            })
            .returning()

        await syncBookTags(tx, newBook.id, tagNames)

        return newBook
    })

    // OGP画像を非同期で取得・保存
    if (result.officialUrl) {
        fetchOgpImage(result.officialUrl).then((url) =>
            updateOgpImageUrl(result.id, url),
        )
    }

    return Response.json(result, { status: 201 })
}
