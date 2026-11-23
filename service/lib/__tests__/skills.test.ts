import fs from "node:fs"
import path from "node:path"
import { describe, it, expect } from "vitest"
import * as skillsModule from "@/lib/skills"
import { sortSkillsByLevel } from "@/lib/skills"
import type { Skill, SkillCategory, SkillLevel } from "@/lib/skills"
import { groupSkillsByCategory, levelGauge, levelLabels } from "@/lib/skills-meta"

/**
 * Skill list contract tests.
 *
 * The skills list (/2f/skills) and the studies list (/b1/studies) show the skills
 * of one floor as one table per category: categories in categoryOrder, rows by
 * level (highest first), and no category without skills. The level column shows
 * a five-step gauge (filled ● and empty ○) and the level label.
 * The radar chart, the skill bars and their helpers are gone.
 */

const factorySkill = (overrides: Partial<Skill> & { category: SkillCategory; level: SkillLevel }): Skill => ({
    name: "fixture",
    slug: "fixture",
    publish: true,
    experience: [],
    knowledge: [],
    relatedTech: [],
    relatedBooks: [],
    ...overrides,
})

describe("sortSkillsByLevel()", () => {
    it("sorts skills by level in descending order", () => {
        const skills = [
            factorySkill({ name: "Low", category: "language", level: 1 }),
            factorySkill({ name: "High", category: "language", level: 5 }),
            factorySkill({ name: "Middle", category: "language", level: 3 }),
        ]

        expect(sortSkillsByLevel(skills).map((skill) => skill.level)).toEqual([
            5, 3, 1,
        ])
    })

    it("sorts skills with the same level by name in ascending order", () => {
        const skills = [
            factorySkill({ name: "TypeScript", category: "language", level: 4 }),
            factorySkill({ name: "Go", category: "language", level: 4 }),
            factorySkill({ name: "Rust", category: "language", level: 4 }),
        ]

        expect(sortSkillsByLevel(skills).map((skill) => skill.name)).toEqual([
            "Go",
            "Rust",
            "TypeScript",
        ])
    })

    it("does not mutate the input array", () => {
        const skills = [
            factorySkill({ name: "Low", category: "language", level: 1 }),
            factorySkill({ name: "High", category: "language", level: 5 }),
        ]
        const original = [...skills]

        const sorted = sortSkillsByLevel(skills)

        expect(skills).toEqual(original)
        expect(sorted).not.toBe(skills)
    })

    it("returns an empty array for an empty input", () => {
        expect(sortSkillsByLevel([])).toEqual([])
    })
})

