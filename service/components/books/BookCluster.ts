import type { Book } from "@/lib/types/book"

/**
 * docs/design/book.html の cluster + book ノード構造を、現行スキーマ
 * (`isRead: boolean` と `tags: string[]`) で再現するための導出ロジック。
 *
 * ASSUMPTION (MISSING_FEATURES.md 参照):
 *  - cluster: 既存タグの出現上位 4 件
 *  - edges:   同じ cluster タグを共有する本同士
 *  - status:  isRead === true → "read" / false → "queue" (reading は表現できない)
 *
 * すべて純粋関数でテスト容易性を保つ。
 */

export type BookStatus = "read" | "queue"

export interface BookCluster {
    id: string
    label: string
    x: number
    y: number
}

export interface PositionedBook {
    id: string
    cluster: string
    title: string
    author: string
    status: BookStatus
    notes: string
    related: string[]
    /** percent of svg viewport */
    x: number
    y: number
}

const CLUSTER_POSITIONS: { x: number; y: number }[] = [
    { x: 25, y: 30 },
    { x: 75, y: 25 },
    { x: 30, y: 70 },
    { x: 70, y: 72 },
]

export function deriveTopClusters(books: Book[], limit = 4): BookCluster[] {
    const counts = new Map<string, number>()
    for (const b of books) {
        for (const t of b.tags) {
            counts.set(t, (counts.get(t) ?? 0) + 1)
        }
    }
    const sorted = [...counts.entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, limit)
    return sorted.map(([label], i) => ({
        id: slugify(label) || `c${i}`,
        label,
        x: CLUSTER_POSITIONS[i]?.x ?? 50,
        y: CLUSTER_POSITIONS[i]?.y ?? 50,
    }))
}

/**
 * 各本を最初にマッチした cluster に割り当てる。クラスタに属さない本は除外。
 * クラスタ中心からの放射配置で位置を決める。
 */
export function assignBooksToClusters(
    books: Book[],
    clusters: BookCluster[],
): PositionedBook[] {
    const byCluster = new Map<string, Book[]>()
    for (const cluster of clusters) {
        byCluster.set(cluster.id, [])
    }
    for (const book of books) {
        const cluster = clusters.find((c) => book.tags.includes(c.label))
        if (!cluster) continue
        byCluster.get(cluster.id)!.push(book)
    }

    const positioned: PositionedBook[] = []
    for (const cluster of clusters) {
        const list = byCluster.get(cluster.id)!
        const total = list.length
        list.forEach((book, i) => {
            const angle = (i / Math.max(total, 1)) * Math.PI * 2 - Math.PI / 2
            const radius = 12 + (i % 3) * 3
            const x = clamp(cluster.x + Math.cos(angle) * radius, 5, 95)
            const y = clamp(cluster.y + Math.sin(angle) * radius, 5, 95)
            positioned.push({
                id: `book-${book.id}`,
                cluster: cluster.id,
                title: book.title,
                author: book.author,
                status: book.isRead ? "read" : "queue",
                notes: book.memo ?? "",
                related: relatedIds(book, books),
                x,
                y,
            })
        })
    }
    return positioned
}

function relatedIds(book: Book, all: Book[]): string[] {
    if (book.tags.length === 0) return []
    const relatedSet = new Set<string>()
    for (const candidate of all) {
        if (candidate.id === book.id) continue
        if (candidate.tags.some((t) => book.tags.includes(t))) {
            relatedSet.add(`book-${candidate.id}`)
        }
        if (relatedSet.size >= 4) break
    }
    return [...relatedSet]
}

function slugify(input: string): string {
    return input
        .toLowerCase()
        .replace(/[^a-z0-9一-龯ぁ-んァ-ヴー]+/g, "-")
        .replace(/^-+|-+$/g, "")
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value))
}
