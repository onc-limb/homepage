import booksData from "@/lib/mock/books.json"

export interface Book {
    id: number
    title: string
    author: string
    publisher: string | null
    publishedYear: number | null
    isbn: string | null
    officialUrl: string | null
    memo: string | null
    tags: string[]
    isRead: boolean
    createdAt: string
    updatedAt: string
}

export type SortKey = "title" | "publishedYear"
export type SortOrder = "asc" | "desc"

export function getBooks(): Book[] {
    return booksData as Book[]
}

export function getBookTags(): string[] {
    const books = getBooks()
    const tagSet = new Set<string>()
    for (const book of books) {
        for (const tag of book.tags) {
            tagSet.add(tag)
        }
    }
    return Array.from(tagSet).sort()
}

export function filterBooks(params: {
    q?: string
    tag?: string
    sort?: SortKey
    order?: SortOrder
    isRead?: boolean
}): Book[] {
    let books = getBooks()

    // 既読/積読フィルタ
    if (params.isRead !== undefined) {
        books = books.filter((book) => book.isRead === params.isRead)
    }

    // テキスト検索（タイトル・著者・メモを部分一致）
    if (params.q) {
        const query = params.q.toLowerCase()
        books = books.filter(
            (book) =>
                book.title.toLowerCase().includes(query) ||
                book.author.toLowerCase().includes(query) ||
                (book.memo && book.memo.toLowerCase().includes(query))
        )
    }

    // タグフィルタ
    if (params.tag) {
        books = books.filter((book) => book.tags.includes(params.tag!))
    }

    // ソート
    const sortKey = params.sort ?? "title"
    const sortOrder = params.order ?? "asc"
    books.sort((a, b) => {
        let comparison = 0
        if (sortKey === "title") {
            comparison = a.title.localeCompare(b.title, "ja")
        } else if (sortKey === "publishedYear") {
            comparison = (a.publishedYear ?? 0) - (b.publishedYear ?? 0)
        }
        return sortOrder === "desc" ? -comparison : comparison
    })

    return books
}
