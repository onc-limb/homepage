// 階の地図の配置（部屋の位置と大きさ）を、FLOORS と紙の一覧から計算する純粋関数だけを置くモジュール。
// Client Component から import されうるため、md を読み込むモジュール（skills / profile / portfolio / entries）は
// import しない。入力の紙は Entry が構造的に当てはまる最小の型（LayoutEntry）で受ける。
// 2D の地図と、後の一人称 3D は、同じ計算結果を使う。

import { categoryOrder, categoryShortLabels, type SkillCategory } from "../skills-meta"
import type { Floor, FloorId, GroupSlug } from "./floors"

export interface Rect {
    x: number
    y: number
    w: number
    h: number
}

export interface Point {
    x: number
    y: number
}

// layoutFloor が読む紙の項目。Entry はこの型に当てはまる
export interface LayoutEntry {
    path: string
    floor: FloorId
    group: GroupSlug | null
    room: string | null
    title: string
}

export type RoomRow = "back" | "front"

export interface RoomLayout {
    id: string // 分野・分類の slug。屋上は外部リンクの仮想パス
    name: string // 地図のラベルに出す短い名前
    group: GroupSlug | null // 屋上の部屋は分類を持たない
    count: number // 紙の枚数
    row: RoomRow
    rect: Rect
    door: Rect // 廊下側の扉
    outsideDoor: Rect | null // 手前の外壁の外への扉（屋上の部屋だけ）
}

export interface GroundLayout {
    entrance: Rect // 廊下の右端の入口の扉
    exit: Rect // 連絡先の部屋の手前の外壁の出口の扉
    deck: Rect // 建物の手前のデッキ
    entranceStep: Rect // 入口の前の踏み板
}

export interface FloorLayout {
    floor: FloorId
    building: Rect
    corridor: Rect
    stairs: Rect
    rooms: RoomLayout[] // FLOORS の分類の順（分野は categoryOrder の順）
    ground: GroundLayout | null // 1F だけ
}

export class LayoutInputError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "LayoutInputError"
    }
}

const BUILDING: Rect = { x: 0, y: 0, w: 760, h: 520 }
const CORRIDOR: Rect = { x: 0, y: 230, w: 760, h: 60 }
const STAIRS: Rect = { x: 640, y: 0, w: 120, h: 230 }
const BACK_ROW = { y: 0, h: 230, width: 640 }
const FRONT_ROW = { y: 290, h: 230, width: 760 }
const MIN_ROOM_WIDTH = 48
const PAPER_WEIGHT_OFFSET = 3 // 部屋の重み = 紙の枚数 + 3
const DOOR = { w: 28, h: 6 }
const DECK_DEPTH = 56
const ENTRANCE_DOOR: Rect = { x: 757, y: 246, w: 6, h: 28 }
const ENTRANCE_STEP: Rect = { x: 760, y: 230, w: 60, h: 60 }

interface RoomSpec {
    id: string
    name: string
    group: GroupSlug | null
    count: number
}

const isCategory = (value: string | null): value is SkillCategory =>
    value !== null && (categoryOrder as string[]).includes(value)

// 外部リンクの名前の末尾の " (…)" を除く（"X (Twitter)" → "X"）
const linkName = (title: string): string => title.replace(/\s*\([^)]*\)\s*$/, "")

function collectRooms(floor: Floor, entries: readonly LayoutEntry[]): RoomSpec[] {
    for (const entry of entries) {
        if (entry.floor !== floor.id) {
            throw new LayoutInputError(`Entry ${entry.path} belongs to floor ${entry.floor}, not ${floor.id}`)
        }
    }

    if (floor.id === "rf") {
        return entries.map((entry) => ({ id: entry.path, name: linkName(entry.title), group: null, count: 1 }))
    }

    for (const entry of entries) {
        if (!floor.groups.some((g) => g.slug === entry.group)) {
            throw new LayoutInputError(`Entry ${entry.path} has group ${entry.group} which is not on floor ${floor.id}`)
        }
    }

    return floor.groups.flatMap((g): RoomSpec[] => {
        const inGroup = entries.filter((entry) => entry.group === g.slug)
        if (g.roomName !== null) return [{ id: g.slug, name: g.roomName, group: g.slug, count: inGroup.length }]

        for (const entry of inGroup) {
            if (!isCategory(entry.room)) {
                throw new LayoutInputError(`Entry ${entry.path} has category ${entry.room} which is not in categoryOrder`)
            }
        }
        return categoryOrder
            .map((category) => ({
                id: category,
                name: categoryShortLabels[category],
                group: g.slug,
                count: inGroup.filter((entry) => entry.room === category).length,
            }))
            .filter((room) => room.count > 0)
    })
}

const weightOf = (room: RoomSpec): number => room.count + PAPER_WEIGHT_OFFSET

// 順番どおりに奥側から並べ、重みの合計が全体のほぼ半分になるところで手前側に折り返す。
// 同じ差のときは、幅の狭い奥側を軽くする（小さい k）
function assignRows(floor: Floor, rooms: RoomSpec[]): RoomRow[] {
    if (floor.id === "rf" || rooms.length === 1) return rooms.map(() => "front")
    if (floor.id === "1f") return rooms.map((room) => (room.group === "contact" ? "front" : "back"))

    const total = rooms.reduce((sum, room) => sum + weightOf(room), 0)
    let best = { k: 1, gap: Infinity }
    let backSum = 0
    for (let k = 1; k < rooms.length; k++) {
        backSum += weightOf(rooms[k - 1])
        const gap = Math.abs(backSum * 2 - total)
        if (gap < best.gap) best = { k, gap }
    }
    return rooms.map((_, i) => (i < best.k ? "back" : "front"))
}

