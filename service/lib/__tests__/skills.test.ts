import { describe, it, expect } from "vitest"
import { getRadarAxes, RADAR_AXIS_KEYS } from "@/lib/skills"
import type { Skill, SkillCategory, SkillLevel } from "@/lib/skills"

/**
 * getRadarAxes contract tests.
 *
 * Plan: lib/skills.ts に getRadarAxes(skills: Skill[]): RadarAxis[] を追加し、
 *   docs/design/skill.html のレーダーチャートに必要な 8 軸を生成する。
 *   軸キー / ラベル / 値 (0-5) を返し、軸ごとに対応する SkillCategory の
 *   level 平均を集計する。
 *
 * Reference: docs/design/skill.html:217-224 (axis definitions)
 */

const factorySkill = (overrides: Partial<Skill> & { category: SkillCategory; level: SkillLevel }): Skill => ({
    name: "fixture",
    publish: true,
    experience: [],
    knowledge: [],
    relatedTech: [],
    relatedBooks: [],
    ...overrides,
})

describe("RADAR_AXIS_KEYS", () => {
    it("matches the 8 axes defined in the design draft", () => {
        // Given the design draft skill.html declares 8 axes
        // When the radar axis keys are read
        // Then the 8 keys match the draft exactly
        expect([...RADAR_AXIS_KEYS].sort()).toEqual(
            ["backend", "frontend", "infra", "arch", "ai", "devops", "low", "sec"].sort()
        )
        expect(RADAR_AXIS_KEYS).toHaveLength(8)
    })
})