describe("groupSkillsByCategory()", () => {
    it("keeps only the skills of the given floor, using context over level", () => {
        const skills = [
            factorySkill({ name: "Work High", category: "language", level: 4 }),
            factorySkill({ name: "Study Low", category: "language", level: 2 }),
            factorySkill({ name: "Study High", category: "language", level: 4, context: "study" }),
            factorySkill({ name: "Work Low", category: "language", level: 1, context: "work" }),
        ]

        const names = (floor: "2f" | "b1") =>
            groupSkillsByCategory(skills, floor).flatMap((group) => group.skills.map((skill) => skill.name))

        expect(names("2f")).toEqual(["Work High", "Work Low"])
        expect(names("b1")).toEqual(["Study High", "Study Low"])
    })

    it("orders the categories by categoryOrder, not by name or by input order", () => {
        // framework comes before language by name and in the input, but after it in categoryOrder
        const skills = [
            factorySkill({ name: "Express", category: "framework", level: 4 }),
            factorySkill({ name: "Docker", category: "container", level: 4 }),
            factorySkill({ name: "Go", category: "language", level: 4 }),
        ]

        expect(groupSkillsByCategory(skills, "2f").map((group) => group.category)).toEqual([
            "language",
            "framework",
            "container",
        ])
    })

    it("sorts the skills of a category by level, highest first, then by name", () => {
        const skills = [
            factorySkill({ name: "Ruby", category: "language", level: 3 }),
            factorySkill({ name: "Go", category: "language", level: 5 }),
            factorySkill({ name: "C", category: "language", level: 3 }),
            factorySkill({ name: "TypeScript", category: "language", level: 4 }),
        ]

        const [language] = groupSkillsByCategory(skills, "2f")
        expect(language.skills.map((skill) => [skill.name, skill.level])).toEqual([
            ["Go", 5],
            ["TypeScript", 4],
            ["C", 3],
            ["Ruby", 3],
        ])
    })

    it("leaves out the categories that have no skill on the floor", () => {
        // ml only has a study skill, so the 2F list has no ml category
        const skills = [
            factorySkill({ name: "PyTorch", category: "ml", level: 3, context: "study" }),
            factorySkill({ name: "Go", category: "language", level: 5 }),
        ]

        const groups = groupSkillsByCategory(skills, "2f")
        expect(groups.map((group) => group.category)).toEqual(["language"])
        for (const group of groups) expect(group.skills.length, group.category).toBeGreaterThan(0)
    })

    it("returns no category for no skills", () => {
        expect(groupSkillsByCategory([], "2f")).toEqual([])
        expect(groupSkillsByCategory([], "b1")).toEqual([])
    })

    it("does not mutate the input array", () => {
        const skills = [
            factorySkill({ name: "Ruby", category: "language", level: 3 }),
            factorySkill({ name: "Go", category: "language", level: 5 }),
        ]
        const original = [...skills]

        groupSkillsByCategory(skills, "2f")

        expect(skills).toEqual(original)
    })
})

describe("levelGauge()", () => {
    it.each([
        [1, "●", "○○○○"],
        [2, "●●", "○○○"],
        [3, "●●●", "○○"],
        [4, "●●●●", "○"],
        [5, "●●●●●", ""],
    ] as const)("shows level %i as %s filled and %s empty out of five", (level, filled, empty) => {
        expect(levelGauge(level)).toEqual({ filled, empty })
    })
})

describe("levelLabels", () => {
    it("keeps only the label of each level (no color, no icon)", () => {
        expect(levelLabels).toEqual({
            1: { label: "学習中" },
            2: { label: "個人利用" },
            3: { label: "実務経験あり" },
            4: { label: "実務継続利用" },
            5: { label: "専門" },
        })
    })
})

describe("retired skill parts", () => {
    const SERVICE_ROOT = path.resolve(__dirname, "../..")
    const RETIRED = /RadarChart|SkillBar|getRadarAxes|RADAR_AXIS|getSkillsByCategory/

    it("no longer exports the radar axes or the category record from lib/skills", () => {
        for (const name of ["getRadarAxes", "RADAR_AXIS_KEYS", "getSkillsByCategory"]) {
            expect(name in skillsModule, name).toBe(false)
        }
    })

    it("no longer has the old skill components", () => {
        for (const file of ["RadarChart.tsx", "SkillBar.tsx", "SkillCategorySection.tsx", "SkillsList.tsx"]) {
            expect(fs.existsSync(path.join(SERVICE_ROOT, "components/skills", file)), file).toBe(false)
        }
    })

    it("has no reference to the retired parts left in app, components or lib", () => {
        const sourceFiles = ["app", "components", "lib"].flatMap((dir) =>
            fs
                .readdirSync(path.join(SERVICE_ROOT, dir), { recursive: true, encoding: "utf-8" })
                .filter((file) => /\.(ts|tsx|mjs)$/.test(file) && !/\.test\.(ts|tsx)$/.test(file))
                .map((file) => path.join(dir, file)),
        )
        expect(sourceFiles.length).toBeGreaterThan(0)

        const offending = sourceFiles.filter((file) =>
            RETIRED.test(fs.readFileSync(path.join(SERVICE_ROOT, file), "utf-8")),
        )
        expect(offending).toEqual([])
    })
})
