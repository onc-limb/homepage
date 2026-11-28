import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

import type { Entry } from "@/lib/building/entries"
import { FLOORS, findFloor, findGroup, toVirtualPath, type FloorId, type GroupSlug } from "@/lib/building/floors"
import {
    buildGuideFloorData,
    composeGuide,
    type GuideFloorData,
    type GuideFocus,
    type GuideView,
    toggleSearch,
} from "@/lib/building/guide"
import { layoutFloor } from "@/lib/building/layout"
import { runSearches, type SearchResult } from "@/lib/building/searches"
import { SOCIAL_LINKS } from "@/lib/constants"
import { categoryLabels } from "@/lib/skills-meta"

/**
 * Contract tests for the guide composition (lib/building/guide.ts).
 *
 * The guide PC on the info center and on the floor pages is built by one pure function from the selected
 * floor, the focus (floor only / room / stairs) and the active search. The data of a floor is built on the
 * server (buildGuideFloorData) and passed to the client as props, so it must survive JSON serialisation.
 *
 * API fixed by these tests (plan: 実装アプローチ 2):
 *   buildGuideFloorData(layout, entries)        server side; entries are the papers of that floor (Entry fits)
 *   composeGuide({ place, data, focus, search }) -> GuideView
 *     place:  "info" (the info center) | "floor" (a floor page)
 *     focus:  { kind: "floor" } | { kind: "room", id } | { kind: "stairs" }
 *     search: a SearchResult from runSearches, or null
 *   GuideView = {
 *     text, papers: { title, line }[],
 *     destinations: { label, href }[]        (Contact is not included: GuidePc always adds it last)
 *     rooms: { scope, items: { id, name, target }[] }
 *   }
 *   target: { kind: "focus", focus }        choose on the same floor
 *         | { kind: "floor", floor }        another floor (the info center selects it, a floor page links to it)
 *   A destination's href is a page of this site or an outside site; DoorButton decides from the href and adds ↗.
 *
 * Reference: order.md やること 1・3・4・5、受け入れ条件「階・部屋・階段・屋上の部屋を選ぶと…（組み立ての関数のテスト）」,
 *            Issue #352 やること・受け入れ条件, Issue #345 やること
 */

// ---- fixture: papers in the shape getEntries() returns ----

let serial = 0
const paper = (group: GroupSlug, room: string, title: string, excerpt: string, level?: 1 | 2 | 3 | 4 | 5): Entry => {
    const g = findGroup(group)
    return {
        path: `${toVirtualPath(g.url)}/${room}/${serial++}.md`,
        floor: g.floor,
        group: g.slug,
        room,
        title,
        excerpt,
        href: g.url,
        tags: level === undefined ? [] : [room],
        ...(level === undefined ? {} : { level }),
    }
}

const rooftopPapers: Entry[] = SOCIAL_LINKS.map((link) => ({
    path: `${toVirtualPath(findFloor("rf").url)}/${link.name.match(/[A-Za-z]+/)![0].toLowerCase()}.url`,
    floor: "rf",
    group: null,
    room: null,
    title: link.name,
    excerpt: link.username,
    href: link.url,
    tags: [],
}))

const PAPERS: Record<FloorId, Entry[]> = {
    b1: [paper("studies", "ml", "PyTorch", "level 2（個人利用）", 2)],
    "1f": [
        paper("profile", "profile", "自己紹介", "Engineer"),
        paper("profile", "profile", "関心 1", "line"),
        // contact has no papers
    ],
    "2f": [
        paper("skills", "language", "TypeScript", "level 5（専門）", 5),
        paper("skills", "language", "Go", "level 4（実務継続利用）", 4),
        paper("skills", "ai-llm", "Claude Code", "level 4（実務継続利用）", 4),
        paper("histories", "histories", "組み込み開発", "C で書いた"),
        paper("histories", "histories", "Web 開発", "Next.js"),
        paper("histories", "histories", "AI 開発", "LLM を使った"),
    ],
    "3f": Array.from({ length: 7 }, (_, i) => paper("portfolios", "portfolios", `作品 ${i + 1}`, `説明 ${i + 1}`)),
    rf: rooftopPapers,
}

const DATA = Object.fromEntries(
    FLOORS.map((floor) => [floor.id, buildGuideFloorData(layoutFloor(floor, PAPERS[floor.id]), PAPERS[floor.id])])
) as Record<FloorId, GuideFloorData>

const ALL_PAPERS = FLOORS.flatMap((floor) => PAPERS[floor.id])
const SEARCH_RESULTS = runSearches(ALL_PAPERS)
const search = (command: string): SearchResult => SEARCH_RESULTS.find((result) => result.command === command)!

const FLOOR: GuideFocus = { kind: "floor" }
const STAIRS: GuideFocus = { kind: "stairs" }
const room = (id: string): GuideFocus => ({ kind: "room", id })

