import { describe, expect, it } from "vitest"

import { findGroup } from "@/lib/building/floors"
import { parseSkillSources } from "@/lib/skills"
import {
    SKILL_SECTION_TITLES,
    hasSkillDetail,
    listSkillDetailsOnFloor,
    listSkillsOnFloor,
    resolveSkillPage,
    skillGroup,
    skillHref,
    skillVirtualPath,
    type Skill,
    type SkillCategory,
    type SkillLevel,
} from "@/lib/skills-meta"

/**
 * Skill detail contract tests (pure functions).
 *
 * - skillGroup / skillHref / skillVirtualPath give the group, the URL
 *   (/2f/skills/<slug> or /b1/studies/<slug>) and the virtual path
 *   (~/2f/skills/<category>/<slug>.md) of a skill, from FLOORS.
 * - listSkillsOnFloor gives the skills of one floor in the order of the list
 *   page: categoryOrder, then level (highest first), then name.
 * - hasSkillDetail(skill) is true when any of the four body sections has an
 *   item. Only those skills get a detail page (static params, sitemap,
 *   prev / next); a skill with an empty body is missing (404).
 * - resolveSkillPage(skills, group, slug) returns
 *   found (with prev / next on the same floor), moved (the URL on the right
 *   floor) or missing. It only looks at the skills it is given, which are the
 *   published ones.
 * - The md body is parsed into sections: the items before the first "###"
 *   and one subsection per "###" line. Indentation still nests the items.
 */

const factorySkill = (
    overrides: Partial<Skill> & { name: string; slug: string; category: SkillCategory; level: SkillLevel },
): Skill => ({
    publish: true,
    // A detail page needs a body; the default skill has one experience item.
    experience: { items: [{ text: "used it at work", children: [] }], subsections: [] },
    knowledge: { items: [], subsections: [] },
    relatedTech: [],
    relatedBooks: [],
    ...overrides,
})

const source = (key: string, body: string[]) => ({
    key,
    raw: ["---", "name: TypeScript", "category: language", "level: 5", "publish: true", "---", "", ...body].join("\n"),
})

// 2F: language Go 5 / Alpha 3 / Ruby 3, framework Express 4. B1: language Rust 2, ml Torch 3 (study).
// The input order is neither the list order nor the name order.
const SKILLS: Skill[] = [
    factorySkill({ name: "Express", slug: "express", category: "framework", level: 4 }),
    factorySkill({ name: "Torch", slug: "torch", category: "ml", level: 3, context: "study" }),
    factorySkill({ name: "Ruby", slug: "ruby", category: "language", level: 3 }),
    factorySkill({ name: "Rust", slug: "rust-lang", category: "language", level: 2 }),
    factorySkill({ name: "Go", slug: "golang", category: "language", level: 5 }),
    factorySkill({ name: "Alpha", slug: "alpha", category: "language", level: 3 }),
]

const bySlug = (slug: string): Skill => SKILLS.find((skill) => skill.slug === slug)!

describe("skillGroup() / skillHref() / skillVirtualPath()", () => {
    it("puts a work skill in the skills group of 2F, with its slug (not its name) in the URL and the path", () => {
        const go = bySlug("golang")
        expect(skillGroup(go)).toBe(findGroup("skills"))
        expect(skillHref(go)).toBe("/2f/skills/golang")
        expect(skillVirtualPath(go)).toBe("~/2f/skills/language/golang.md")
    })

    it("puts a study skill in the studies group of B1, by context or by level", () => {
        expect(skillGroup(bySlug("torch"))).toBe(findGroup("studies"))
        expect(skillHref(bySlug("torch"))).toBe("/b1/studies/torch")
        expect(skillVirtualPath(bySlug("torch"))).toBe("~/b1/studies/ml/torch.md")
        expect(skillHref(bySlug("rust-lang"))).toBe("/b1/studies/rust-lang")
        expect(skillVirtualPath(bySlug("rust-lang"))).toBe("~/b1/studies/language/rust-lang.md")
    })
})

