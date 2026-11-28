import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

import type { Entry } from "@/lib/building/entries"
import { FLOORS, findGroup, toVirtualPath, type FloorId } from "@/lib/building/floors"
import { layoutFloor } from "@/lib/building/layout"
import { litRoomsOn, runSearches, searchCounts, SEARCHES, type SearchResult } from "@/lib/building/searches"

/**
 * Contract tests for the guide's searches (lib/building/searches.ts).
 *
 * The searches are computed on the server from getEntries() and passed to the client as props.
 * The module is imported by client components, so it must not import the modules that load markdown.
 *
 * API fixed by these tests (plan: 実装アプローチ 3):
 *   SEARCHES                         the four searches in order (label and command)
 *   runSearches(entries)             one SearchResult per search, in SEARCHES order. A result fits GuidePc's
 *                                    GuideSearch ({ label, command, summary, paths }) and carries `hits`:
 *                                    { path, floor, room } per path (room = the map room id; null for the tree lines)
 *   searchCounts(result)             number of hit papers per floor (empty for the tree)
 *   litRoomsOn(result, floor)        room ids to light on the floor (empty for the tree)
 *
 * Reference: order.md やること 2・受け入れ条件「4 つの探しものの結果が、上の決まりどおり」, Issue #352
 */

// ---- fixture: entries in the shape getEntries() returns ----

const skills = findGroup("skills")
const studies = findGroup("studies")
const histories = findGroup("histories")
const portfolios = findGroup("portfolios")

let serial = 0
const skill = (category: string, title: string, level: 1 | 2 | 3 | 4 | 5, onFloor: "2f" | "b1" = "2f"): Entry => {
    const group = onFloor === "2f" ? skills : studies
    return {
        path: `${toVirtualPath(group.url)}/${category}/skill-${serial++}.md`,
        floor: group.floor,
        group: group.slug,
        room: category,
        title,
        excerpt: `level ${level}`,
        href: group.url,
        tags: [category],
        level,
    }
}

const history = (title: string, excerpt = ""): Entry => ({
    path: `${toVirtualPath(histories.url)}/${String(serial++).padStart(2, "0")}-${title.replace(/\s/g, "-")}.md`,
    floor: histories.floor,
    group: histories.slug,
    room: histories.slug,
    title,
    excerpt,
    href: histories.url,
    tags: [],
})

const portfolio = (title: string, excerpt: string, tags: string[]): Entry => ({
    path: `${toVirtualPath(portfolios.url)}/p-${serial++}.md`,
    floor: portfolios.floor,
    group: portfolios.slug,
    room: portfolios.slug,
    title,
    excerpt,
    href: portfolios.url,
    tags,
})

const rooftop = (title: string, file: string): Entry => ({
    path: `~/rf/${file}.url`,
    floor: "rf",
    group: null,
    room: null,
    title,
    excerpt: "@someone",
    href: `https://example.com/${file}`,
    tags: [],
})

const hitsOf = (result: SearchResult) => result.hits.map(({ path, floor, room }) => ({ path, floor, room }))

const resultOf = (results: SearchResult[], command: string): SearchResult => {
    const found = results.find((result) => result.command === command)
    expect(found, command).toBeDefined()
    return found!
}

const AI = "grep -rl ai ~"
const ARCHITECTURE = "grep -rl architecture ~"
const LEVEL5 = "grep -rl 'level: 5' ~"
const TREE = "tree -d -L 2 ~"

describe("SEARCHES", () => {
    it("defines the four searches of the spec, in order", () => {
        expect(SEARCHES.map((search) => [search.label, search.command])).toEqual([
            ["AI に関わるもの", AI],
            ["設計に関わるもの", ARCHITECTURE],
            ["いちばん得意な技術", LEVEL5],
            ["建物の構成を見る", TREE],
        ])
    })
})