const guide = (
    floor: FloorId,
    focus: GuideFocus,
    { place = "info", activeSearch = null }: { place?: "info" | "floor"; activeSearch?: SearchResult | null } = {}
): GuideView => composeGuide({ place, data: DATA[floor], focus, search: activeSearch })

const roomIdsOf = (id: FloorId): string[] => layoutFloor(findFloor(id), PAPERS[id]).rooms.map((r) => r.id)

const names = (view: GuideView) => view.rooms.items.map((item) => item.name)

const floorText = (id: FloorId) => {
    const floor = findFloor(id)
    return `ここは ${floor.label}「${floor.name}」です。${floor.description}部屋を押すと、中身をお見せします。`
}

// ---- tests ----

describe("composeGuide() text", () => {
    it("introduces the floor when only a floor is selected", () => {
        expect(guide("2f", FLOOR).text).toBe(
            "ここは 2F「経歴・業務の技術」です。実際に仕事で行ってきたことと、そこで使ってきた技術の階です。部屋を押すと、中身をお見せします。"
        )
        for (const floor of FLOORS) expect(guide(floor.id, FLOOR).text, floor.id).toBe(floorText(floor.id))
    })

    it("introduces a room with papers and adds the line about the papers", () => {
        expect(guide("2f", room("histories")).text).toBe(
            "「経歴」です。組み込みから Web、機械学習、AI まで。関わってきた仕事を古い順に置いてあります。置いてあるものは、下のとおりです。"
        )
    })

    it("introduces a category room with the category name from the skill definitions", () => {
        const name = categoryLabels.language
        expect(guide("2f", room("language")).text).toBe(
            `「${name}」です。${name}の技術を、経験の深い順に置いてあります。置いてあるものは、下のとおりです。`
        )
        expect(guide("b1", room("ml")).text).toBe(
            `「${categoryLabels.ml}」です。${categoryLabels.ml}の技術を、経験の深い順に置いてあります。置いてあるものは、下のとおりです。`
        )
    })

    it("does not add the line about the papers in a room without papers", () => {
        const view = guide("1f", room("contact"))
        expect(view.text).toBe(
            "「受付・連絡先」です。お仕事のご相談、技術的なご相談・壁打ちを受け付けています。帰る前に、ここで用件を伝えられます。"
        )
        expect(view.text).not.toContain("置いてあるものは")
    })

    it("explains the stairs", () => {
        expect(guide("2f", STAIRS).text).toBe("階段です。上の階・下の階へは、下の一覧から移れます。")
    })

    it("explains a rooftop room with its link description and the new tab", () => {
        const [github, , x] = layoutFloor(findFloor("rf"), rooftopPapers).rooms
        expect(guide("rf", room(github.id)).text).toBe(
            "ソースコードを置いている GitHub へ出ます。外のサイトが別のタブで開きます。"
        )
        expect(guide("rf", room(x.id)).text).toBe("X（@onc_limb）へ出ます。外のサイトが別のタブで開きます。")
    })

    it("tells the number of hits after a search while no room is selected", () => {
        const ai = search("grep -rl ai ~")
        expect(ai.paths.length).toBe(2)
        expect(guide("2f", FLOOR, { activeSearch: ai }).text).toBe(
            "2 件見つかりました。光っている部屋を押すと、中身をお見せします。ほかの階にもあるときは、階の横に件数が出ています。"
        )
    })

    it("tells the hits on this floor and points to the paths on a floor page, which has no floor guide", () => {
        const ai = search("grep -rl ai ~")
        const floorsWithHits = new Set(ai.hits.map((hit) => hit.floor))
        const hitFloor = ai.hits[0].floor
        const here = ai.hits.filter((hit) => hit.floor === hitFloor).length
        const text = guide(hitFloor, FLOOR, { activeSearch: ai, place: "floor" }).text
        expect(text.startsWith(`${ai.hits.length} 件見つかりました。この階には ${here} 件あります。`)).toBe(true)
        expect(text).not.toMatch(/階の横に件数/)
        if (here < ai.hits.length) expect(text).toMatch(/ほかの階の紙は、下のパスから移れます。$/)

        const empty = FLOORS.find((floor) => !floorsWithHits.has(floor.id))!
        expect(guide(empty.id, FLOOR, { activeSearch: ai, place: "floor" }).text).toBe(
            `${ai.hits.length} 件見つかりました。この階にはありません。ほかの階の紙は、下のパスから移れます。`
        )
    })

    it("shows the room, not the count, when a room is selected during a search", () => {
        const ai = search("grep -rl ai ~")
        expect(guide("2f", room("histories"), { activeSearch: ai }).text).toBe(guide("2f", room("histories")).text)
        expect(guide("2f", room("histories"), { activeSearch: ai }).text).not.toMatch(/件見つかりました/)
    })

    it("keeps the floor introduction during the tree, which has no count", () => {
        expect(guide("2f", FLOOR, { activeSearch: search("tree -d -L 2 ~") }).text).toBe(floorText("2f"))
    })
})

