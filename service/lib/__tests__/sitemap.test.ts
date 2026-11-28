import fs from "node:fs"
import path from "node:path"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    listPublishedArticles: vi.fn(),
    getProjects: vi.fn(),
    getSkills: vi.fn(),
}))

vi.mock("@/lib/articles", () => ({
    listPublishedArticles: mocks.listPublishedArticles,
}))

// the real listProjects / projectHref are kept; only the md loading is replaced
vi.mock("@/lib/portfolio", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@/lib/portfolio")>()),
    getProjects: mocks.getProjects,
}))

// vitest stubs require.context, so getSkills() is replaced; the default is no skills
vi.mock("@/lib/skills", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@/lib/skills")>()),
    getSkills: mocks.getSkills,
}))

import sitemap from "@/app/sitemap"
import { FLOORS, findGroup } from "@/lib/building/floors"
import { parseSkillSources } from "@/lib/skills"
import { hasSkillDetail, skillHref } from "@/lib/skills-meta"
import { listProjects, projectHref, type Project } from "@/lib/portfolio"

/** The real docs/skills md, as require.context would give them. */
function realSkillSources() {
    const root = path.resolve(__dirname, "../../docs/skills")
    return fs
        .readdirSync(root, { recursive: true, encoding: "utf-8" })
        .filter((file) => file.endsWith(".md"))
        .map((file) => ({
            key: `./${file.split(path.sep).join("/")}`,
            raw: fs.readFileSync(path.join(root, file), "utf-8"),
        }))
}

beforeEach(() => {
    vi.unstubAllEnvs()
    mocks.getProjects.mockReset()
    mocks.listPublishedArticles.mockReset()
    mocks.getSkills.mockReset()
    mocks.getSkills.mockReturnValue([])
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
            "https://onc-limb.com/1f/profile",
            "https://onc-limb.com/2f/histories",
            "https://onc-limb.com/2f/skills",
            "https://onc-limb.com/b1/studies",
            "https://onc-limb.com/3f/portfolios",
            "https://onc-limb.com/1f/contact",
            "https://onc-limb.com/books",
            "https://onc-limb.com/blog",
            // newest first, in the order of the list page
            "https://onc-limb.com/3f/portfolios/project-b",
            "https://onc-limb.com/3f/portfolios/project-a",
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

    it("lists the profile at its 1F URL and the histories at their 2F URL, and drops the retired /profile", async () => {
        const entries = await sitemap()
        const paths = entries.map((entry) => new URL(entry.url).pathname)

        expect(paths).toContain(findGroup("profile").url)
        expect(paths).toContain("/1f/profile")
        expect(paths).toContain(findGroup("histories").url)
        expect(paths).toContain("/2f/histories")
        expect(paths).not.toContain("/profile")
    })

    it("lists the skills at their 2F URL and the studies at their B1 URL, and drops the retired /skills", async () => {
        const entries = await sitemap()
        const paths = entries.map((entry) => new URL(entry.url).pathname)

        expect(paths).toContain(findGroup("skills").url)
        expect(paths).toContain("/2f/skills")
        expect(paths).toContain(findGroup("studies").url)
        expect(paths).toContain("/b1/studies")
        expect(paths).not.toContain("/skills")
    })

    it("uses content timestamps instead of the build time", async () => {
        const entries = await sitemap()
        const byUrl = new Map(entries.map((entry) => [entry.url, entry]))

        expect(byUrl.get("https://onc-limb.com")?.lastModified).toBeUndefined()
        expect(byUrl.get("https://onc-limb.com/3f/portfolios")?.lastModified).toEqual(
            new Date("2026-02-03T04:05:06+09:00"),
        )
        expect(byUrl.get("https://onc-limb.com/blog")?.lastModified).toEqual(
            new Date("2026-04-05T06:07:08+09:00"),
        )
        expect(byUrl.get("https://onc-limb.com/3f/portfolios/project-a")?.lastModified).toEqual(
            new Date("2026-01-02T03:04:05+09:00"),
        )
        expect(byUrl.get("https://onc-limb.com/blog/published-a")?.lastModified).toEqual(
            new Date("2026-03-04T05:06:07+09:00"),
        )
    })

    it("lists the portfolios at their 3F URL and drops the retired /portfolio URLs", async () => {
        const entries = await sitemap()
        const paths = entries.map((entry) => new URL(entry.url).pathname)

        expect(paths).toContain(findGroup("portfolios").url)
        expect(paths).toContain("/3f/portfolios")
        expect(paths.filter((pathname) => pathname === "/portfolio" || pathname.startsWith("/portfolio/"))).toEqual([])
    })

    it("lists one detail page per project, from the same list as the list page", async () => {
        const projects = mocks.getProjects() as Project[]
        const entries = await sitemap()
        const prefix = `${findGroup("portfolios").url}/`
        const detailPaths = entries
            .map((entry) => new URL(entry.url).pathname)
            .filter((pathname) => pathname.startsWith(prefix))

        expect(detailPaths).toEqual(listProjects(projects).map(projectHref))
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

    it("lists one detail page per published skill that has a body, at its own floor's URL, after the existing URLs", async () => {
        const sources = realSkillSources()
        const published = parseSkillSources(sources)
        expect(published.length).toBeGreaterThan(0)
        const withoutSkills = (await sitemap()).map((entry) => entry.url)

        mocks.getSkills.mockReturnValue(published)
        const urls = (await sitemap()).map((entry) => entry.url)

        // the existing URLs keep their order; the skill pages are added after them
        expect(urls.slice(0, withoutSkills.length)).toEqual(withoutSkills)
        const added = urls.slice(withoutSkills.length)
        expect([...added].sort()).toEqual(
            published.filter(hasSkillDetail).map((skill) => `https://onc-limb.com${skillHref(skill)}`).sort(),
        )
        // skills with an empty body have no detail page, so the sitemap leaves them out
        expect(added.length).toBeLessThan(published.length)

        const detailPaths = urls
            .map((url) => new URL(url).pathname)
            .filter((pathname) =>
                [findGroup("skills").url, findGroup("studies").url].some((list) => pathname.startsWith(`${list}/`)),
            )
        const withBody = published.filter(hasSkillDetail).length
        expect(detailPaths).toHaveLength(withBody)
        expect(new Set(detailPaths).size).toBe(withBody)

        // no unpublished skill is listed
        const unpublished = sources
            .filter((source) => /^publish:\s*false\s*$/m.test(source.raw))
            .map((source) => source.key.replace(/^.*\//, "").replace(/\.md$/, ""))
        expect(unpublished.length).toBeGreaterThan(0)
        for (const slug of unpublished) {
            expect(detailPaths.filter((pathname) => pathname.endsWith(`/${slug}`)), slug).toEqual([])
        }
    })
})