describe("listSkillsOnFloor()", () => {
    it("lists the skills of one floor in the list order: category, then level (highest first), then name", () => {
        expect(listSkillsOnFloor(SKILLS, "2f").map((skill) => skill.slug)).toEqual([
            "golang",
            "alpha",
            "ruby",
            "express",
        ])
        expect(listSkillsOnFloor(SKILLS, "b1").map((skill) => skill.slug)).toEqual(["rust-lang", "torch"])
    })
})

describe("resolveSkillPage()", () => {
    const skills = findGroup("skills")
    const studies = findGroup("studies")

    it("finds a skill on its own floor, with the previous and the next skill of the list", () => {
        const result = resolveSkillPage(SKILLS, skills, "alpha")
        expect(result.kind).toBe("found")
        if (result.kind !== "found") return
        expect(result.skill.slug).toBe("alpha")
        expect(result.prev?.slug).toBe("golang")
        expect(result.next?.slug).toBe("ruby")
    })

    it("has no previous skill for the first skill of the floor", () => {
        const result = resolveSkillPage(SKILLS, skills, "golang")
        if (result.kind !== "found") throw new Error(`expected found, got ${result.kind}`)
        expect(result.prev).toBeUndefined()
        expect(result.next?.slug).toBe("alpha")
    })

    it("has no next skill for the last skill of the floor, even when B1 has skills (no crossing floors)", () => {
        const last2f = resolveSkillPage(SKILLS, skills, "express")
        if (last2f.kind !== "found") throw new Error(`expected found, got ${last2f.kind}`)
        expect(last2f.prev?.slug).toBe("ruby")
        expect(last2f.next).toBeUndefined()

        const first1b = resolveSkillPage(SKILLS, studies, "rust-lang")
        if (first1b.kind !== "found") throw new Error(`expected found, got ${first1b.kind}`)
        expect(first1b.prev).toBeUndefined()
        expect(first1b.next?.slug).toBe("torch")
    })

    it("moves a skill opened under the other floor to its own URL, in both directions", () => {
        expect(resolveSkillPage(SKILLS, studies, "golang")).toEqual({ kind: "moved", href: "/2f/skills/golang" })
        expect(resolveSkillPage(SKILLS, skills, "torch")).toEqual({ kind: "moved", href: "/b1/studies/torch" })
    })

    it("is missing for an unknown slug, and for the skill name instead of the slug", () => {
        expect(resolveSkillPage(SKILLS, skills, "unknown")).toEqual({ kind: "missing" })
        expect(resolveSkillPage(SKILLS, skills, "Go")).toEqual({ kind: "missing" })
        expect(resolveSkillPage([], studies, "torch")).toEqual({ kind: "missing" })
    })

    it("is missing for a skill that is not published (parseSkillSources leaves it out)", () => {
        const published = parseSkillSources([
            {
                key: "./language/hidden.md",
                raw: ["---", "name: Hidden", "category: language", "level: 5", "publish: false", "---", ""].join("\n"),
            },
        ])
        expect(resolveSkillPage(published, skills, "hidden")).toEqual({ kind: "missing" })
    })
})

