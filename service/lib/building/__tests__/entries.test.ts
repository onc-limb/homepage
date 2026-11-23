import fs from "node:fs"
import path from "node:path"
import { afterEach, describe, it, expect, vi } from "vitest"
import type { CareerItem } from "@/lib/profile"
import { getEntries, type Entry } from "@/lib/building/entries"
import { getProfile } from "@/lib/profile"
import { getProjects } from "@/lib/portfolio"
import { SOCIAL_LINKS } from "@/lib/constants"

/**
 * getEntries contract tests.
 *
 * Plan: lib/building/entries.ts に Entry 型と getEntries() を置き、スキル・経歴・自己紹介・関心・資格・
 *   ポートフォリオ・外部リンクを 1 つの「紙」の一覧にそろえる。
 *   仮想パスと href は Issue #327 の表の最終形（FLOORS の移行中の href は使わない）。
 *
 * Reference: order.md やること3-5, Issue #327 「仮想パス」の表
 *
 * vitest では require.context が空の stub になり getSkills() が [] を返すため、
 * getSkills を「docs/skills の本物の md を parseSkillSources に渡す関数」に置き換える。
 */

vi.mock("@/lib/skills", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@/lib/skills")>()
    const nodeFs = await import("node:fs")
    const nodePath = await import("node:path")
    const root = nodePath.resolve(__dirname, "../../../docs/skills")
    const sources = nodeFs
        .readdirSync(root, { recursive: true, encoding: "utf-8" })
        .filter((file) => file.endsWith(".md"))
        .map((file) => ({
            key: `./${file.split(nodePath.sep).join("/")}`,
            raw: nodeFs.readFileSync(nodePath.join(root, file), "utf-8"),
        }))
    return { ...actual, getSkills: () => actual.parseSkillSources(sources) }
})

// 経歴だけを差し替えられるようにする（名前の作り方の境界を、本物の profile.md を変えずに確かめるため）
const careerOverride = vi.hoisted(() => ({ value: null as CareerItem[] | null }))

vi.mock("@/lib/profile", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@/lib/profile")>()
    return {
        ...actual,
        getParsedProfile: async () => {
            const parsed = await actual.getParsedProfile()
            return careerOverride.value ? { ...parsed, career: careerOverride.value } : parsed
        },
    }
})

afterEach(() => {
    careerOverride.value = null
})

const SKILLS_ROOT = path.resolve(__dirname, "../../../docs/skills")

type SkillFile = { category: string; name: string; level: number; publish: boolean; displayName: string }

const readSkillFiles = (): SkillFile[] =>
    fs
        .readdirSync(SKILLS_ROOT, { recursive: true, encoding: "utf-8" })
        .filter((file) => file.endsWith(".md"))
        .map((file) => {
            const raw = fs.readFileSync(path.join(SKILLS_ROOT, file), "utf-8")
            const [category, base] = file.split(path.sep)
            return {
                category,
                name: base.replace(/\.md$/, ""),
                level: Number(raw.match(/^level:\s*(\d)\s*$/m)?.[1]),
                publish: /^publish:\s*true\s*$/m.test(raw),
                displayName: raw.match(/^name:\s*(.+?)\s*$/m)?.[1] ?? "",
            }
        })

const byPath = (entries: Entry[], entryPath: string) => entries.find((entry) => entry.path === entryPath)

