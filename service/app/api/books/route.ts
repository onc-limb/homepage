import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { books, tags, bookTags } from "@/lib/db/schema"
import { eq, like, or, asc, desc, sql } from "drizzle-orm"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const tab = searchParams.get("tab")
    const q = searchParams.get("q")
    const tag = searchParams.get("tag")
    const sort = searchParams.get("sort") ?? "title"
    const order = searchParams.get("order") ?? "asc"

    const allBooks = await db.query.books.findMany({
        with: {},
    })

    // book_tagsとtagsをJOINして各書籍のタグを取得
    const allBookTags = await db
        .select({
            bookId: bookTags.bookId,
            tagName: tags.name,
        })
        .from(bookTags)
        .innerJoin(tags, eq(bookTags.tagId, tags.id))

    const tagsByBookId = new Map<number, string[]>()
    for (const bt of allBookTags) {
        const existing = tagsByBookId.get(bt.bookId) ?? []
        existing.push(bt.tagName)
        tagsByBookId.set(bt.bookId, existing)
    }

    let result = allBooks.map((book) => ({
        ...book,
        tags: tagsByBookId.get(book.id) ?? [],
    }))

    // 既読/積読フィルタ
    if (tab === "read") {
        result = result.filter((b) => b.isRead)
    } else if (tab === "unread") {
        result = result.filter((b) => !b.isRead)
    }

    // テキスト検索
    if (q) {
        const query = q.toLowerCase()
        result = result.filter(
            (b) =>
                b.title.toLowerCase().includes(query) ||
                b.author.toLowerCase().includes(query) ||
                (b.memo && b.memo.toLowerCase().includes(query))
        )
    }

    // タグフィルタ
    if (tag) {
        result = result.filter((b) => b.tags.includes(tag))
    }

    // ソート
    result.sort((a, b) => {
        let cmp = 0
        if (sort === "title") {
            cmp = a.title.localeCompare(b.title, "ja")
        } else if (sort === "publishedYear") {
            cmp = (a.publishedYear ?? 0) - (b.publishedYear ?? 0)
        }
        return order === "desc" ? -cmp : cmp
    })

    return Response.json(result)
}

export async function POST(request: NextRequest) {
    const session = await auth()
    if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { tagNames, ...bookData } = body as {
        title: string
        author: string
        publisher?: string
        publishedYear?: number
        isbn?: string
        officialUrl?: string
        memo?: string
        isRead?: boolean
        tagNames?: string[]
    }

    const result = await db.transaction(async (tx) => {
        const [newBook] = await tx
            .insert(books)
            .values({
                title: bookData.title,
                author: bookData.author,
                publisher: bookData.publisher ?? null,
                publishedYear: bookData.publishedYear ?? null,
                isbn: bookData.isbn ?? null,
                officialUrl: bookData.officialUrl ?? null,
                memo: bookData.memo ?? null,
                isRead: bookData.isRead ?? false,
            })
            .returning()

        if (tagNames && tagNames.length > 0) {
            for (const name of tagNames) {
                // upsertでタグを取得or作成
                await tx.insert(tags).values({ name }).onConflictDoNothing()
                const [tag] = await tx
                    .select()
                    .from(tags)
                    .where(eq(tags.name, name))
                    .limit(1)
                await tx.insert(bookTags).values({ bookId: newBook.id, tagId: tag.id })
            }
        }

        return newBook
    })

    return Response.json(result, { status: 201 })
}
