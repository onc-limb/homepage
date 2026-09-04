import { describe, it, expect } from "vitest"
import { getRadarAxes, RADAR_AXIS_KEYS } from "@/lib/skills"
import type { Skill, SkillCategory, SkillLevel } from "@/lib/skills"

/**
 * getRadarAxes contract tests.
 *
 * Plan: lib/skills.ts に getRadarAxes(skills: Skill[]): RadarAxis[] を追加し、
 *   docs/design/skill.html のレーダーチャートに必要な 8 軸を生成する。
 *   軸キー / ラベル / level 合計 / 件数 / 正規化値 (0-1) を返し、
 *   軸ごとに対応する SkillCategory の level 合計を集計する。
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

    it("keeps every axis ratio in the inclusive 0..1 range", () => {
        // Given skills contribute different totals to the axes
        // When axes are aggregated
        // Then normalized ratios stay within 0..1
        const axes = getRadarAxes([
            factorySkill({ name: "Express", category: "framework", level: 5 }),
            factorySkill({ name: "React", category: "frontend", level: 3 }),
        ])
        for (const axis of axes) {
            expect(axis.ratio).toBeGreaterThanOrEqual(0)
            expect(axis.ratio).toBeLessThanOrEqual(1)
        }
    })

    it("returns zero totals, counts, and ratios for axes with no contributing skills", () => {
        // Given a skill list that only contributes to the 'ai' axis
        // When axes are aggregated
        // Then non-contributing axes are 0
        const skills: Skill[] = [
            factorySkill({ name: "PyTorch", category: "ml", level: 3 }),
        ]
        const axes = getRadarAxes(skills)
        const nonAi = axes.filter((a) => a.key !== "ai")
        for (const axis of nonAi) {
            expect(axis.total).toBe(0)
            expect(axis.count).toBe(0)
            expect(axis.ratio).toBe(0)
        }
    })

    it("aggregates ml and ai-llm skill levels onto the 'ai' axis as a total", () => {
        // Given an ml skill and an ai-llm skill with levels 2 and 4
        // When axes are aggregated
        // Then the 'ai' axis has their total (6) and count (2)
        const skills: Skill[] = [
            factorySkill({ name: "PyTorch", category: "ml", level: 2 }),
            factorySkill({ name: "LLM", category: "ai-llm", level: 4 }),
        ]
        const axes = getRadarAxes(skills)
        const ai = axes.find((a) => a.key === "ai")
        expect(ai?.total).toBe(6)
        expect(ai?.count).toBe(2)
    })

    it("aggregates security and auth categories onto the 'sec' axis", () => {
        // Given one security skill and one auth skill at levels 4 and 2
        // When axes are aggregated
        // Then 'sec' totals them to 6
        const skills: Skill[] = [
            factorySkill({ name: "Vault", category: "security", level: 4 }),
            factorySkill({ name: "OAuth", category: "auth", level: 2 }),
        ]
        const axes = getRadarAxes(skills)
        const sec = axes.find((a) => a.key === "sec")
        expect(sec?.total).toBe(6)
        expect(sec?.count).toBe(2)
    })

    it("aggregates framework and api categories onto the 'backend' axis", () => {
        // Given one framework skill and one api skill at level 5 each
        // When axes are aggregated
        // Then the 'backend' axis totals both levels to 10
        const skills: Skill[] = [
            factorySkill({ name: "Express", category: "framework", level: 5 }),
            factorySkill({ name: "GraphQL", category: "api", level: 5 }),
        ]
        const axes = getRadarAxes(skills)
        const backend = axes.find((a) => a.key === "backend")
        expect(backend?.total).toBe(10)
        expect(backend?.count).toBe(2)
    })

    it("aggregates infra-related categories onto the 'infra' axis", () => {
        // Given mixed compute / storage / networking / IaC / container skills
        // When axes are aggregated
        // Then the 'infra' axis totals every contributing level
        const skills: Skill[] = [
            factorySkill({ name: "EC2", category: "compute", level: 4 }),
            factorySkill({ name: "S3", category: "storage", level: 4 }),
            factorySkill({ name: "VPC", category: "networking", level: 3 }),
            factorySkill({ name: "Terraform", category: "IaC", level: 3 }),
            factorySkill({ name: "Docker", category: "container", level: 4 }),
        ]
        const axes = getRadarAxes(skills)
        const infra = axes.find((a) => a.key === "infra")
        expect(infra?.total).toBe(18)
        expect(infra?.count).toBe(5)
    })

    it("aggregates devops-sre and tools categories onto the 'devops' axis", () => {
        // Given a devops-sre and a tools skill at level 4 each
        // When axes are aggregated
        // Then the 'devops' axis totals both levels to 8
        const skills: Skill[] = [
            factorySkill({ name: "Datadog", category: "devops-sre", level: 4 }),
            factorySkill({ name: "GitHub Actions", category: "tools", level: 4 }),
        ]
        const axes = getRadarAxes(skills)
        const devops = axes.find((a) => a.key === "devops")
        expect(devops?.total).toBe(8)
        expect(devops?.count).toBe(2)
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
        expect(low?.total).toBe(3)
        expect(low?.count).toBe(1)
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
        expect(arch?.total).toBe(4)
        expect(arch?.count).toBe(1)
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
        expect(arch?.total).toBe(0)
        expect(arch?.count).toBe(0)
    })

    it("aggregates frontend category onto the 'frontend' axis", () => {
        // Given one frontend skill at level 4
        // When axes are aggregated
        // Then the 'frontend' axis includes its level as the total
        const skills: Skill[] = [
            factorySkill({ name: "React", category: "frontend", level: 4 }),
        ]
        const axes = getRadarAxes(skills)
        const frontend = axes.find((a) => a.key === "frontend")
        expect(frontend?.total).toBe(4)
        expect(frontend?.count).toBe(1)
    })

    it("treats publish=false skills the same as publish=true (caller pre-filters)", () => {
        // Given the function accepts an explicit Skill[] (caller's responsibility)
        // When the input includes any Skill regardless of publish flag
        // Then it is totaled in (the caller is expected to pass filtered data)
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
        expect(ai?.total).toBe(5)
        expect(ai?.count).toBe(1)
    })

    it("normalizes the largest total to a ratio of 1", () => {
        // Given backend has a larger total than frontend
        // When axes are aggregated
        // Then backend reaches the outer ring and frontend is relative to it
        const axes = getRadarAxes([
            factorySkill({ name: "Express", category: "framework", level: 5 }),
            factorySkill({ name: "GraphQL", category: "api", level: 3 }),
            factorySkill({ name: "React", category: "frontend", level: 4 }),
        ])
        const backend = axes.find((a) => a.key === "backend")
        const frontend = axes.find((a) => a.key === "frontend")
        expect(backend?.ratio).toBe(1)
        expect(frontend?.ratio).toBe(0.5)
    })

    it("returns zero ratios when every axis total is zero", () => {
        // Given no skills contribute to any radar axis
        // When axes are aggregated
        // Then every normalized ratio is zero
        const axes = getRadarAxes([])
        expect(axes.every((axis) => axis.ratio === 0)).toBe(true)
    })

    it("increases an axis total when one contributing skill is added", () => {
        // Given an initial backend skill list
        const initialSkills: Skill[] = [
            factorySkill({ name: "Express", category: "framework", level: 3 }),
        ]
        // When another backend skill is added
        const before = getRadarAxes(initialSkills).find((a) => a.key === "backend")
        const after = getRadarAxes([
            ...initialSkills,
            factorySkill({ name: "GraphQL", category: "api", level: 4 }),
        ]).find((a) => a.key === "backend")
        // Then the backend total increases by the added skill's level
        expect(after?.total).toBe((before?.total ?? 0) + 4)
    })
})
