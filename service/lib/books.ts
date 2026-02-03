import { db } from "@/lib/db"
import { books, tags, bookTags } from "@/lib/db/schema"
import { eq, and, or, like, asc, desc, inArray, exists } from "drizzle-orm"

export type { Book, SortKey, SortOrder } from "@/lib/types/book"
import type { Book, SortKey, SortOrder } from "@/lib/types/book"

// ---------- Query ----------

export interface BookFilter {
    isRead?: boolean
    query?: string
    tag?: string
    sort?: SortKey
    order?: SortOrder
}

export async function getBooks(filter: BookFilter = {}): Promise<Book[]> {
    const conditions = []

    if (filter.isRead !== undefined) {
        conditions.push(eq(books.isRead, filter.isRead))
    }

    if (filter.query) {
        const pattern = `%${filter.query}%`
        conditions.push(
            or(
                like(books.title, pattern),
                like(books.author, pattern),
                like(books.memo, pattern),
            )!,
        )
    }

    if (filter.tag) {
        conditions.push(
            exists(
                db
                    .select()
                    .from(bookTags)
                    .innerJoin(tags, eq(bookTags.tagId, tags.id))
                    .where(
                        and(
                            eq(bookTags.bookId, books.id),
                            eq(tags.name, filter.tag),
                        ),
                    ),
            ),
        )
    }

    const sortColumn =
        filter.sort === "publishedYear" ? books.publishedYear : books.title
    const sortDir = filter.order === "desc" ? desc : asc

    const allBooks = await db
        .select()
        .from(books)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(sortDir(sortColumn))

    const tagsByBookId = await fetchBookTags(allBooks.map((b) => b.id))

    return allBooks.map((book) => ({
        ...book,
        tags: tagsByBookId.get(book.id) ?? [],
    }))
}

export async function getBookById(id: number): Promise<Book | null> {
    const book = await db.query.books.findFirst({
        where: eq(books.id, id),
    })
    if (!book) return null

    const bookTagRows = await db
        .select({ tagName: tags.name })
        .from(bookTags)
        .innerJoin(tags, eq(bookTags.tagId, tags.id))
        .where(eq(bookTags.bookId, id))

    return {
        ...book,
        tags: bookTagRows.map((t) => t.tagName),
    }
}

// ---------- Tags ----------

export async function getBookTags(): Promise<string[]> {
    const allTags = await db.select().from(tags).orderBy(tags.name)
    return allTags.map((t) => t.name)
}

/**
 * 指定した書籍のタグを洗い替えする。
 * タグが存在しなければ作成する。
 */
export async function syncBookTags(
    tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
    bookId: number,
    tagNames: string[],
): Promise<void> {
    await tx.delete(bookTags).where(eq(bookTags.bookId, bookId))

    if (tagNames.length === 0) return

    await Promise.all(
        tagNames.map((name) =>
            tx.insert(tags).values({ name }).onConflictDoNothing(),
        ),
    )

    const existingTags = await tx
        .select()
        .from(tags)
        .where(inArray(tags.name, tagNames))

    const tagIdMap = new Map(existingTags.map((t) => [t.name, t.id]))

    await Promise.all(
        tagNames.map((name) => {
            const tagId = tagIdMap.get(name)!
            return tx.insert(bookTags).values({ bookId, tagId })
        }),
    )
}

// ---------- OGP ----------

export async function updateOgpImageUrl(
    bookId: number,
    ogpImageUrl: string | null,
): Promise<void> {
    await db.update(books).set({ ogpImageUrl }).where(eq(books.id, bookId))
}

// ---------- Internal ----------

async function fetchBookTags(
    bookIds: number[],
): Promise<Map<number, string[]>> {
    if (bookIds.length === 0) return new Map()

    const allBookTags = await db
        .select({
            bookId: bookTags.bookId,
            tagName: tags.name,
        })
        .from(bookTags)
        .innerJoin(tags, eq(bookTags.tagId, tags.id))
        .where(inArray(bookTags.bookId, bookIds))

    const tagsByBookId = new Map<number, string[]>()
    for (const bt of allBookTags) {
        const existing = tagsByBookId.get(bt.bookId) ?? []
        existing.push(bt.tagName)
        tagsByBookId.set(bt.bookId, existing)
    }
    return tagsByBookId
}