describe("composeGuide() papers", () => {
    it("lists the groups of the floor with their note or their count when a floor is selected", () => {
        expect(guide("1f", FLOOR).papers).toEqual([
            { title: findGroup("profile").name, line: findGroup("profile").note },
            { title: findGroup("contact").name, line: findGroup("contact").note },
        ])
        expect(guide("2f", FLOOR).papers).toEqual([
            { title: findGroup("histories").name, line: "3 件" },
            { title: findGroup("skills").name, line: "3 件" },
        ])
    })

    it("lists every paper of the room with its title and line, in the order of the papers", () => {
        expect(guide("2f", room("language")).papers).toEqual([
            { title: "TypeScript", line: "level 5（専門）" },
            { title: "Go", line: "level 4（実務継続利用）" },
        ])
        // GuidePc shows the first five and 「ほか n 枚」, so the guide passes all of them
        expect(guide("3f", room("portfolios")).papers).toHaveLength(7)
    })

    it("shows no papers for a room without papers, the stairs, a rooftop room or the rooftop floor", () => {
        const github = layoutFloor(findFloor("rf"), rooftopPapers).rooms[0]
        expect(guide("1f", room("contact")).papers).toEqual([])
        expect(guide("2f", STAIRS).papers).toEqual([])
        expect(guide("rf", room(github.id)).papers).toEqual([])
        expect(guide("rf", FLOOR).papers).toEqual([])
    })
})

describe("composeGuide() destinations", () => {
    it("goes to the floor page from the info center, and nowhere extra on the floor page itself", () => {
        expect(guide("2f", FLOOR).destinations).toEqual([
            { label: "2F のページへ", href: findFloor("2f").url },
        ])
        expect(guide("2f", FLOOR, { place: "floor" }).destinations).toEqual([])
        for (const floor of FLOORS) {
            expect(guide(floor.id, FLOOR, { place: "floor" }).destinations, floor.id).toEqual([])
            expect(guide(floor.id, FLOOR).destinations.map((d) => d.label), floor.id).toEqual([`${floor.label} のページへ`])
        }
    })

    it("reads a room on the page of its group, on both places", () => {
        for (const place of ["info", "floor"] as const) {
            expect(guide("2f", room("histories"), { place }).destinations, place).toEqual([
                { label: "経歴のページで読む", href: findGroup("histories").href },
            ])
            expect(guide("2f", room("language"), { place }).destinations, place).toEqual([
                { label: "スキルのページで読む", href: findGroup("skills").href },
            ])
            expect(guide("b1", room("ml"), { place }).destinations, place).toEqual([
                { label: "自己学習のページで読む", href: findGroup("studies").href },
            ])
        }
    })

    it("still shows the destination of a room without papers", () => {
        expect(guide("1f", room("contact")).destinations).toEqual([
            { label: "連絡先のページで読む", href: findGroup("contact").href },
        ])
    })

    it("opens the outside site of a rooftop room, without writing ↗", () => {
        const rooms = layoutFloor(findFloor("rf"), rooftopPapers).rooms
        expect(rooms.map((r) => guide("rf", room(r.id)).destinations)).toEqual(
            SOCIAL_LINKS.map((link, i) => [
                { label: `${rooms[i].name} を開く`, href: link.url },
            ])
        )
        expect(guide("rf", room(rooms[2].id)).destinations[0].label).toBe("X を開く")
        for (const r of rooms) expect(guide("rf", room(r.id)).destinations[0].label).not.toContain("↗")
    })

    it("never includes Contact itself (GuidePc adds it last)", () => {
        const views = [guide("1f", FLOOR), guide("1f", room("contact")), guide("2f", STAIRS), guide("2f", FLOOR, { place: "floor" })]
        for (const view of views) expect(view.destinations.map((d) => d.label)).not.toContain("Contact")
    })
})