describe("getEntries()", () => {
    it("gives every entry a unique path", async () => {
        const entries = await getEntries()
        const paths = entries.map((entry) => entry.path)

        expect(paths.length).toBeGreaterThan(0)
        expect(new Set(paths).size).toBe(paths.length)
    })

    it("does not create notes or books entries", async () => {
        const entries = await getEntries()

        expect(entries.filter((entry) => /^~\/3f\/(notes|books)(\/|$)/.test(entry.path))).toEqual([])
    })

    describe("skills", () => {
        it("places a work skill in 2F skills by file name", async () => {
            // Given: docs/skills/language/typescript.md（publish: true、context なし、level 5）
            const entries = await getEntries()

            expect(byPath(entries, "~/2f/skills/language/typescript.md")).toEqual(
                expect.objectContaining({
                    floor: "2f",
                    group: "skills",
                    room: "language",
                    title: "TypeScript",
                    excerpt: "level 5（専門）",
                    href: "/2f/skills/typescript",
                    tags: ["language"],
                    level: 5,
                }),
            )
        })

        it("places a study skill in B1 studies by file name", async () => {
            // Given: docs/skills/language/rust.md（publish: true、context なし、level 1）
            const entries = await getEntries()

            expect(byPath(entries, "~/b1/studies/language/rust.md")).toEqual(
                expect.objectContaining({
                    floor: "b1",
                    group: "studies",
                    room: "language",
                    excerpt: "level 1（学習中）",
                    href: "/b1/studies/rust",
                    tags: ["language"],
                    level: 1,
                }),
            )
        })

        it("follows the path and href rule for every published skill", async () => {
            // Given: 本物の公開スキル（いまのデータに context は無いので level で階が決まる）
            const published = readSkillFiles().filter((file) => file.publish)
            const entries = await getEntries()
            const skillEntries = entries.filter((entry) => entry.group === "skills" || entry.group === "studies")

            expect(skillEntries).toHaveLength(published.length)
            for (const file of published) {
                const [dir, group] = file.level >= 3 ? ["2f", "skills"] : ["b1", "studies"]
                const entry = byPath(entries, `~/${dir}/${group}/${file.category}/${file.name}.md`)

                expect(entry, `${file.category}/${file.name}.md`).toBeDefined()
                expect(entry?.href).toBe(`/${dir}/${group}/${file.name}`)
                expect(entry?.room).toBe(file.category)
            }
        })

        it("does not include unpublished skills or display names in paths", async () => {
            // Given: docs/skills/api/rest-api.md（name: REST API、publish: false）など非公開のスキル
            const unpublished = readSkillFiles().filter((file) => !file.publish)
            const entries = await getEntries()
            const paths = entries.map((entry) => entry.path)

            expect(unpublished.length).toBeGreaterThan(0)
            expect(paths.some((entryPath) => entryPath.includes("rest-api"))).toBe(false)
            expect(paths.some((entryPath) => entryPath.includes("REST API"))).toBe(false)
            for (const file of unpublished) {
                expect(paths.some((entryPath) => entryPath.endsWith(`/${file.category}/${file.name}.md`))).toBe(false)
                expect(entries.some((entry) => entry.title === file.displayName)).toBe(false)
            }
        })
    })

    describe("histories", () => {
        it("numbers histories oldest first, so the last item in profile.md is 01", async () => {
            const entries = await getEntries()
            const histories = entries.filter((entry) => entry.group === "histories")

            expect(histories.map((entry) => entry.path).sort()).toEqual([
                "~/2f/histories/01-組み込み開発（車載ソフトウェア）.md",
                "~/2f/histories/02-リバースエンジニアリング（車載ソフトウェア）.md",
                "~/2f/histories/03-Web開発（人材系）.md",
                "~/2f/histories/04-MLOps（推薦系）.md",
                "~/2f/histories/05-AIドキュメント検索サービス.md",
            ])
        })

        it("uses the heading as title, the first bullet as excerpt and the histories page as href", async () => {
            const entries = await getEntries()

            expect(byPath(entries, "~/2f/histories/05-AIドキュメント検索サービス.md")).toEqual(
                expect.objectContaining({
                    floor: "2f",
                    group: "histories",
                    room: "histories",
                    title: "AIドキュメント検索サービス",
                    excerpt: "RAG 構成によるドキュメント検索基盤の設計・実装",
                    href: "/2f/histories",
                }),
            )
        })

        it("replaces only '/' and whitespace in the title with '-'", async () => {
            // Given: 題名に "/"・空白・全角括弧を含む経歴が 1 件だけある
            careerOverride.value = [{ role: "CI/CD 基盤（社内）", bullets: ["基盤の構築"] }]

            const entries = await getEntries()
            const histories = entries.filter((entry) => entry.group === "histories")

            // Then: "CI" のディレクトリはできず、全角括弧は残る
            expect(histories.map((entry) => entry.path)).toEqual(["~/2f/histories/01-CI-CD-基盤（社内）.md"])
        })

        it("keeps paths unique when two histories share the same heading", async () => {
            careerOverride.value = [
                { role: "Web開発", bullets: ["新しい方"] },
                { role: "Web開発", bullets: ["古い方"] },
            ]

            const entries = await getEntries()

            expect(byPath(entries, "~/2f/histories/01-Web開発.md")?.excerpt).toBe("古い方")
            expect(byPath(entries, "~/2f/histories/02-Web開発.md")?.excerpt).toBe("新しい方")
        })
    })

    describe("profile", () => {
        it("creates the self introduction entry with the job title as excerpt", async () => {
            const profile = await getProfile()
            const entries = await getEntries()

            expect(byPath(entries, "~/1f/profile/README.md")).toEqual(
                expect.objectContaining({
                    floor: "1f",
                    group: "profile",
                    room: "profile",
                    title: "自己紹介",
                    excerpt: profile.data.title,
                    href: "/1f/profile",
                }),
            )
        })

        it("creates one entry per interest under interests/", async () => {
            const entries = await getEntries()
            const interests = entries.filter((entry) => entry.path.startsWith("~/1f/profile/interests/"))

            expect(interests).toHaveLength(5)
            expect(byPath(entries, "~/1f/profile/interests/01-ドメインモデリング.md")).toEqual(
                expect.objectContaining({
                    floor: "1f",
                    group: "profile",
                    room: "profile",
                    title: "ドメインモデリング",
                    href: "/1f/profile",
                }),
            )
        })

        it("creates one entry per cert under certs/", async () => {
            const entries = await getEntries()
            const certs = entries.filter((entry) => entry.path.startsWith("~/1f/profile/certs/"))

            expect(certs).toHaveLength(6)
            for (const cert of certs) {
                expect(cert.path).toMatch(/^~\/1f\/profile\/certs\/\d{2}-[^/\s]+\.md$/)
                expect(cert).toEqual(expect.objectContaining({ floor: "1f", group: "profile", room: "profile", href: "/1f/profile" }))
            }
            // "-" は置き換えずに残り、空白だけが "-" になる
            expect(byPath(entries, "~/1f/profile/certs/01-AWS-Certified-Solutions-Architect---Associate.md")).toBeDefined()
        })

        it("does not turn the 学習 section into entries", async () => {
            const entries = await getEntries()

            expect(entries.some((entry) => entry.title === "技術書")).toBe(false)
            expect(entries.filter((entry) => entry.group === "profile")).toHaveLength(1 + 5 + 6)
        })
    })

    describe("portfolios", () => {
        it("creates one entry per project with its final path, href and fields", async () => {
            const projects = getProjects()
            const entries = await getEntries()
            const portfolios = entries.filter((entry) => entry.group === "portfolios")

            expect(portfolios).toHaveLength(projects.length)
            for (const project of projects) {
                expect(byPath(entries, `~/3f/portfolios/${project.id}.md`)).toEqual(
                    expect.objectContaining({
                        floor: "3f",
                        group: "portfolios",
                        room: "portfolios",
                        title: project.title,
                        excerpt: project.description,
                        href: `/3f/portfolios/${project.id}`,
                        tags: project.technologies,
                        date: project.updatedAt,
                    }),
                )
            }
        })
    })

    describe("rooftop links", () => {
        it("names each link by the first English word of its name, lowercased", async () => {
            const entries = await getEntries()
            const links = entries.filter((entry) => entry.floor === "rf")

            expect(links.map((entry) => entry.path).sort()).toEqual(["~/rf/github.url", "~/rf/x.url", "~/rf/zenn.url"])
        })

        it("links to the external url without a group or room", async () => {
            const entries = await getEntries()

            for (const [entryPath, link] of [
                ["~/rf/github.url", SOCIAL_LINKS.find((l) => l.name === "GitHub")],
                ["~/rf/zenn.url", SOCIAL_LINKS.find((l) => l.name === "Zenn")],
                ["~/rf/x.url", SOCIAL_LINKS.find((l) => l.name === "X (Twitter)")],
            ] as const) {
                expect(byPath(entries, entryPath)).toEqual(
                    expect.objectContaining({ floor: "rf", group: null, room: null, href: link?.url }),
                )
            }
        })

        it("does not use words in parentheses for the name", async () => {
            const entries = await getEntries()
            const paths = entries.map((entry) => entry.path)

            expect(paths).not.toContain("~/rf/x-(twitter).url")
            expect(paths).not.toContain("~/rf/twitter.url")
        })
    })
})
