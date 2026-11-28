// 案内人の PC（GuidePc）に出す内容を、選んでいる階・部屋・階段と探しものの結果から組み立てる純粋関数だけを置くモジュール。
// 案内所と階のページで同じ関数を使う。階ごとのデータ（GuideFloorData）は Server Component が紙の一覧から作り、
// props で Client Component へ渡す（JSON にして戻しても同じ結果になる）。
// Client Component からも import されるため、md を読み込むモジュール（skills / profile / portfolio / entries）は
// import しない（型も含む）。入力の紙は Entry が構造的に当てはまる最小の型（GuideEntry）で受ける。
// 文面の決まりは docs/design-system.md「案内人の文面と探しもの」にある。文面の元になる階・部屋・外部リンクの説明は
// 定義（FLOORS・SOCIAL_LINKS）が持ち、ここでは書き直さない。

import { SOCIAL_LINKS } from "../constants"
import { categoryLabels, type SkillCategory } from "../skills-meta"
import { FLOORS, findFloor, findGroup, type FloorGroup, type FloorId, type GroupSlug } from "./floors"
import { roomIdOf, type FloorLayout } from "./layout"
import type { SearchResult } from "./searches"

export class GuideInputError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "GuideInputError"
    }
}

// buildGuideFloorData が読む紙の項目。Entry はこの型に当てはまる
export interface GuideEntry {
    path: string
    floor: FloorId
    group: GroupSlug | null
    room: string | null
    title: string
    excerpt: string
    href: string
}

// 階の中で選んでいるもの。階だけ・部屋（地図の部屋の id）・階段
export type GuideFocus = { kind: "floor" } | { kind: "room"; id: string } | { kind: "stairs" }

export interface GuideSelection {
    floor: FloorId
    focus: GuideFocus
}

// 案内所（階を切り替えられる）か、階のページ（その階のページにいる）か
export type GuidePlace = "info" | "floor"

export interface GuidePaperLine {
    title: string
    line: string
}

interface GuideLink {
    label: string
    href: string
    external: boolean // 外のサイト（屋上の部屋）か、このサイトのページか
}

interface GuideRoomData {
    id: string
    name: string // 一覧と文章に出す名前（分野の部屋は分野の名前）
    description: string // 部屋の説明（屋上の部屋は外部リンクの説明）
    papers: GuidePaperLine[] // 部屋の紙。紙の並びのまま
    link: GuideLink // 行き先（分類のページ、または外のサイト）
}

// 1 つの階の案内に要るデータ。Server で作り、props で渡す
export interface GuideFloorData {
    floor: FloorId
    groups: GuidePaperLine[] // 階を選んでいるときの「置いてあるもの」（分類の名前と、件数か一言）
    rooms: GuideRoomData[] // 地図の部屋の順
}

export type GuideTarget =
    | { kind: "focus"; focus: GuideFocus } // 同じ階の中で選ぶ
    | { kind: "floor"; floor: FloorId } // 別の階（案内所は階を選び、階のページはそのページへのリンクにする）

export interface GuideRoomItem {
    id: string
    name: string
    target: GuideTarget
}

export interface GuideView {
    text: string
    papers: GuidePaperLine[]
    destinations: { label: string; href: string }[] // 外のサイトかどうかは DoorButton が href から判定し、↗ を付ける
    rooms: { scope: "floor" | "room"; items: GuideRoomItem[] }
}

// 分類の「件数か一言」。一言（note）がなければ件数
export const groupLine = (group: FloorGroup, count: number): string => group.note ?? `${count} 件`

const SELECT_HINT = "部屋を押すと、中身をお見せします。"
const PAPERS_HINT = "置いてあるものは、下のとおりです。"
const NEW_TAB_HINT = "外のサイトが別のタブで開きます。"
const STAIRS_TEXT = "階段です。上の階・下の階へは、下の一覧から移れます。"
const STAIRS_ITEM = { id: "stairs", name: "階段" } as const
const CORRIDOR_ITEM = { id: "corridor", name: "廊下へ戻る" } as const