describe("composeGuide() room list", () => {
    it("lists every room of the floor and the stairs under 「この階の部屋」 when a floor is selected", () => {
        const view = guide("2f", FLOOR)
        expect(view.rooms.scope).toBe("floor")
        expect(names(view)).toEqual(["経歴", categoryLabels.language, categoryLabels["ai-llm"], "階段"])
        expect(view.rooms.items.map((item) => item.target)).toEqual([
            { kind: "focus", focus: room("histories") },
            { kind: "focus", focus: room("language") },
            { kind: "focus", focus: room("ai-llm") },
            { kind: "focus", focus: STAIRS },
        ])
        expect(names(guide("1f", FLOOR))).toEqual(["プロフィール", "受付・連絡先", "階段"])
    })

    it("names the rooftop rooms as on the map", () => {
        const rooms = layoutFloor(findFloor("rf"), rooftopPapers).rooms
        expect(names(guide("rf", FLOOR))).toEqual([...rooms.map((r) => r.name), "階段"])
    })

    it("lists the way back to the corridor, the other rooms and the stairs under 「つながっている部屋」 for a room", () => {
        const view = guide("2f", room("language"))
        expect(view.rooms.scope).toBe("room")
        expect(names(view)).toEqual(["廊下へ戻る", "経歴", categoryLabels["ai-llm"], "階段"])
        expect(view.rooms.items[0].target).toEqual({ kind: "focus", focus: FLOOR })
        expect(names(view), "not the current room").not.toContain(categoryLabels.language)
    })

    it("lists the way back to the corridor, then the floor above and the floor below for the stairs", () => {
        const view = guide("2f", STAIRS)
        expect(names(view)).toEqual(["廊下へ戻る", "上の階へ — 3F 作ったもの・考え", "下の階へ — 1F プロフィール・連絡先"])
        expect(view.rooms.items.map((item) => item.target)).toEqual([
            { kind: "focus", focus: FLOOR },
            { kind: "floor", floor: "3f" },
            { kind: "floor", floor: "1f" },
        ])
    })

    it("has only the floor below on the rooftop and only the floor above on B1", () => {
        const floorsOf = (floor: FloorId) =>
            guide(floor, STAIRS).rooms.items.flatMap((item) => (item.target.kind === "floor" ? [item.target] : []))
        expect(floorsOf("rf")).toEqual([{ kind: "floor", floor: "3f" }])
        expect(floorsOf("b1")).toEqual([{ kind: "floor", floor: "1f" }])
    })

    it("gives every item a unique id, as GuidePc requires", () => {
        for (const floor of FLOORS) {
            for (const focus of [FLOOR, STAIRS, ...roomIdsOf(floor.id).map(room)]) {
                const ids = guide(floor.id, focus).rooms.items.map((item) => item.id)
                expect(new Set(ids).size, `${floor.id} ${JSON.stringify(focus)}`).toBe(ids.length)
            }
        }
    })
})

describe("buildGuideFloorData()", () => {
    it("keeps the papers of another floor out of a room with the same category id (SCN-U1-N1)", () => {
        const onTwoF = paper("skills", "language", "TypeScript", "level 5", 5)
        const onB1 = paper("studies", "language", "Rust", "level 2", 2)
        const layout = layoutFloor(findFloor("2f"), [onTwoF])
        const data = buildGuideFloorData(layout, [onTwoF, onB1])
        expect(composeGuide({ place: "info", data, focus: room("language"), search: null }).papers).toEqual([
            { title: "TypeScript", line: "level 5" },
        ])
    })

    it("survives JSON serialisation (it crosses from the server to the client as props)", () => {
        for (const floor of FLOORS) {
            const roundTripped = JSON.parse(JSON.stringify(DATA[floor.id])) as GuideFloorData
            for (const focus of [FLOOR, STAIRS, ...roomIdsOf(floor.id).map(room)]) {
                expect(composeGuide({ place: "info", data: roundTripped, focus, search: null }), floor.id).toEqual(
                    guide(floor.id, focus)
                )
            }
        }
    })

    it("rejects a focus on a room that is not on the floor", () => {
        expect(() => guide("2f", room("profile"))).toThrow()
    })
})

describe("guide.ts source", () => {
    const source = fs.readFileSync(path.resolve(__dirname, "../guide.ts"), "utf-8")

    it("does not import the modules that load markdown, even for types", () => {
        const specifiers = [...source.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1])
        expect(specifiers.length).toBeGreaterThan(0)
        for (const specifier of specifiers) {
            expect(specifier).not.toMatch(/(^|\/)(skills|profile|portfolio|entries)$|\.md$/)
        }
    })

    it("takes the floor, room and link descriptions from the definitions instead of writing them again", () => {
        const written = [
            ...FLOORS.map((floor) => floor.description),
            ...FLOORS.flatMap((floor) => floor.groups.map((g) => g.roomDescription)).filter((d): d is string => d !== null),
            ...SOCIAL_LINKS.map((link) => link.description),
        ]
        for (const text of written) expect(source, text).not.toContain(text)
    })
})

describe("toggleSearch", () => {
    it("starts a search, clears it when pressed again, and switches to another one", () => {
        expect(toggleSearch(null, "grep -rl ai ~")).toBe("grep -rl ai ~")
        expect(toggleSearch("grep -rl ai ~", "grep -rl ai ~")).toBeNull()
        expect(toggleSearch("grep -rl ai ~", "tree -d -L 2 ~")).toBe("tree -d -L 2 ~")
    })
})
