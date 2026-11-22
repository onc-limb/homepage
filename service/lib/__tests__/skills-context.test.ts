import fs from "node:fs"
import path from "node:path"
import { describe, it, expect } from "vitest"
import { getSkillFloor } from "@/lib/skills-meta"
import { parseSkillSources } from "@/lib/skills"

/**
 * Skill context / floor contract tests.
 *
 * Plan: skills の frontmatter に任意の `context`（work | study）を足し、
 *   getSkillFloor(skill) が "2f"（業務）か "b1"（自己学習）を返す。
 *   context が無いときは level で決める（3 以上 = 2f、2 以下 = b1）。
 *   parseSkillSources({ key, raw }[]) は parse・publish での絞り込み・name での重複除去を行い、
 *   キーのファイル名を slug として付ける。
 *
 * Reference: Issue #337, order.md やること2, design-system.md 「技術の階」
 */

const skillSource = (
    key: string,
    frontmatter: { name: string; category: string; level: number; publish: boolean; context?: string },
) => {
    const lines = [
        "---",
        `name: ${frontmatter.name}`,
        `category: ${frontmatter.category}`,
        `level: ${frontmatter.level}`,
        `publish: ${frontmatter.publish}`,
        ...(frontmatter.context === undefined ? [] : [`context: ${frontmatter.context}`]),
        "---",
        "",
        "## 経験",
        "",
        "- fixture",
        "",
    ]
    return { key, raw: lines.join("\n") }
}

describe("getSkillFloor()", () => {
    it("uses context over level", () => {
        // Given: 業務で使ったが level の低いスキルと、自己学習だが level の高いスキル
        expect(getSkillFloor({ context: "work", level: 1 })).toBe("2f")
        expect(getSkillFloor({ context: "study", level: 5 })).toBe("b1")
    })

    it("falls back to level when context is absent, splitting between level 2 and 3", () => {
        expect(getSkillFloor({ level: 3 })).toBe("2f")
        expect(getSkillFloor({ level: 2 })).toBe("b1")
    })

    it("maps the extreme levels without context", () => {
        expect(getSkillFloor({ level: 5 })).toBe("2f")
        expect(getSkillFloor({ level: 1 })).toBe("b1")
    })
})

describe("parseSkillSources()", () => {
    it("reads context from frontmatter and attaches the file name as slug", () => {
        const [skill] = parseSkillSources([
            skillSource("./language/rust-lang.md", {
                name: "Rust",
                category: "language",
                level: 1,
                publish: true,
                context: "work",
            }),
        ])

        expect(skill.slug).toBe("rust-lang")
        expect(skill.name).toBe("Rust")
        expect(skill.context).toBe("work")
        expect(getSkillFloor(skill)).toBe("2f")
    })

    it("leaves context undefined when frontmatter has none, so level decides", () => {
        const [skill] = parseSkillSources([
            skillSource("./frontend/vue.md", { name: "Vue", category: "frontend", level: 2, publish: true }),
        ])

        expect(skill.context).toBeUndefined()
        expect(getSkillFloor(skill)).toBe("b1")
    })

    it("ignores context values other than work / study and falls back to level", () => {
        const [skill] = parseSkillSources([
            skillSource("./tools/git.md", {
                name: "Git",
                category: "tools",
                level: 4,
                publish: true,
                context: "hobby",
            }),
        ])

        expect(skill.context).toBeUndefined()
        expect(getSkillFloor(skill)).toBe("2f")
    })

    it("excludes publish: false skills", () => {
        const skills = parseSkillSources([
            skillSource("./api/rest-api.md", { name: "REST API", category: "api", level: 3, publish: false }),
            skillSource("./api/graphql.md", { name: "GraphQL", category: "api", level: 3, publish: true }),
        ])

        expect(skills.map((skill) => skill.slug)).toEqual(["graphql"])
    })

    it("de-duplicates sources by skill name", () => {
        // webpack の require.context が同じファイルを複数回返す場合がある（skills.ts のコメント）
        const source = skillSource("./language/go.md", { name: "Go", category: "language", level: 3, publish: true })

        expect(parseSkillSources([source, source])).toHaveLength(1)
    })

    it("keeps the count of published skills in docs/skills", () => {
        // Given: docs/skills 配下の本物の md（require.context と同じ ./<category>/<file>.md のキー）
        const root = path.resolve(__dirname, "../../docs/skills")
        const sources = fs.readdirSync(root, { recursive: true, encoding: "utf-8" })
            .filter((file) => file.endsWith(".md"))
            .map((file) => ({
                key: `./${file.split(path.sep).join("/")}`,
                raw: fs.readFileSync(path.join(root, file), "utf-8"),
            }))
        const published = sources.filter(({ raw }) => /^publish:\s*true\s*$/m.test(raw))

        // When / Then: 公開されたものだけが、件数を変えずに返る
        const skills = parseSkillSources(sources)
        expect(skills).toHaveLength(published.length)
        expect(skills.every((skill) => skill.publish)).toBe(true)
    })
})

describe("client safety", () => {
    // getSkillFloor は Client Component から使える skills-meta.ts に置く。skills.ts や md を読み込まない。
    it("skills-meta.ts does not import skills.ts or markdown", () => {
        const source = fs.readFileSync(path.resolve(__dirname, "../skills-meta.ts"), "utf-8")
        const specifiers = [...source.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1])

        for (const specifier of specifiers) {
            expect(specifier).not.toMatch(/(^|\/)(skills|profile|portfolio|entries)$|\.md$/)
        }
    })
})