// weights の比で total を整数に配る。余りは端数の大きい順（同じなら前の部屋）に 1 ずつ渡す
function shareByRatio(weights: number[], total: number): number[] {
    const sum = weights.reduce((a, b) => a + b, 0)
    const bases = weights.map((w) => Math.floor((total * w) / sum))
    const fractions = weights.map((w, i) => ({ i, rest: (total * w) % sum }))
    fractions.sort((a, b) => b.rest - a.rest || a.i - b.i)
    let leftover = total - bases.reduce((a, b) => a + b, 0)
    for (const { i } of fractions) {
        if (leftover === 0) break
        bases[i] += 1
        leftover -= 1
    }
    return bases
}

// 最小幅を下回る部屋は最小幅にし、残りの幅を残りの部屋に同じ比で配り直す（下回る部屋がなくなるまで繰り返す）。
// 全部屋に最小幅を配れない数のときは、エラーにせず均等に割る
function allocateWidths(weights: number[], total: number): number[] {
    if (weights.length * MIN_ROOM_WIDTH > total) return shareByRatio(weights.map(() => 1), total)

    const pinned = new Set<number>()
    for (;;) {
        const freeIndexes = weights.map((_, i) => i).filter((i) => !pinned.has(i))
        const remaining = total - pinned.size * MIN_ROOM_WIDTH
        const freeSum = freeIndexes.reduce((sum, i) => sum + weights[i], 0)
        const below = freeIndexes.filter((i) => (remaining * weights[i]) / freeSum < MIN_ROOM_WIDTH)
        if (below.length === 0) {
            const shares = shareByRatio(freeIndexes.map((i) => weights[i]), remaining)
            const result = weights.map(() => MIN_ROOM_WIDTH)
            freeIndexes.forEach((roomIndex, n) => {
                result[roomIndex] = shares[n]
            })
            return result
        }
        below.forEach((i) => pinned.add(i))
    }
}

// 部屋の x 範囲の中央に、幅 28 の扉を置く（部屋が狭いときは部屋の幅に収める）。線 y に扉の中心を合わせる
function doorAt(room: Rect, lineY: number): Rect {
    const w = Math.min(DOOR.w, room.w)
    return { x: room.x + Math.floor((room.w - w) / 2), y: lineY - DOOR.h / 2, w, h: DOOR.h }
}

export function layoutFloor(floor: Floor, entries: readonly LayoutEntry[]): FloorLayout {
    const specs = collectRooms(floor, entries)
    const rows = assignRows(floor, specs)

    const rects = new Map<number, Rect>()
    for (const row of ["back", "front"] as const) {
        const indexes = specs.map((_, i) => i).filter((i) => rows[i] === row)
        if (indexes.length === 0) continue
        const frame = row === "back" ? BACK_ROW : FRONT_ROW
        // 屋上は均等。ほかは「紙の枚数 + 3」の比
        const weights = indexes.map((i) => (floor.id === "rf" ? 1 : weightOf(specs[i])))
        let x = 0
        allocateWidths(weights, frame.width).forEach((w, n) => {
            rects.set(indexes[n], { x, y: frame.y, w, h: frame.h })
            x += w
        })
    }

    const rooms = specs.map((spec, i): RoomLayout => {
        const rect = rects.get(i)!
        const row = rows[i]
        return {
            ...spec,
            row,
            rect,
            door: doorAt(rect, row === "back" ? CORRIDOR.y : CORRIDOR.y + CORRIDOR.h),
            outsideDoor: floor.id === "rf" ? doorAt(rect, BUILDING.h) : null,
        }
    })

    return {
        floor: floor.id,
        building: { ...BUILDING },
        corridor: { ...CORRIDOR },
        stairs: { ...STAIRS },
        rooms,
        ground: floor.id === "1f" ? groundOf(rooms) : null,
    }
}

function groundOf(rooms: RoomLayout[]): GroundLayout {
    const contact = rooms.find((room) => room.group === "contact")
    if (!contact) throw new LayoutInputError("Floor 1f has no contact room to put the exit on")
    return {
        entrance: { ...ENTRANCE_DOOR },
        exit: doorAt(contact.rect, BUILDING.h),
        deck: { x: 0, y: BUILDING.h, w: BUILDING.w, h: DECK_DEPTH },
        entranceStep: { ...ENTRANCE_STEP },
    }
}

const TOP_DOWN_VERTICAL_SCALE = 0.5
export const TOP_DOWN_TRANSFORM = `scaleY(${TOP_DOWN_VERTICAL_SCALE}) rotate(45deg)`

// 上から見下ろす投影（45° 回して縦を 1/2）。建物の中心を原点にした座標を返す。
// TOP_DOWN_TRANSFORM（transform-origin は中心）と同じ変換
export function projectTopDown(point: Point): Point {
    const dx = point.x - (BUILDING.x + BUILDING.w / 2)
    const dy = point.y - (BUILDING.y + BUILDING.h / 2)
    return { x: (dx - dy) * Math.SQRT1_2, y: (dx + dy) * Math.SQRT1_2 * TOP_DOWN_VERTICAL_SCALE }
}
