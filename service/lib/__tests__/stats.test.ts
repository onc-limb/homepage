import { beforeEach, describe, expect, it, vi } from "vitest"

import { articles, bookTags, books } from "../db/schema"
import {
    countPublishedArticles,
    countReadBooks,
    countTotalBooks,
    countUsedTags,
    getHomeStats,
} from "../stats"

// `../db`（drizzle + libsql インスタンス）を差し替える。stats.ts は `db` の
// live binding を参照するので、getter 経由で毎回 mockRef.db を返す。
const mockRef = vi.hoisted(() => ({ db: undefined as unknown }))

vi.mock("../db", () => ({
    get db() {
        return mockRef.db
    },
}))

type Counts = {
    totalBooks: number
    readBooks: number
    publishedArticles: number
    usedTags: number
}

// drizzle のクエリビルダを模した最小フェイク。
// - `.from(table)` は「where 無し」で await される（総書籍数・ユニークタグ数）と
//   ベース行を返す thenable。
// - `.where()` は「where 付き」で await される（読了書籍数・公開記事数）と
//   フィルタ後の行を返す。
// どのテーブルへの where が実行されたかを whereCalls に記録し、フィルタの意図
// （読了のみ／公開のみ）を検証できるようにする。
function fakeDb(counts: Partial<Counts>) {
    const c: Counts = {
        totalBooks: counts.totalBooks ?? 0,
        readBooks: counts.readBooks ?? 0,
        publishedArticles: counts.publishedArticles ?? 0,
        usedTags: counts.usedTags ?? 0,
    }

    const whereCalls: string[] = []
    const nameOf = (t: unknown) =>
        t === books ? "books" : t === articles ? "articles" : t === bookTags ? "book_tags" : "other"

    const db = {
        select() {
            return {
                from(table: unknown) {
                    const base =
                        table === books
                            ? [{ value: c.totalBooks }]
                            : table === bookTags
                              ? [{ value: c.usedTags }]
                              : []
                    const settled = Promise.resolve(base)
                    return {
                        where() {
                            whereCalls.push(nameOf(table))
                            const rows =
                                table === books
                                    ? [{ value: c.readBooks }]
                                    : table === articles
                                      ? [{ value: c.publishedArticles }]
                                      : []
                            return Promise.resolve(rows)
                        },
                        then: settled.then.bind(settled),
                    }
                },
            }
        },
    }

    return { db, whereCalls }
}

// ベース行にも where 後の行にも空配列を返す DB（対象 0 件を再現）。
function emptyDb() {
    const db = {
        select() {
            return {
                from() {
                    const settled = Promise.resolve([] as Array<{ value: number }>)
                    return {
                        where() {
                            return Promise.resolve([] as Array<{ value: number }>)
                        },
                        then: settled.then.bind(settled),
                    }
                },
            }
        },
    }
    return { db }
}

describe("stats aggregation", () => {
    beforeEach(() => {
        mockRef.db = undefined
    })

    it("countReadBooks は is_read = true でフィルタした件数を返す", async () => {
        const { db, whereCalls } = fakeDb({ totalBooks: 12, readBooks: 8 })
        mockRef.db = db

        await expect(countReadBooks()).resolves.toBe(8)
        // 読了書籍数は where フィルタ経由で集計される（未読を除外する意図）。
        expect(whereCalls).toEqual(["books"])
    })

    it("countTotalBooks は where 無しで全書籍を数える", async () => {
        const { db, whereCalls } = fakeDb({ totalBooks: 12, readBooks: 8 })
        mockRef.db = db

        await expect(countTotalBooks()).resolves.toBe(12)
        // 総書籍数はフィルタしない。
        expect(whereCalls).toEqual([])
    })

    it("countPublishedArticles は status = 'published' でフィルタした件数を返す", async () => {
        const { db, whereCalls } = fakeDb({ publishedArticles: 5 })
        mockRef.db = db

        await expect(countPublishedArticles()).resolves.toBe(5)
        // 公開記事数は where フィルタ経由で集計される（下書きを除外する意図）。
        expect(whereCalls).toEqual(["articles"])
    })

    it("countUsedTags は book_tags 由来のユニークタグ数を返す", async () => {
        const { db, whereCalls } = fakeDb({ usedTags: 7 })
        mockRef.db = db

        await expect(countUsedTags()).resolves.toBe(7)
        // 使用タグ数はフィルタせず countDistinct で集計する。
        expect(whereCalls).toEqual([])
    })

    it("getHomeStats は 4 枠すべてを DB 集計値で組み立てる", async () => {
        const { db, whereCalls } = fakeDb({
            totalBooks: 12,
            readBooks: 8,
            publishedArticles: 5,
            usedTags: 7,
        })
        mockRef.db = db

        await expect(getHomeStats()).resolves.toEqual({
            readBooksCount: 8,
            publishedArticlesCount: 5,
            usedTagCount: 7,
            totalBooksCount: 12,
        })

        // フィルタが掛かるのは読了書籍数（books）と公開記事数（articles）のみ。
        expect(whereCalls.sort()).toEqual(["articles", "books"])
    })

    it("集計対象が 0 件のときは全枠 0 になる（空結果へのフォールバック）", async () => {
        mockRef.db = emptyDb().db

        await expect(getHomeStats()).resolves.toEqual({
            readBooksCount: 0,
            publishedArticlesCount: 0,
            usedTagCount: 0,
            totalBooksCount: 0,
        })
    })
})