describe("skills with an empty body", () => {
    const skills = findGroup("skills")
    const empty = (overrides: Partial<Skill> = {}) =>
        factorySkill({
            name: "Empty",
            slug: "empty",
            category: "language",
            level: 4,
            experience: { items: [], subsections: [] },
            ...overrides,
        })

    it("have no detail when all four sections are empty, or a ### has no items", () => {
        expect(hasSkillDetail(empty())).toBe(false)
        expect(hasSkillDetail(empty({ experience: { items: [], subsections: [{ title: "業務", items: [] }] } }))).toBe(false)
    })

    it("have a detail as soon as any section has an item", () => {
        const item = { text: "x", children: [] }
        expect(hasSkillDetail(empty({ experience: { items: [], subsections: [{ title: "業務", items: [item] }] } }))).toBe(true)
        expect(hasSkillDetail(empty({ knowledge: { items: [item], subsections: [] } }))).toBe(true)
        expect(hasSkillDetail(empty({ relatedTech: ["Node.js"] }))).toBe(true)
        expect(hasSkillDetail(empty({ relatedBooks: ["a book"] }))).toBe(true)
    })

    it("are missing (404) on both floors, and are skipped by the previous and next doors", () => {
        // Go 5 / Empty 4 / Alpha 3 on 2F language: Empty sits between Go and Alpha in the list.
        const withEmpty = [...SKILLS, empty()]
        expect(resolveSkillPage(withEmpty, skills, "empty")).toEqual({ kind: "missing" })
        expect(resolveSkillPage(withEmpty, findGroup("studies"), "empty")).toEqual({ kind: "missing" })
        expect(listSkillDetailsOnFloor(withEmpty, "2f").map((skill) => skill.slug)).not.toContain("empty")

        const alpha = resolveSkillPage(withEmpty, skills, "alpha")
        if (alpha.kind !== "found") throw new Error(`expected found, got ${alpha.kind}`)
        expect(alpha.prev?.slug).toBe("golang")
    })
})

describe("SKILL_SECTION_TITLES", () => {
    it("names the four sections of the md body", () => {
        expect(SKILL_SECTION_TITLES).toEqual({
            experience: "経験",
            knowledge: "知識",
            relatedTech: "関連技術",
            relatedBooks: "関連書籍",
        })
    })
})

describe("parsing the md body into sections", () => {
    it("turns each ### line into a subsection with the items under it", () => {
        const [skill] = parseSkillSources([
            source("./language/typescript.md", [
                "## 経験",
                "",
                "### 業務",
                "",
                "- API サーバー実装",
                "- 型定義",
                "",
                "### 個人",
                "",
                "- フロントエンド実装",
                "",
                "## 知識",
                "",
                "- 基本文法",
            ]),
        ])
        expect(skill.experience).toEqual({
            items: [],
            subsections: [
                {
                    title: "業務",
                    items: [
                        { text: "API サーバー実装", children: [] },
                        { text: "型定義", children: [] },
                    ],
                },
                { title: "個人", items: [{ text: "フロントエンド実装", children: [] }] },
            ],
        })
    })

    it("keeps an item with children as an item (not a subsection), and ignores #### and * lines as today", () => {
        const [skill] = parseSkillSources([
            source("./language/typescript.md", [
                "## 知識",
                "",
                "- 基本文法",
                "- JavaScript へのトランスパイル",
                "    - tsc による型チェック",
                "    - swc によるコンパイル",
                "#### x",
                "* y",
                "- 型ガード",
            ]),
        ])
        expect(skill.knowledge).toEqual({
            items: [
                { text: "基本文法", children: [] },
                {
                    text: "JavaScript へのトランスパイル",
                    children: [
                        { text: "tsc による型チェック", children: [] },
                        { text: "swc によるコンパイル", children: [] },
                    ],
                },
                { text: "型ガード", children: [] },
            ],
            subsections: [],
        })
    })

    it("keeps the items before the first ### apart from the subsections, and nests inside a subsection", () => {
        const [skill] = parseSkillSources([
            source("./language/typescript.md", [
                "## 経験",
                "",
                "- 全体の話",
                "",
                "### 業務",
                "",
                "- 親",
                "  - 子",
            ]),
        ])
        expect(skill.experience).toEqual({
            items: [{ text: "全体の話", children: [] }],
            subsections: [{ title: "業務", items: [{ text: "親", children: [{ text: "子", children: [] }] }] }],
        })
    })

    it("gives empty sections when the md has no 経験 or 知識", () => {
        const [skill] = parseSkillSources([source("./language/typescript.md", ["## 関連書籍", "", "- 本"])])
        expect(skill.experience).toEqual({ items: [], subsections: [] })
        expect(skill.knowledge).toEqual({ items: [], subsections: [] })
        expect(skill.relatedBooks).toEqual(["本"])
    })
})
