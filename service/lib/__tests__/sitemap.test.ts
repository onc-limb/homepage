import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    listPublishedArticles: vi.fn(),
    getProjects: vi.fn(),
}))

vi.mock("@/lib/articles", () => ({
    listPublishedArticles: mocks.listPublishedArticles,
}))

vi.mock("@/lib/portfolio", () => ({
    getProjects: mocks.getProjects,
}))

import sitemap from "@/app/sitemap"

beforeEach(() => {
    vi.unstubAllEnvs()
    mocks.getProjects.mockReset()
    mocks.listPublishedArticles.mockReset()
    mocks.getProjects.mockReturnValue([
        { id: "project-a", updatedAt: "2026-01-02T03:04:05+09:00" },
        { id: "project-b", updatedAt: "2026-02-03T04:05:06+09:00" },
    ])
    mocks.listPublishedArticles.mockResolvedValue([
        { slug: "published-a", updatedAt: "2026-03-04T05:06:07+09:00" },
        { slug: "published-b", updatedAt: "2026-04-05T06:07:08+09:00" },
    ])
})

describe("sitemap", () => {
    it("includes every public static, portfolio, and published article URL", async () => {
        const entries = await sitemap()
        const urls = entries.map((entry) => entry.url)

        expect(urls).toEqual([
            "https://onclimb.net",
            "https://onclimb.net/profile",
            "https://onclimb.net/skills",
            "https://onclimb.net/portfolio",
            "https://onclimb.net/social",
            "https://onclimb.net/contact",
            "https://onclimb.net/books",
            "https://onclimb.net/blog",
            "https://onclimb.net/portfolio/project-a",
            "https://onclimb.net/portfolio/project-b",
            "https://onclimb.net/blog/published-a",
            "https://onclimb.net/blog/published-b",
        ])
        expect(mocks.listPublishedArticles).toHaveBeenCalledOnce()
    })

    it("uses content timestamps instead of the build time", async () => {
        const entries = await sitemap()
        const byUrl = new Map(entries.map((entry) => [entry.url, entry]))

        expect(byUrl.get("https://onclimb.net")?.lastModified).toBeUndefined()
        expect(byUrl.get("https://onclimb.net/portfolio")?.lastModified).toEqual(
            new Date("2026-02-03T04:05:06+09:00"),
        )
        expect(byUrl.get("https://onclimb.net/blog")?.lastModified).toEqual(
            new Date("2026-04-05T06:07:08+09:00"),
        )
        expect(byUrl.get("https://onclimb.net/portfolio/project-a")?.lastModified).toEqual(
            new Date("2026-01-02T03:04:05+09:00"),
        )
        expect(byUrl.get("https://onclimb.net/blog/published-a")?.lastModified).toEqual(
            new Date("2026-03-04T05:06:07+09:00"),
        )
    })

    it("uses NEXT_PUBLIC_SITE_URL and removes a trailing slash", async () => {
        vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://preview.example.com/")

        const entries = await sitemap()

        expect(
            entries.every(
                (entry) =>
                    entry.url === "https://preview.example.com" ||
                    entry.url.startsWith("https://preview.example.com/"),
            ),
        ).toBe(true)
        expect(entries.some((entry) => entry.url.includes(".com//"))).toBe(false)
    })
})