function roomDataOf(room: FloorLayout["rooms"][number], entries: readonly GuideEntry[]): GuideRoomData {
    if (room.group === null) {
        // 屋上の部屋。id は外部リンクの紙の仮想パスで、紙の href が外部リンクの URL
        const paper = entries.find((entry) => roomIdOf(entry) === room.id)
        const link = SOCIAL_LINKS.find((candidate) => candidate.url === paper?.href)
        if (!link) throw new GuideInputError(`Rooftop room ${room.id} does not point at a link of SOCIAL_LINKS`)
        return {
            id: room.id,
            name: room.name,
            description: link.description,
            papers: [],
            link: { label: `${room.name} を開く`, href: link.url, external: true },
        }
    }

    const group = findGroup(room.group)
    // 分野で分かれる分類（roomDescription が null）の部屋は、分野の名前で説明を組み立てる
    const name = group.roomDescription === null ? categoryLabels[room.id as SkillCategory] : room.name
    return {
        id: room.id,
        name,
        description: group.roomDescription ?? `${name}の技術を、経験の深い順に置いてあります。`,
        papers: entries
            .filter((entry) => entry.group === room.group && roomIdOf(entry) === room.id)
            .map((entry) => ({ title: entry.title, line: entry.excerpt })),
        link: { label: `${group.name}のページで読む`, href: group.href, external: false },
    }
}

export function buildGuideFloorData(layout: FloorLayout, entries: readonly GuideEntry[]): GuideFloorData {
    const floor = findFloor(layout.floor)
    return {
        floor: floor.id,
        groups: floor.groups.map((group) => ({
            title: group.name,
            line: groupLine(group, entries.filter((entry) => entry.group === group.slug).length),
        })),
        rooms: layout.rooms.map((room) => roomDataOf(room, entries)),
    }
}

function roomText(room: GuideRoomData): string {
    if (room.link.external) return `${room.description}${NEW_TAB_HINT}`
    const intro = `「${room.name}」です。${room.description}`
    return room.papers.length > 0 ? `${intro}${PAPERS_HINT}` : intro
}

function floorText(floor: FloorId, search: SearchResult | null): string {
    if (search?.counted) {
        return `${search.hits.length} 件見つかりました。光っている部屋を押すと、中身をお見せします。ほかの階にもあるときは、階の横に件数が出ています。`
    }
    const { label, name, description } = findFloor(floor)
    return `ここは ${label}「${name}」です。${description}${SELECT_HINT}`
}

const roomItem = (room: GuideRoomData): GuideRoomItem => ({
    id: `room:${room.id}`,
    name: room.name,
    target: { kind: "focus", focus: { kind: "room", id: room.id } },
})

const corridorItem = (): GuideRoomItem => ({
    id: CORRIDOR_ITEM.id,
    name: CORRIDOR_ITEM.name,
    target: { kind: "focus", focus: { kind: "floor" } },
})

const stairsItem = (): GuideRoomItem => ({
    id: STAIRS_ITEM.id,
    name: STAIRS_ITEM.name,
    target: { kind: "focus", focus: { kind: "stairs" } },
})

function neighbourItems(floor: FloorId): GuideRoomItem[] {
    const index = FLOORS.findIndex((candidate) => candidate.id === floor)
    const neighbours = [
        { prefix: "上の階へ", floor: FLOORS[index + 1] },
        { prefix: "下の階へ", floor: FLOORS[index - 1] },
    ]
    return neighbours.flatMap(({ prefix, floor: neighbour }) =>
        neighbour
            ? [
                  {
                      id: `floor:${neighbour.id}`,
                      name: `${prefix} — ${neighbour.label} ${neighbour.name}`,
                      target: { kind: "floor", floor: neighbour.id } as const,
                  },
              ]
            : []
    )
}

export function composeGuide({
    place,
    data,
    focus,
    search,
}: {
    place: GuidePlace
    data: GuideFloorData
    focus: GuideFocus
    search: SearchResult | null
}): GuideView {
    if (focus.kind === "stairs") {
        return {
            text: STAIRS_TEXT,
            papers: [],
            destinations: [],
            rooms: { scope: "room", items: [corridorItem(), ...neighbourItems(data.floor)] },
        }
    }

    if (focus.kind === "room") {
        const room = data.rooms.find((candidate) => candidate.id === focus.id)
        if (!room) throw new GuideInputError(`Room ${focus.id} is not on floor ${data.floor}`)
        return {
            text: roomText(room),
            papers: room.papers,
            destinations: [{ label: room.link.label, href: room.link.href }],
            rooms: {
                scope: "room",
                items: [
                    corridorItem(),
                    ...data.rooms.filter((candidate) => candidate !== room).map(roomItem),
                    stairsItem(),
                ],
            },
        }
    }

    const floor = findFloor(data.floor)
    return {
        text: floorText(data.floor, search),
        papers: data.groups,
        destinations:
            place === "info" ? [{ label: `${floor.label} のページへ`, href: floor.url }] : [],
        rooms: { scope: "floor", items: [...data.rooms.map(roomItem), stairsItem()] },
    }
}
