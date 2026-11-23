import fs from "node:fs"
import path from "node:path"
import { describe, it, expect, vi } from "vitest"
import { getEntries } from "@/lib/building/entries"
import { FLOORS, findFloor, findGroup, type Floor, type FloorId, type GroupSlug } from "@/lib/building/floors"
import {
    layoutFloor,
    projectTopDown,
    type FloorLayout,
    type LayoutEntry,
    type Rect,
    type RoomLayout,
} from "@/lib/building/layout"
import { categoryOrder, categoryShortLabels } from "@/lib/skills-meta"

/**
 * layoutFloor / projectTopDown contract tests.
 *
 * Plan: lib/building/layout.ts に、FLOORS と紙の一覧から階の地図の配置を計算する純粋関数を置く。
 *   骨組み（760×520、奥側の列 y0〜230、廊下 y230〜290、手前側の列 y290〜520、階段 x640〜760・y0〜230）は全階で同じ。
 *   部屋の幅は列の中で「紙の枚数 + 3」の比（屋上は均等）。最小 48、下回る部屋は 48 にして残りを配り直す。
 *   収まらない数のときはエラーにせず均等に割る。
 *
 * Reference: order.md やること 1〜8・受け入れ条件, Issue #338
 *
 * vitest では require.context が空の stub になり getSkills() が [] を返すため、
 * entries.test.ts と同じく getSkills を「docs/skills の本物の md を parseSkillSources に渡す関数」に置き換える。
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

const BUILDING: Rect = { x: 0, y: 0, w: 760, h: 520 }
const CORRIDOR: Rect = { x: 0, y: 230, w: 760, h: 60 }
const STAIRS: Rect = { x: 640, y: 0, w: 120, h: 230 }
const BACK_WIDTH = 640
const FRONT_WIDTH = 760
const MIN_WIDTH = 48

// ---- 入力を組む補助 ----

const groupFloor = (group: GroupSlug): FloorId => findGroup(group).floor

// 分類 group の部屋 room に、紙を count 枚つくる
const papers = (group: GroupSlug, room: string, count: number): LayoutEntry[] =>
    Array.from({ length: count }, (_, i) => ({
        path: `~/${groupFloor(group)}/${group}/${room}/${String(i).padStart(3, "0")}.md`,
        floor: groupFloor(group),
        group,
        room,
        title: `${room} ${i}`,
    }))

const link = (name: string, file: string): LayoutEntry => ({
    path: `~/rf/${file}.url`,
    floor: "rf",
    group: null,
    room: null,
    title: name,
})

// B1 の分野に、順番に counts[i] 枚ずつ紙を置く
const studies = (counts: number[]): LayoutEntry[] =>
    counts.flatMap((count, i) => papers("studies", categoryOrder[i], count))

const onFloor = (entries: LayoutEntry[], id: FloorId): LayoutEntry[] => entries.filter((e) => e.floor === id)

// ---- 配置を読む補助 ----

const backRooms = (layout: FloorLayout): RoomLayout[] =>
    layout.rooms.filter((room) => room.rect.y === 0).sort((a, b) => a.rect.x - b.rect.x)
const frontRooms = (layout: FloorLayout): RoomLayout[] =>
    layout.rooms.filter((room) => room.rect.y === CORRIDOR.y + CORRIDOR.h).sort((a, b) => a.rect.x - b.rect.x)
const widths = (rooms: RoomLayout[]): number[] => rooms.map((room) => room.rect.w)

const overlapArea = (a: Rect, b: Rect): number => {
    const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)
    const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y)
    return w > 0 && h > 0 ? w * h : 0
}

const insideX = (inner: Rect, outer: Rect): boolean => inner.x >= outer.x && inner.x + inner.w <= outer.x + outer.w
const straddlesY = (rect: Rect, line: number): boolean => rect.y < line && line < rect.y + rect.h
const straddlesX = (rect: Rect, line: number): boolean => rect.x < line && line < rect.x + rect.w

// 列の幅の決まり: 合計は列の幅に一致し、左端から隙間なく並ぶ。
// 全部屋に 48 を配れる数なら全部屋 48 以上、配れない数なら均等（差は 1 以内）
function expectRowWidths(rooms: RoomLayout[], rowWidth: number) {
    if (rooms.length === 0) return
    expect(rooms.reduce((sum, room) => sum + room.rect.w, 0)).toBe(rowWidth)
    rooms.forEach((room, i) => {
        expect(room.rect.x).toBe(i === 0 ? 0 : rooms[i - 1].rect.x + rooms[i - 1].rect.w)
        expect(Number.isInteger(room.rect.w)).toBe(true)
    })
    const ws = widths(rooms)
    if (rooms.length * MIN_WIDTH <= rowWidth) {
        expect(Math.min(...ws)).toBeGreaterThanOrEqual(MIN_WIDTH)
    } else {
        expect(Math.max(...ws) - Math.min(...ws)).toBeLessThanOrEqual(1)
    }
}

// どの階でも成り立つべき配置の決まり
function expectValidLayout(layout: FloorLayout) {
    expect(layout.building).toEqual(BUILDING)
    expect(layout.corridor).toEqual(CORRIDOR)
    expect(layout.stairs).toEqual(STAIRS)

    const back = backRooms(layout)
    const front = frontRooms(layout)
    // 全部屋がどちらかの列にあり、廊下に面する
    expect(back.length + front.length).toBe(layout.rooms.length)
    for (const room of back) {
        expect(room.rect.h).toBe(CORRIDOR.y)
        expect(room.rect.x + room.rect.w).toBeLessThanOrEqual(BACK_WIDTH)
    }
    for (const room of front) {
        expect(room.rect.h).toBe(BUILDING.h - (CORRIDOR.y + CORRIDOR.h))
        expect(room.rect.x + room.rect.w).toBeLessThanOrEqual(FRONT_WIDTH)
    }
    expectRowWidths(back, BACK_WIDTH)
    expectRowWidths(front, FRONT_WIDTH)

    // 建物に収まり、部屋同士・階段・廊下と重ならない
    const rects = [layout.corridor, layout.stairs, ...layout.rooms.map((room) => room.rect)]
    for (const rect of rects) {
        expect(rect.x).toBeGreaterThanOrEqual(0)
        expect(rect.y).toBeGreaterThanOrEqual(0)
        expect(rect.x + rect.w).toBeLessThanOrEqual(BUILDING.w)
        expect(rect.y + rect.h).toBeLessThanOrEqual(BUILDING.h)
    }
    rects.forEach((a, i) => rects.slice(i + 1).forEach((b) => expect(overlapArea(a, b)).toBe(0)))

    // 廊下側の扉は、部屋の x 範囲の中で廊下との境界線にまたがる
    for (const room of back) {
        expect(insideX(room.door, room.rect)).toBe(true)
        expect(straddlesY(room.door, CORRIDOR.y)).toBe(true)
    }
    for (const room of front) {
        expect(insideX(room.door, room.rect)).toBe(true)
        expect(straddlesY(room.door, CORRIDOR.y + CORRIDOR.h)).toBe(true)
    }
}

// 今のデータから、FLOORS と categoryOrder の順に期待する部屋の id と枚数を作る
function expectedRooms(floor: Floor, entries: LayoutEntry[]): { id: string; count: number }[] {
    if (floor.id === "rf") return entries.map((entry) => ({ id: entry.path, count: 1 }))
    return floor.groups.flatMap((g): { id: string; count: number }[] => {
        const inGroup = entries.filter((entry) => entry.group === g.slug)
        if (g.slug === "skills" || g.slug === "studies") {
            return categoryOrder
                .map((category) => ({ id: category, count: inGroup.filter((e) => e.room === category).length }))
                .filter((room) => room.count > 0)
        }
        return [{ id: g.slug, count: inGroup.length }]
    })
}

describe("room names", () => {
    it("adds short category names for the map labels", () => {
        expect(categoryShortLabels).toEqual({
            language: "言語",
            frontend: "フロントエンド",
            framework: "バックエンド",
            compute: "コンピューティング",
            networking: "ネットワーク",
            storage: "ストレージ",
            database: "データベース",
            integration: "統合サービス",
            IaC: "IaC",
            container: "コンテナ",
            tools: "ツール",
            architecture: "設計",
            methodology: "開発手法",
            api: "API",
            "ai-llm": "AI・LLM",
            ml: "機械学習",
            "devops-sre": "DevOps",
            testing: "テスト",
            security: "セキュリティ",
            auth: "認証",
        })
    })

    it("gives each group of FLOORS its room name", () => {
        // 分野ごとに部屋を分ける分類（skills / studies）は名前を持たない
        expect(findGroup("profile").roomName).toBe("プロフィール")
        expect(findGroup("contact").roomName).toBe("受付・連絡先")
        expect(findGroup("histories").roomName).toBe("経歴")
        expect(findGroup("portfolios").roomName).toBe("作ったもの")
        expect(findGroup("skills").roomName).toBeNull()
        expect(findGroup("studies").roomName).toBeNull()
    })
})

describe("layoutFloor() with the current data", () => {
    it("lays out all five floors without overlaps, inside the building, every room facing the corridor", async () => {
        const entries = await getEntries()
        for (const floor of FLOORS) {
            const layout = layoutFloor(floor, onFloor(entries, floor.id))
            expect(layout.floor).toBe(floor.id)
            expectValidLayout(layout)
            expect(layout.rooms.map((room) => ({ id: room.id, count: room.count }))).toEqual(
                expectedRooms(floor, onFloor(entries, floor.id)),
            )
        }
    })

    it("keeps the stairs at the same rect on every floor", async () => {
        const entries = await getEntries()
        const stairs = FLOORS.map((floor) => layoutFloor(floor, onFloor(entries, floor.id)).stairs)
        expect(stairs).toHaveLength(5)
        for (const rect of stairs) expect(rect).toEqual(STAIRS)
    })

    it("names the rooms with the short names, the group room names and the link names", async () => {
        const entries = await getEntries()
        const names = (id: FloorId) => layoutFloor(findFloor(id), onFloor(entries, id)).rooms.map((room) => room.name)

        expect(names("1f")).toEqual(["プロフィール", "受付・連絡先"])
        expect(names("3f")).toEqual(["作ったもの"])
        expect(names("rf")).toEqual(["GitHub", "Zenn", "X"])
        const twoF = layoutFloor(findFloor("2f"), onFloor(entries, "2f")).rooms
        expect(twoF[0].name).toBe("経歴")
        for (const room of twoF.slice(1)) {
            expect(room.name).toBe(categoryShortLabels[room.id as keyof typeof categoryShortLabels])
        }
    })

    it("still holds after adding one room", async () => {
        const entries = await getEntries()
        const twoF = onFloor(entries, "2f")
        const missing = categoryOrder.find((category) => !twoF.some((entry) => entry.room === category))
        expect(missing).toBeDefined()

        const before = layoutFloor(findFloor("2f"), twoF)
        const after = layoutFloor(findFloor("2f"), [...twoF, ...papers("skills", missing!, 1)])

        expect(after.rooms).toHaveLength(before.rooms.length + 1)
        expect(after.rooms.find((room) => room.id === missing)?.count).toBe(1)
        expectValidLayout(after)
    })
})

describe("layoutFloor() rooms", () => {
    it("makes one room per category with papers, in categoryOrder, after the groups in FLOORS order", () => {
        // 入力の順は分野の順と逆にしておく。紙 0 枚の分野（framework）は部屋にしない
        const entries = [
            ...papers("skills", "database", 1),
            ...papers("skills", "language", 3),
            ...papers("histories", "histories", 2),
        ]
        const layout = layoutFloor(findFloor("2f"), entries)

        expect(layout.rooms.map((room) => room.id)).toEqual(["histories", "language", "database"])
        expect(layout.rooms.map((room) => room.count)).toEqual([2, 3, 1])
        expect(layout.rooms.map((room) => room.group)).toEqual(["histories", "skills", "skills"])
        expect(layout.rooms.map((room) => room.name)).toEqual(["経歴", "言語", "データベース"])
    })

    it("makes a room for a group even when it has no papers", () => {
        const layout = layoutFloor(findFloor("1f"), papers("profile", "profile", 4))

        expect(layout.rooms.map((room) => ({ id: room.id, count: room.count }))).toEqual([
            { id: "profile", count: 4 },
            { id: "contact", count: 0 },
        ])
    })

    it("makes one rooftop room per external link, named without the parenthesized part", () => {
        const layout = layoutFloor(findFloor("rf"), [
            link("GitHub", "github"),
            link("Zenn", "zenn"),
            link("X (Twitter)", "x"),
        ])

        expect(layout.rooms.map((room) => room.id)).toEqual(["~/rf/github.url", "~/rf/zenn.url", "~/rf/x.url"])
        expect(layout.rooms.map((room) => room.name)).toEqual(["GitHub", "Zenn", "X"])
    })
})

describe("layoutFloor() rows", () => {
    it("wraps to the front row where the sums of (papers + 3) are closest to half", () => {
        // 重み [10, 10, 10, 10] → 2 部屋ずつ
        const even = layoutFloor(findFloor("b1"), studies([7, 7, 7, 7]))
        expect(backRooms(even).map((room) => room.id)).toEqual(categoryOrder.slice(0, 2))
        expect(frontRooms(even).map((room) => room.id)).toEqual(categoryOrder.slice(2, 4))

        // 重み [20, 4, 4, 4] → 奥側は 1 部屋（部屋の数の半分では割らない）
        const skewed = layoutFloor(findFloor("b1"), studies([17, 1, 1, 1]))
        expect(backRooms(skewed).map((room) => room.id)).toEqual(categoryOrder.slice(0, 1))
        expect(frontRooms(skewed).map((room) => room.id)).toEqual(categoryOrder.slice(1, 4))
        expectValidLayout(skewed)
    })

    it("puts the only room of a floor in the front row", () => {
        const threeF = layoutFloor(findFloor("3f"), papers("portfolios", "portfolios", 5))
        expect(backRooms(threeF)).toHaveLength(0)
        expect(frontRooms(threeF).map((room) => room.rect)).toEqual([{ x: 0, y: 290, w: 760, h: 230 }])

        const b1 = layoutFloor(findFloor("b1"), studies([3]))
        expect(backRooms(b1)).toHaveLength(0)
        expect(frontRooms(b1)).toHaveLength(1)
    })

    it("puts the profile in the back row and the contact in the front row on 1F", () => {
        // 枚数の比では決めない（連絡先の枚数が多くても手前側）
        for (const entries of [papers("profile", "profile", 30), [...papers("contact", "contact", 30)]]) {
            const layout = layoutFloor(findFloor("1f"), entries)
            expect(backRooms(layout).map((room) => room.id)).toEqual(["profile"])
            expect(frontRooms(layout).map((room) => room.id)).toEqual(["contact"])
            expect(backRooms(layout)[0].rect).toEqual({ x: 0, y: 0, w: 640, h: 230 })
            expect(frontRooms(layout)[0].rect).toEqual({ x: 0, y: 290, w: 760, h: 230 })
        }
    })

    it("puts every rooftop room in the front row with equal widths", () => {
        const layout = layoutFloor(findFloor("rf"), [link("GitHub", "github"), link("Zenn", "zenn"), link("X (Twitter)", "x")])
        expect(backRooms(layout)).toHaveLength(0)
        expect(frontRooms(layout).map((room) => room.id)).toEqual(["~/rf/github.url", "~/rf/zenn.url", "~/rf/x.url"])
        const ws = widths(frontRooms(layout))
        expect(ws.reduce((a, b) => a + b, 0)).toBe(760)
        expect(Math.max(...ws) - Math.min(...ws)).toBeLessThanOrEqual(1)
        expectValidLayout(layout)
    })
})

describe("layoutFloor() widths", () => {
    it("shares a row in proportion to (papers + 3)", () => {
        // 重み [4, 9, 7, 12]: 奥側 [4, 9]、手前側 [7, 12]（760 × 7/19 = 280、760 × 12/19 = 480）
        const layout = layoutFloor(findFloor("b1"), studies([1, 6, 4, 9]))
        expect(frontRooms(layout).map((room) => room.id)).toEqual(categoryOrder.slice(2, 4))
        expect(widths(frontRooms(layout))).toEqual([280, 480])
        const back = widths(backRooms(layout))
        expect(Math.abs(back[0] - (640 * 4) / 13)).toBeLessThan(1)
        expect(Math.abs(back[1] - (640 * 9) / 13)).toBeLessThan(1)
        expectValidLayout(layout)
    })

    it("raises a room narrower than 48 to 48 and shares the rest among the others", () => {
        // 重み [4, 63, 4, 63]: 奥側 640 × 4/67 ≈ 38、手前側 760 × 4/67 ≈ 45 → どちらも 48 にする
        const layout = layoutFloor(findFloor("b1"), studies([1, 60, 1, 60]))
        expect(widths(backRooms(layout))).toEqual([48, 592])
        expect(widths(frontRooms(layout))).toEqual([48, 712])
    })

    it("keeps 20 rooms at 48 or wider when they fit", () => {
        const layout = layoutFloor(findFloor("b1"), studies(Array.from({ length: 20 }, () => 1)))
        expect(layout.rooms).toHaveLength(20)
        expect(Math.min(...widths(layout.rooms))).toBeGreaterThanOrEqual(MIN_WIDTH)
        expectValidLayout(layout)
    })

    it("splits a row evenly without throwing when 48 each does not fit", () => {
        // 重み [303, 4 × 19]: 奥側は 1 部屋、手前側に 19 部屋（19 × 48 = 912 > 760）→ 760 / 19 = 40
        const layout = layoutFloor(findFloor("b1"), studies([300, ...Array.from({ length: 19 }, () => 1)]))
        expect(layout.rooms).toHaveLength(20)
        expect(widths(backRooms(layout))).toEqual([640])
        expect(widths(frontRooms(layout))).toEqual(Array.from({ length: 19 }, () => 40))
        expectValidLayout(layout)
    })

    it("splits 20 rooftop links evenly at 38", () => {
        const links = Array.from({ length: 20 }, (_, i) => link(`Link${i}`, `link${i}`))
        const layout = layoutFloor(findFloor("rf"), links)
        expect(layout.rooms).toHaveLength(20)
        expect(widths(frontRooms(layout))).toEqual(Array.from({ length: 20 }, () => 38))
        expectValidLayout(layout)
    })
})

describe("layoutFloor() doors and the ground floor", () => {
    it("gives each rooftop room a door to the outside on the front wall, and no other floor", async () => {
        const entries = await getEntries()
        for (const floor of FLOORS) {
            const layout = layoutFloor(floor, onFloor(entries, floor.id))
            for (const room of layout.rooms) {
                if (floor.id === "rf") {
                    expect(room.outsideDoor).not.toBeNull()
                    expect(insideX(room.outsideDoor!, room.rect)).toBe(true)
                    expect(straddlesY(room.outsideDoor!, BUILDING.h)).toBe(true)
                } else {
                    expect(room.outsideDoor).toBeNull()
                }
            }
        }
    })

    it("returns the entrance, the exit, the deck and the entrance step only on 1F", async () => {
        const entries = await getEntries()
        const oneF = layoutFloor(findFloor("1f"), onFloor(entries, "1f"))
        const ground = oneF.ground
        expect(ground).not.toBeNull()
        const contact = oneF.rooms.find((room) => room.id === "contact")!

        // 入口: 廊下の右端の壁（x = 760）にまたがる
        expect(straddlesX(ground!.entrance, BUILDING.w)).toBe(true)
        expect(ground!.entrance.y).toBeGreaterThanOrEqual(CORRIDOR.y)
        expect(ground!.entrance.y + ground!.entrance.h).toBeLessThanOrEqual(CORRIDOR.y + CORRIDOR.h)
        // 出口: 連絡先の部屋の手前の外壁（y = 520）にまたがる
        expect(insideX(ground!.exit, contact.rect)).toBe(true)
        expect(straddlesY(ground!.exit, BUILDING.h)).toBe(true)
        // デッキ: 建物の手前に奥行 56
        expect(ground!.deck).toEqual({ x: 0, y: 520, w: 760, h: 56 })
        // 踏み板: 入口の前（廊下の右）に接する
        expect(ground!.entranceStep.x).toBe(BUILDING.w)
        expect(ground!.entranceStep.y).toBeLessThan(CORRIDOR.y + CORRIDOR.h)
        expect(ground!.entranceStep.y + ground!.entranceStep.h).toBeGreaterThan(CORRIDOR.y)

        for (const floor of FLOORS.filter((f) => f.id !== "1f")) {
            expect(layoutFloor(floor, onFloor(entries, floor.id)).ground).toBeNull()
        }
    })
})

describe("layoutFloor() input contract", () => {
    it("does not modify its input and returns the same result for the same input", async () => {
        const entries = onFloor(await getEntries(), "2f").reverse()
        const frozen = Object.freeze(entries.map((entry) => Object.freeze({ ...entry })))
        const first = layoutFloor(findFloor("2f"), frozen)
        expect(layoutFloor(findFloor("2f"), frozen)).toEqual(first)
    })

    it("throws on a category that is not in categoryOrder", () => {
        expect(() => layoutFloor(findFloor("b1"), papers("studies", "cobol", 1))).toThrow(Error)
    })

    it("throws on a group that is not on the floor", () => {
        const stray: LayoutEntry = { ...papers("skills", "language", 1)[0], floor: "1f" }
        expect(() => layoutFloor(findFloor("1f"), [stray])).toThrow(Error)
    })
})

describe("projectTopDown()", () => {
    it("rotates by 45° and halves the height around the center of the building", () => {
        const center = projectTopDown({ x: 380, y: 260 })
        expect(center.x).toBeCloseTo(0, 5)
        expect(center.y).toBeCloseTo(0, 5)

        const right = projectTopDown({ x: 480, y: 260 })
        expect(right.x).toBeCloseTo(70.7107, 3)
        expect(right.y).toBeCloseTo(35.3553, 3)

        const front = projectTopDown({ x: 380, y: 360 })
        expect(front.x).toBeCloseTo(-70.7107, 3)
        expect(front.y).toBeCloseTo(35.3553, 3)
    })
})

describe("client safety", () => {
    // lib/building/layout.ts は Client Component から import されうるため、
    // md を読み込むモジュール（skills / profile / portfolio / entries）や .md を import してはならない。
    it("layout.ts does not import modules that load markdown", () => {
        const source = fs.readFileSync(path.resolve(__dirname, "../layout.ts"), "utf-8")
        const specifiers = [...source.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1])

        for (const specifier of specifiers) {
            expect(specifier).not.toMatch(/(^|\/)(skills|profile|portfolio|entries)$|\.md$/)
        }
    })
})