describe("runSearches()", () => {
    it("returns one result per search in the same order, with the label and the command", () => {
        const results = runSearches([])
        expect(results.map((result) => [result.label, result.command])).toEqual(
            SEARCHES.map((search) => [search.label, search.command])
        )
        for (const result of results) expect(result.paths).toEqual(result.hits.map((hit) => hit.path))
    })

    describe("grep -rl ai ~", () => {
        it("hits a word ai in the category and in a title, case-insensitively", () => {
            const llm = skill("ai-llm", "Claude Code", 4)
            const search = history("AIドキュメント検索")
            const result = resultOf(runSearches([llm, search]), AI)

            expect(result.paths).toEqual([llm.path, search.path])
            expect(result.summary).toBe("2 件。AI に関わる紙が見つかりました")
        })

        it("does not hit ai inside an English word (Tailwind, container, maintain)", () => {
            const entries = [
                skill("frontend", "Tailwind CSS", 3),
                skill("container", "Docker", 4),
                portfolio("Sample", "maintain the docs", []),
            ]
            const result = resultOf(runSearches(entries), AI)

            expect(result.paths).toEqual([])
            expect(result.summary).toBe("0 件。AI に関わる紙が見つかりました")
        })

        it("looks at the title, the line, the tags and the category, and not at the path or the href", () => {
            const inLine = history("Backend", "built an AI pipeline")
            const inTags = portfolio("Sample", "a tool", ["AI", "Go"])
            const onlyInPath: Entry = { ...history("Backend 2"), path: "~/2f/histories/ai/01-x.md", href: "/ai" }
            const result = resultOf(runSearches([inLine, inTags, onlyInPath]), AI)

            expect(result.paths).toEqual([inLine.path, inTags.path])
        })

        it("lists each paper once even when several fields match", () => {
            const twice = { ...skill("ai-llm", "AI Agent", 5), tags: ["ai-llm", "AI"] }
            const result = resultOf(runSearches([twice]), AI)
            expect(result.paths).toEqual([twice.path])
        })
    })

    describe("grep -rl architecture ~", () => {
        it("hits architecture as a word in any case, including the architecture category", () => {
            const clean = portfolio("Clean Architecture", "a book note", [])
            const category = skill("architecture", "DDD", 3)
            const result = resultOf(runSearches([clean, category]), ARCHITECTURE)

            expect(result.paths).toEqual([clean.path, category.path])
            expect(result.summary).toBe("2 件。設計に関わる紙が見つかりました")
        })

        it("does not hit architecture with letters before or after it", () => {
            const micro = portfolio("microarchitectures", "notes", [])
            const result = resultOf(runSearches([micro]), ARCHITECTURE)
            expect(result.paths).toEqual([])
        })
    })

    describe("grep -rl 'level: 5' ~", () => {
        it("hits only the skills of level 5", () => {
            const five = skill("language", "TypeScript", 5)
            const four = skill("language", "Go", 4)
            const fiveOnB1 = skill("ml", "PyTorch", 5, "b1")
            const notASkill = history("level: 5 in the title")
            const result = resultOf(runSearches([five, four, fiveOnB1, notASkill]), LEVEL5)

            expect(result.paths).toEqual([five.path, fiveOnB1.path])
            expect(result.summary).toBe("2 件。レベル 5（専門）の技術です")
        })
    })

    describe("tree -d -L 2 ~", () => {
        it("lists one line per floor from the rooftop down to B1, groups separated by two spaces", () => {
            const result = resultOf(runSearches([skill("language", "TypeScript", 5)]), TREE)
            const expected = [...FLOORS]
                .reverse()
                .map((floor) =>
                    floor.groups.length === 0
                        ? toVirtualPath(floor.url)
                        : floor.groups.map((group) => toVirtualPath(group.url)).join("  ")
                )

            expect(result.paths).toEqual(expected)
            expect(result.paths[0]).toBe("~/rf")
            expect(result.paths).toContain("~/2f/histories  ~/2f/skills")
            expect(result.paths[result.paths.length - 1]).toBe("~/b1/studies")
            expect(result.hits.map((hit) => hit.floor)).toEqual([...FLOORS].reverse().map((floor) => floor.id))
        })

        it("shows the one-line result without a count, lights no room and counts no floor", () => {
            const result = resultOf(runSearches([skill("language", "TypeScript", 5)]), TREE)
            expect(result.summary).toBe("階と分類の一覧です")
            expect(result.summary).not.toMatch(/件/)
            expect(searchCounts(result)).toEqual({})
            for (const floor of FLOORS) expect(litRoomsOn(result, floor.id), floor.id).toEqual([])
        })
    })
})

