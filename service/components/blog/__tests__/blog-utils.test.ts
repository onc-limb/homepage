import { describe, it, expect } from "vitest"
import {
    ALL_TAG,
    collectTags,
    excerpt,
    filterByTag,
    filterPublished,
    formatDate,
    type BlogArticle,
} from "@/components/blog/blog-utils"

function make(over: Partial<BlogArticle>): BlogArticle {
    return {
        id: 1,
        slug: "s",
        title: "t",
        body: "b",
        status: "published",
        tags: [],
        createdAt: "2026-01-01 00:00:00",
        updatedAt: "2026-01-01 00:00:00",
        ...over,
    }
}

describe("filterPublished", () => {
    it("keeps only published articles and drops drafts", () => {
        const list = [
            make({ slug: "a", status: "published" }),
            make({ slug: "b", status: "draft" }),
            make({ slug: "c", status: "published" }),
        ]
        const result = filterPublished(list)
        expect(result.map((a) => a.slug)).toEqual(["a", "c"])
        expect(result.some((a) => a.status === "draft")).toBe(false)
    })
})

describe("collectTags", () => {
    it("returns unique tag names sorted alphabetically", () => {
        const list = [
            make({ tags: ["ts", "go"] }),
            make({ tags: ["go", "rust"] }),
        ]
        expect(collectTags(list)).toEqual(["go", "rust", "ts"])
    })

    it("returns an empty array when there are no tags", () => {
        expect(collectTags([make({ tags: [] })])).toEqual([])
    })
})

describe("filterByTag", () => {
    const list = [
        make({ slug: "a", tags: ["ts"] }),
        make({ slug: "b", tags: ["go"] }),
        make({ slug: "c", tags: ["ts", "go"] }),
    ]

    it("returns all articles when tag is undefined or ALL_TAG", () => {
        expect(filterByTag(list, undefined)).toHaveLength(3)
        expect(filterByTag(list, ALL_TAG)).toHaveLength(3)
    })

    it("returns only articles containing the selected tag", () => {
        expect(filterByTag(list, "ts").map((a) => a.slug)).toEqual(["a", "c"])
        expect(filterByTag(list, "go").map((a) => a.slug)).toEqual(["b", "c"])
    })

    it("returns an empty array for an unknown tag", () => {
        expect(filterByTag(list, "nope")).toEqual([])
    })
})

describe("excerpt", () => {
    it("strips markdown syntax", () => {
        const out = excerpt("# Hello\n\nThis is **bold** and `code`.", 200)
        expect(out).toContain("Hello")
        expect(out).toContain("bold")
        expect(out).not.toContain("**")
        expect(out).not.toContain("#")
    })

    it("truncates with an ellipsis when longer than max", () => {
        const out = excerpt("word ".repeat(100), 20)
        expect(out.endsWith("…")).toBe(true)
        expect(out.length).toBeLessThanOrEqual(21)
    })
})

describe("formatDate", () => {
    it("keeps the date part only", () => {
        expect(formatDate("2026-01-02 03:04:05")).toBe("2026-01-02")
    })

    it("returns an empty string for empty input", () => {
        expect(formatDate("")).toBe("")
    })
})
