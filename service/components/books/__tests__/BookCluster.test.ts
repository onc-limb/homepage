import { describe, expect, it } from "vitest"
import {
    assignBooksToClusters,
    deriveTopClusters,
    type BookCluster,
} from "@/components/books/BookCluster"
import type { Book } from "@/lib/types/book"

/**
 * BookCluster pure-function contract tests.
 *
 * Plan: components/books/BookCluster.ts は docs/design/book.html の cluster + node
 *   構造を、現行スキーマ (`isRead: boolean` と `tags: string[]`) で再現する純粋関数群。
 *   `coder-decisions.md` 第 3 項で "純粋関数として切り出した（テスト容易性のため）" と
 *   宣言されているため、振る舞いを契約として固定する。
 *
 * Reference:
 *  - components/books/BookCluster.ts
 *  - docs/design/MISSING_FEATURES.md (cluster / edges / status の暫定対応方針)
 */

const factoryBook = (overrides: Partial<Book> & { id: number; tags: string[] }): Book => ({
    title: `book-${overrides.id}`,
    author: "anon",
    publisher: null,
    publishedYear: null,
    isbn: null,
    officialUrl: null,
    ogpImage: null,
    memo: null,
    isRead: false,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
})

describe("deriveTopClusters()", () => {
    it("returns an empty array when given no books", () => {
        // Given an empty book list
        // When clusters are derived
        // Then no clusters are produced
        expect(deriveTopClusters([])).toEqual([])
    })

    it("returns the top N tags by descending occurrence count", () => {
        // Given five tags with distinct frequencies and limit=4
        // When clusters are derived
        // Then the four most frequent tags are returned in descending order
        const books: Book[] = [
            factoryBook({ id: 1, tags: ["alpha", "beta", "gamma", "delta", "echo"] }),
            factoryBook({ id: 2, tags: ["alpha", "beta", "gamma", "delta"] }),
            factoryBook({ id: 3, tags: ["alpha", "beta", "gamma"] }),
            factoryBook({ id: 4, tags: ["alpha", "beta"] }),
            factoryBook({ id: 5, tags: ["alpha"] }),
        ]
        const clusters = deriveTopClusters(books)
        expect(clusters.map((c) => c.label)).toEqual([
            "alpha",
            "beta",
            "gamma",
            "delta",
        ])
        // limit boundary: 5th tag (echo) is excluded
        expect(clusters.find((c) => c.label === "echo")).toBeUndefined()
    })

    it("breaks ties using code point ascending order on label", () => {
        // Given two tags share the same count
        // When clusters are derived
        // Then the alphabetically earlier label comes first
        const books: Book[] = [
            factoryBook({ id: 1, tags: ["zeta", "alpha"] }),
            factoryBook({ id: 2, tags: ["zeta", "alpha"] }),
        ]
        const clusters = deriveTopClusters(books, 2)
        expect(clusters.map((c) => c.label)).toEqual(["alpha", "zeta"])
    })

    it("orders tied non-ASCII labels independently of the runtime locale", () => {
        // Given tied Japanese labels whose locale collation differs between
        // Node.js and browsers
        // When clusters are derived
        // Then the order follows code points, so server and client agree
        const books: Book[] = [
            factoryBook({ id: 1, tags: ["詳細", "本質"] }),
            factoryBook({ id: 2, tags: ["詳細", "本質"] }),
        ]
        const clusters = deriveTopClusters(books, 2)
        expect(clusters.map((c) => c.label)).toEqual(["本質", "詳細"])
    })

    it("respects an explicit limit smaller than the number of distinct tags", () => {
        // Given limit=2 and 3 candidate tags
        // When clusters are derived
        // Then only 2 clusters are returned
        const books: Book[] = [
            factoryBook({ id: 1, tags: ["a", "b", "c"] }),
        ]
        const clusters = deriveTopClusters(books, 2)
        expect(clusters).toHaveLength(2)
    })

    it("places clusters at the predefined corner positions", () => {
        // Given enough tags to fill the 4 cluster slots
        // When clusters are derived
        // Then x/y match the four corner positions
        const books: Book[] = [
            factoryBook({ id: 1, tags: ["a", "b", "c", "d"] }),
        ]
        const clusters = deriveTopClusters(books)
        expect(clusters[0]).toMatchObject({ x: 25, y: 30 })
        expect(clusters[1]).toMatchObject({ x: 75, y: 25 })
        expect(clusters[2]).toMatchObject({ x: 30, y: 70 })
        expect(clusters[3]).toMatchObject({ x: 70, y: 72 })
    })
})

