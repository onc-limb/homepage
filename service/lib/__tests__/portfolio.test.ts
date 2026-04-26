import { describe, it, expect } from "vitest"
import { findAdjacentProjectIds, formatProjectNumber } from "@/lib/portfolio"

/**
 * findAdjacentProjectIds contract tests.
 *
 * Plan: docs/design/portfolio/onc-limb.html の pager（prev/next）に必要な
 *   隣接プロジェクト ID を導出する純粋関数を lib/portfolio.ts に追加する。
 *   getProjectIds() の順序で前後を導出する旨が計画レポートに記載されているが、
 *   テスト容易性のため id 配列と current id を受け取る純粋関数として実装する想定。
 *
 * Reference: docs/design/portfolio/onc-limb.html の pager セクション
 */

describe("findAdjacentProjectIds()", () => {
    it("returns the previous and next id for a middle entry", () => {
        // Given a 3-id list and the middle id is current
        // When adjacency is computed
        // Then prev and next match the surrounding ids
        const result = findAdjacentProjectIds(["a", "b", "c"], "b")
        expect(result).toEqual({ prev: "a", next: "c" })
    })

    it("returns no prev for the first entry", () => {
        // Given the first id is current
        // When adjacency is computed
        // Then prev is undefined and next is the second id
        const result = findAdjacentProjectIds(["a", "b", "c"], "a")
        expect(result.prev).toBeUndefined()
        expect(result.next).toBe("b")
    })

    it("returns no next for the last entry", () => {
        // Given the last id is current
        // When adjacency is computed
        // Then next is undefined and prev is the previous id
        const result = findAdjacentProjectIds(["a", "b", "c"], "c")
        expect(result.prev).toBe("b")
        expect(result.next).toBeUndefined()
    })

    it("returns no prev or next when the list has a single id", () => {
        // Given only one id exists
        // When adjacency is computed for that id
        // Then both prev and next are undefined
        const result = findAdjacentProjectIds(["only"], "only")
        expect(result.prev).toBeUndefined()
        expect(result.next).toBeUndefined()
    })

    it("returns an empty object when the current id is not in the list", () => {
        // Given a list that does not contain the current id
        // When adjacency is computed
        // Then both prev and next are undefined
        const result = findAdjacentProjectIds(["a", "b"], "missing")
        expect(result.prev).toBeUndefined()
        expect(result.next).toBeUndefined()
    })

    it("returns an empty object for an empty id list", () => {
        // Given an empty id list
        // When adjacency is computed
        // Then both prev and next are undefined
        const result = findAdjacentProjectIds([], "x")
        expect(result.prev).toBeUndefined()
        expect(result.next).toBeUndefined()
    })

    it("does not wrap from last back to first", () => {
        // Given the design pager has no wrap-around (no cycle indicator)
        // When the last id is current
        // Then next does not wrap to ids[0]
        const result = findAdjacentProjectIds(["a", "b"], "b")
        expect(result.next).toBeUndefined()
    })

    it("treats duplicate ids by using the first occurrence", () => {
        // Given duplicate ids slip through (defensive)
        // When adjacency is computed
        // Then it uses the first match for index lookup
        const result = findAdjacentProjectIds(["a", "b", "a", "c"], "a")
        expect(result.prev).toBeUndefined()
        expect(result.next).toBe("b")
    })
})

/**
 * formatProjectNumber contract tests.
 *
 * Family tag: dry-violation (ARCH-NEW-projectNumber-dup) re-prevention.
 *  Portfolio 一覧 / 詳細 / Pager の番号フォーマットを 1 箇所に集約したため、
 *  プレフィックス・桁数・区切りの仕様を契約として固定する。
 */
describe("formatProjectNumber()", () => {
    it("formats a personal project at index 0 as 'P/01'", () => {
        // Given category=personal and indexInList=0
        // When the number is formatted
        // Then prefix is P and the index becomes 01 (1-based, zero-padded to 2)
        expect(formatProjectNumber("personal", 0)).toBe("P/01")
    })

    it("formats a work project at index 0 as 'W/01'", () => {
        // Given category=work and indexInList=0
        // When the number is formatted
        // Then prefix is W
        expect(formatProjectNumber("work", 0)).toBe("W/01")
    })

    it("zero-pads the index to two digits for indices below 10", () => {
        // Given indexInList=4 (5th entry)
        // When the number is formatted
        // Then the index is "05"
        expect(formatProjectNumber("personal", 4)).toBe("P/05")
    })

    it("does not truncate indices that already span two digits", () => {
        // Given indexInList=11 (12th entry)
        // When the number is formatted
        // Then the index is "12" (no truncation, no padding)
        expect(formatProjectNumber("work", 11)).toBe("W/12")
    })
})