describe("hits, lit rooms and floor counts", () => {
    const llmOn2f = skill("ai-llm", "Claude Code", 5)
    const llmOn2fToo = skill("ai-llm", "AI Agent", 4)
    const aiHistory = history("AI 導入支援")
    const llmOnB1 = skill("ai-llm", "LangChain", 2, "b1")
    const github = rooftop("GitHub", "github")
    const entries = [llmOn2f, llmOn2fToo, aiHistory, llmOnB1, github]
    const ai = resultOf(runSearches(entries), AI)

    it("gives each hit the floor and the map room of its paper", () => {
        expect(hitsOf(ai)).toEqual([
            { path: llmOn2f.path, floor: "2f", room: "ai-llm" },
            { path: llmOn2fToo.path, floor: "2f", room: "ai-llm" },
            { path: aiHistory.path, floor: "2f", room: "histories" },
            { path: llmOnB1.path, floor: "b1", room: "ai-llm" },
        ])
    })

    it("counts papers per floor, not rooms, and the counts add up to the summary", () => {
        const counts = searchCounts(ai)
        expect(counts).toEqual({ "2f": 3, b1: 1 })
        const total = Object.values(counts).reduce((sum, n) => sum + (n ?? 0), 0)
        expect(ai.summary.startsWith(`${total} 件。`)).toBe(true)
    })

    it("lights each room that has a hit once, only on its floor", () => {
        expect([...litRoomsOn(ai, "2f")].sort()).toEqual(["ai-llm", "histories"])
        expect(litRoomsOn(ai, "b1")).toEqual(["ai-llm"])
        for (const id of ["1f", "3f", "rf"] as FloorId[]) expect(litRoomsOn(ai, id), id).toEqual([])
    })

    it("uses the virtual path as the room id of a rooftop paper", () => {
        const githubAsAi: Entry = { ...github, title: "AI GitHub" }
        const result = resultOf(runSearches([githubAsAi]), AI)
        expect(hitsOf(result)).toEqual([{ path: githubAsAi.path, floor: "rf", room: githubAsAi.path }])
        expect(litRoomsOn(result, "rf")).toEqual([githubAsAi.path])
    })
})

describe("hit rooms follow the map room ids (SCN-U1-P1)", () => {
    it("gives rooftop papers their path and one-room groups their slug, as layoutFloor does", () => {
        const github = rooftop("AI GitHub", "github")
        const aiHistory = history("AI 導入支援")
        const result = resultOf(runSearches([github, aiHistory]), AI)
        expect(hitsOf(result).map((hit) => hit.room)).toEqual([github.path, "histories"])
        expect(layoutFloor(FLOORS[4], [github]).rooms.map((r) => r.id)).toEqual([github.path])
        expect(layoutFloor(FLOORS[2], [aiHistory]).rooms.map((r) => r.id)).toEqual(["histories"])
    })
})

describe("searches.ts source", () => {
    it("does not import the modules that load markdown, even for types", () => {
        const source = fs.readFileSync(path.resolve(__dirname, "../searches.ts"), "utf-8")
        const specifiers = [...source.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1])
        for (const specifier of specifiers) {
            expect(specifier).not.toMatch(/(^|\/)(skills|profile|portfolio|entries)$|\.md$/)
        }
    })
})
