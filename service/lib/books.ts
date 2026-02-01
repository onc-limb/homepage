import { db } from "@/lib/db"
import { books, tags, bookTags } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export type { Book, SortKey, SortOrder } from "@/lib/types/book"
import type { Book } from "@/lib/types/book"

async function fetchBookTags(): Promise<Map<number, string[]>> {
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
    return tagsByBookId
}

export async function getBooks(): Promise<Book[]> {
    const allBooks = await db.select().from(books)
    const tagsByBookId = await fetchBookTags()

    return allBooks.map((book) => ({
        ...book,
        tags: tagsByBookId.get(book.id) ?? [],
    }))
}

export async function getBookTags(): Promise<string[]> {
    const allTags = await db.select().from(tags).orderBy(tags.name)
    return allTags.map((t) => t.name)
}