describe("assignBooksToClusters()", () => {
    it("returns an empty array when no clusters are provided", () => {
        // Given clusters is empty
        // When books are assigned
        // Then no positioned books are produced
        const books: Book[] = [factoryBook({ id: 1, tags: ["alpha"] })]
        expect(assignBooksToClusters(books, [])).toEqual([])
    })

    it("assigns each book only to the first matching cluster (no duplicates)", () => {
        // Given a book carrying tags for two clusters
        // When books are assigned
        // Then the book appears exactly once, in the earlier cluster
        const clusters: BookCluster[] = [
            { id: "alpha", label: "alpha", x: 10, y: 10 },
            { id: "beta", label: "beta", x: 80, y: 80 },
        ]
        const books: Book[] = [
            factoryBook({ id: 1, tags: ["alpha", "beta"] }),
        ]
        const positioned = assignBooksToClusters(books, clusters)
        expect(positioned).toHaveLength(1)
        expect(positioned[0]).toMatchObject({ id: "book-1", cluster: "alpha" })
    })

    it("excludes books whose tags do not match any cluster label", () => {
        // Given a book with no tags matching any cluster
        // When books are assigned
        // Then the book is omitted
        const clusters: BookCluster[] = [
            { id: "alpha", label: "alpha", x: 10, y: 10 },
        ]
        const books: Book[] = [
            factoryBook({ id: 1, tags: ["unrelated"] }),
        ]
        expect(assignBooksToClusters(books, clusters)).toEqual([])
    })

    it("maps isRead=true to status 'read' and isRead=false to status 'queue'", () => {
        // Given two books with different isRead values
        // When books are assigned
        // Then status reflects the boolean mapping
        const clusters: BookCluster[] = [
            { id: "alpha", label: "alpha", x: 10, y: 10 },
        ]
        const books: Book[] = [
            factoryBook({ id: 1, tags: ["alpha"], isRead: true }),
            factoryBook({ id: 2, tags: ["alpha"], isRead: false }),
        ]
        const positioned = assignBooksToClusters(books, clusters)
        expect(positioned.find((p) => p.id === "book-1")?.status).toBe("read")
        expect(positioned.find((p) => p.id === "book-2")?.status).toBe("queue")
    })

    it("clamps positioned x/y values into the inclusive 5..95 range", () => {
        // Given a cluster anchored at the canvas edge (x=0, y=0)
        // When books are placed around it
        // Then no positioned coordinate falls outside the 5..95 viewport bounds
        const clusters: BookCluster[] = [
            { id: "edge", label: "edge", x: 0, y: 0 },
        ]
        const books: Book[] = Array.from({ length: 6 }, (_, i) =>
            factoryBook({ id: i + 1, tags: ["edge"] }),
        )
        const positioned = assignBooksToClusters(books, clusters)
        for (const book of positioned) {
            expect(book.x).toBeGreaterThanOrEqual(5)
            expect(book.x).toBeLessThanOrEqual(95)
            expect(book.y).toBeGreaterThanOrEqual(5)
            expect(book.y).toBeLessThanOrEqual(95)
        }
    })

    it("computes related ids that exclude the book itself and cap at 4", () => {
        // Given six books all sharing one tag with the subject book
        // When the subject book is placed
        // Then related contains 4 ids and excludes the subject's own id
        const clusters: BookCluster[] = [
            { id: "alpha", label: "alpha", x: 50, y: 50 },
        ]
        const books: Book[] = Array.from({ length: 7 }, (_, i) =>
            factoryBook({ id: i + 1, tags: ["alpha"] }),
        )
        const positioned = assignBooksToClusters(books, clusters)
        const subject = positioned.find((p) => p.id === "book-1")
        expect(subject).toBeDefined()
        expect(subject!.related).toHaveLength(4)
        expect(subject!.related).not.toContain("book-1")
    })

    it("returns an empty related list for a book with no tags shared by anyone", () => {
        // Given the only book in a cluster has unique tags
        // When it is positioned
        // Then related is empty (no other book shares its tags)
        const clusters: BookCluster[] = [
            { id: "alpha", label: "alpha", x: 50, y: 50 },
        ]
        const books: Book[] = [
            factoryBook({ id: 1, tags: ["alpha"] }),
            factoryBook({ id: 2, tags: ["beta"] }),
        ]
        const positioned = assignBooksToClusters(books, clusters)
        const subject = positioned.find((p) => p.id === "book-1")
        expect(subject?.related).toEqual([])
    })

    it("uses the book.memo field for notes and falls back to empty string when null", () => {
        // Given one book with a memo and one without
        // When books are positioned
        // Then notes carries the memo or "" (never null)
        const clusters: BookCluster[] = [
            { id: "alpha", label: "alpha", x: 50, y: 50 },
        ]
        const books: Book[] = [
            factoryBook({ id: 1, tags: ["alpha"], memo: "great" }),
            factoryBook({ id: 2, tags: ["alpha"], memo: null }),
        ]
        const positioned = assignBooksToClusters(books, clusters)
        expect(positioned.find((p) => p.id === "book-1")?.notes).toBe("great")
        expect(positioned.find((p) => p.id === "book-2")?.notes).toBe("")
    })
})