describe("getRadarAxes()", () => {
    it("returns one entry per axis in the canonical order", () => {
        // Given an empty skill list
        // When getRadarAxes is invoked
        // Then it still emits 8 entries in the canonical order
        const axes = getRadarAxes([])
        expect(axes.map((a) => a.key)).toEqual([...RADAR_AXIS_KEYS])
        expect(axes).toHaveLength(8)
    })

    it("provides a non-empty human label for each axis", () => {
        // Given the radar legend renders axis labels
        // When axes are produced
        // Then every entry has a non-empty label
        const axes = getRadarAxes([])
        for (const axis of axes) {
            expect(typeof axis.label).toBe("string")
            expect(axis.label.length).toBeGreaterThan(0)
        }
    })

    it("clamps every axis value to the inclusive 0..5 range", () => {
        // Given level values are between 1 and 5
        // When axes are aggregated
        // Then values stay within 0..5 even if no skills feed an axis
        const axes = getRadarAxes([])
        for (const axis of axes) {
            expect(axis.value).toBeGreaterThanOrEqual(0)
            expect(axis.value).toBeLessThanOrEqual(5)
        }
    })

    it("returns 0 for axes with no contributing skills", () => {
        // Given a skill list that only contributes to the 'ai' axis
        // When axes are aggregated
        // Then non-contributing axes are 0
        const skills: Skill[] = [
            factorySkill({ name: "PyTorch", category: "ml", level: 3 }),
        ]
        const axes = getRadarAxes(skills)
        const nonAi = axes.filter((a) => a.key !== "ai")
        for (const axis of nonAi) {
            expect(axis.value).toBe(0)
        }
    })

    it("aggregates ml and ai-llm skills onto the 'ai' axis as an average", () => {
        // Given an ml skill and an ai-llm skill with levels 2 and 4
        // When axes are aggregated
        // Then the 'ai' axis equals their average (3)
        const skills: Skill[] = [
            factorySkill({ name: "PyTorch", category: "ml", level: 2 }),
            factorySkill({ name: "LLM", category: "ai-llm", level: 4 }),
        ]
        const axes = getRadarAxes(skills)
        const ai = axes.find((a) => a.key === "ai")
        expect(ai?.value).toBe(3)
    })

    it("aggregates security and auth categories onto the 'sec' axis", () => {
        // Given one security skill and one auth skill at levels 4 and 2
        // When axes are aggregated
        // Then 'sec' averages them to 3
        const skills: Skill[] = [
            factorySkill({ name: "Vault", category: "security", level: 4 }),
            factorySkill({ name: "OAuth", category: "auth", level: 2 }),
        ]
        const axes = getRadarAxes(skills)
        const sec = axes.find((a) => a.key === "sec")
        expect(sec?.value).toBe(3)
    })

    it("aggregates framework and api categories onto the 'backend' axis", () => {
        // Given one framework skill and one api skill at level 5 each
        // When axes are aggregated
        // Then the 'backend' axis is 5 (average of two 5s)
        const skills: Skill[] = [
            factorySkill({ name: "Express", category: "framework", level: 5 }),
            factorySkill({ name: "GraphQL", category: "api", level: 5 }),
        ]
        const axes = getRadarAxes(skills)
        const backend = axes.find((a) => a.key === "backend")
        expect(backend?.value).toBe(5)
    })

    it("aggregates infra-related categories onto the 'infra' axis", () => {
        // Given mixed compute / storage / networking / IaC / container skills
        // When axes are aggregated
        // Then the 'infra' axis is greater than zero
        const skills: Skill[] = [
            factorySkill({ name: "EC2", category: "compute", level: 4 }),
            factorySkill({ name: "S3", category: "storage", level: 4 }),
            factorySkill({ name: "VPC", category: "networking", level: 3 }),
            factorySkill({ name: "Terraform", category: "IaC", level: 3 }),
            factorySkill({ name: "Docker", category: "container", level: 4 }),
        ]
        const axes = getRadarAxes(skills)
        const infra = axes.find((a) => a.key === "infra")
        expect(infra?.value).toBeGreaterThan(0)
        expect(infra?.value).toBeLessThanOrEqual(5)
    })

    it("aggregates devops-sre and tools categories onto the 'devops' axis", () => {
        // Given a devops-sre and a tools skill at level 4 each
        // When axes are aggregated
        // Then the 'devops' axis is 4 (average)
        const skills: Skill[] = [
            factorySkill({ name: "Datadog", category: "devops-sre", level: 4 }),
            factorySkill({ name: "GitHub Actions", category: "tools", level: 4 }),
        ]
        const axes = getRadarAxes(skills)
        const devops = axes.find((a) => a.key === "devops")
        expect(devops?.value).toBe(4)
    })

    it("aggregates language category onto the 'low' axis", () => {
        // Given one language skill at level 3
        // When axes are aggregated
        // Then the 'low' axis is 3
        const skills: Skill[] = [
            factorySkill({ name: "C", category: "language", level: 3 }),
        ]
        const axes = getRadarAxes(skills)
        const low = axes.find((a) => a.key === "low")
        expect(low?.value).toBe(3)
    })

    it("aggregates architecture category onto the 'arch' axis", () => {
        // Given one architecture skill at level 4
        // When axes are aggregated
        // Then the 'arch' axis is 4
        const skills: Skill[] = [
            factorySkill({ name: "DDD", category: "architecture", level: 4 }),
        ]
        const axes = getRadarAxes(skills)
        const arch = axes.find((a) => a.key === "arch")
        expect(arch?.value).toBe(4)
    })

    it("does not aggregate process methodology onto the 'arch' axis", () => {
        // Given one methodology (process) skill at level 4
        // When axes are aggregated
        // Then the 'arch' axis stays 0
        const skills: Skill[] = [
            factorySkill({ name: "Scrum", category: "methodology", level: 4 }),
        ]
        const axes = getRadarAxes(skills)
        const arch = axes.find((a) => a.key === "arch")
        expect(arch?.value).toBe(0)
    })

    it("aggregates frontend category onto the 'frontend' axis", () => {
        // Given one frontend skill at level 4
        // When axes are aggregated
        // Then the 'frontend' axis includes its level
        const skills: Skill[] = [
            factorySkill({ name: "React", category: "frontend", level: 4 }),
        ]
        const axes = getRadarAxes(skills)
        const frontend = axes.find((a) => a.key === "frontend")
        expect(frontend?.value).toBeGreaterThan(0)
    })

    it("treats publish=false skills the same as publish=true (caller pre-filters)", () => {
        // Given the function accepts an explicit Skill[] (caller's responsibility)
        // When the input includes any Skill regardless of publish flag
        // Then it is averaged in (the caller is expected to pass filtered data)
        const skills: Skill[] = [
            factorySkill({
                name: "Hidden",
                category: "ai-llm",
                level: 5,
                publish: false,
            }),
        ]
        const axes = getRadarAxes(skills)
        const ai = axes.find((a) => a.key === "ai")
        expect(ai?.value).toBe(5)
    })
})
