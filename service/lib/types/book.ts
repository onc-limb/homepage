export interface Book {
    id: number
    title: string
    author: string
    publisher: string | null
    publishedYear: number | null
    isbn: string | null
    officialUrl: string | null
    ogpImageUrl: string | null
    memo: string | null
    tags: string[]
    isRead: boolean
    createdAt: string
    updatedAt: string
}

export type SortKey = "title" | "publishedYear"
export type SortOrder = "asc" | "desc"
