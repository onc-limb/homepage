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
import { FLOORS, findGroup } from "@/lib/building/floors"

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
            "https://onc-limb.com",
            "https://onc-limb.com/b1",
            "https://onc-limb.com/1f",
            "https://onc-limb.com/2f",
            "https://onc-limb.com/3f",
            "https://onc-limb.com/rf",
            "https://onc-limb.com/profile",
            "https://onc-limb.com/skills",
            "https://onc-limb.com/portfolio",
            "https://onc-limb.com/1f/contact",
            "https://onc-limb.com/books",
            "https://onc-limb.com/blog",
            "https://onc-limb.com/portfolio/project-a",
            "https://onc-limb.com/portfolio/project-b",
            "https://onc-limb.com/blog/published-a",
            "https://onc-limb.com/blog/published-b",
        ])
        expect(mocks.listPublishedArticles).toHaveBeenCalledOnce()
    })

    it("lists the five floor pages built from FLOORS", async () => {
        const entries = await sitemap()
        const paths = entries.map((entry) => new URL(entry.url).pathname)

        expect(paths).toEqual(expect.arrayContaining(FLOORS.map((floor) => floor.url)))
    })

    it("lists the contact page at its 1F URL and drops the retired /contact and /social", async () => {
        const entries = await sitemap()
        const paths = entries.map((entry) => new URL(entry.url).pathname)

        expect(paths).toContain(findGroup("contact").url)
        expect(paths).toContain("/1f/contact")
        expect(paths).not.toContain("/contact")
        expect(paths).not.toContain("/social")
    })

    it("uses content timestamps instead of the build time", async () => {
        const entries = await sitemap()
        const byUrl = new Map(entries.map((entry) => [entry.url, entry]))

        expect(byUrl.get("https://onc-limb.com")?.lastModified).toBeUndefined()
        expect(byUrl.get("https://onc-limb.com/portfolio")?.lastModified).toEqual(
            new Date("2026-02-03T04:05:06+09:00"),
        )
        expect(byUrl.get("https://onc-limb.com/blog")?.lastModified).toEqual(
            new Date("2026-04-05T06:07:08+09:00"),
        )
        expect(byUrl.get("https://onc-limb.com/portfolio/project-a")?.lastModified).toEqual(
            new Date("2026-01-02T03:04:05+09:00"),
        )
        expect(byUrl.get("https://onc-limb.com/blog/published-a")?.lastModified).toEqual(
            new Date("2026-03-04T05:06:07+09:00"),
        )
    })

    it("does not list the /design token showcase", async () => {
        const entries = await sitemap()
        const paths = entries.map((entry) => new URL(entry.url).pathname)

        expect(paths.filter((path) => path === "/design" || path.startsWith("/design/"))).toEqual(
            [],
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
