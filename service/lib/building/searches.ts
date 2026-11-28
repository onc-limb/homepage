// 案内人の「探しもの」（grep / tree 風の絞り込み）を、紙の一覧から計算する純粋関数だけを置くモジュール。
// Server Component が getEntries() の結果から計算し、props で Client Component へ渡す。
// Client Component からも import されるため、md を読み込むモジュール（skills / profile / portfolio / entries）は
// import しない（型も含む）。入力の紙は Entry が構造的に当てはまる最小の型（SearchEntry）で受ける。
// 文面と絞り方の決まりは docs/design-system.md「案内人の文面と探しもの」にある。

import { FLOORS, toVirtualPath, type FloorId, type GroupSlug } from "./floors"
import { roomIdOf } from "./layout"

// runSearches が読む紙の項目。Entry はこの型に当てはまる
export interface SearchEntry {
    path: string
    floor: FloorId
    group: GroupSlug | null
    room: string | null
    title: string
    excerpt: string
    tags: readonly string[]
    level?: number
}

export interface SearchHit {
    path: string // 結果に出す仮想パス（tree は階ごとの 1 行）
    floor: FloorId
    room: string | null // 地図の部屋の id（屋上の部屋は紙の仮想パス）。tree の行は null
}

// GuidePc の GuideSearch（label・command・summary・paths）に、当たりの階と部屋を足したもの
export interface SearchResult {
    label: string
    command: string
    summary: string
    paths: string[]
    hits: SearchHit[]
    counted: boolean // 当たった紙の件数を出し、部屋を光らせ、階ごとの件数を出す探しもの（tree は false）
}

type PaperSearch = {
    kind: "papers"
    label: string
    command: string
    oneLine: string
    matches: (entry: SearchEntry) => boolean
}

type TreeSearch = {
    kind: "tree"
    label: string
    command: string
    oneLine: string
}

export type Search = PaperSearch | TreeSearch

// 前後が英字でない位置にあるときだけ当たる（ai-llm・「AIドキュメント検索」は当たり、Tailwind・container は当たらない）
const wordPattern = (word: string): RegExp => new RegExp(`(?<![A-Za-z])${word}(?![A-Za-z])`, "i")

// 見る欄は題名・一行・タグ・分野。分野はスキルの紙の room（ほかの紙の room は分類の slug なので見ない）
function fieldsOf(entry: SearchEntry): string[] {
    const category = entry.level !== undefined && entry.room !== null ? [entry.room] : []
    return [entry.title, entry.excerpt, ...entry.tags, ...category]
}

const wordSearch = (label: string, word: string, oneLine: string): PaperSearch => {
    const pattern = wordPattern(word)
    return {
        kind: "papers",
        label,
        command: `grep -rl ${word} ~`,
        oneLine,
        matches: (entry) => fieldsOf(entry).some((field) => pattern.test(field)),
    }
}

export const SEARCHES: readonly Search[] = [
    wordSearch("AI に関わるもの", "ai", "AI に関わる紙が見つかりました"),
    wordSearch("設計に関わるもの", "architecture", "設計に関わる紙が見つかりました"),
    {
        kind: "papers",
        label: "いちばん得意な技術",
        command: "grep -rl 'level: 5' ~",
        oneLine: "レベル 5（専門）の技術です",
        matches: (entry) => entry.level === 5,
    },
    {
        kind: "tree",
        label: "建物の構成を見る",
        command: "tree -d -L 2 ~",
        oneLine: "階と分類の一覧です",
    },
]

function runPaperSearch(search: PaperSearch, entries: readonly SearchEntry[]): SearchResult {
    const hits = entries
        .filter((entry) => search.matches(entry))
        .map((entry): SearchHit => ({
            path: entry.path,
            floor: entry.floor,
            room: roomIdOf(entry),
        }))
    return {
        label: search.label,
        command: search.command,
        summary: `${hits.length} 件。${search.oneLine}`,
        paths: hits.map((hit) => hit.path),
        hits,
        counted: true,
    }
}

// 屋上から B1 の順に、階ごとに 1 行（分類は空白 2 つで区切る。分類のない階は階のパス）
function runTree(search: TreeSearch): SearchResult {
    const hits = [...FLOORS].reverse().map(
        (floor): SearchHit => ({
            path:
                floor.groups.length === 0
                    ? toVirtualPath(floor.url)
                    : floor.groups.map((group) => toVirtualPath(group.url)).join("  "),
            floor: floor.id,
            room: null,
        })
    )
    return {
        label: search.label,
        command: search.command,
        summary: search.oneLine,
        paths: hits.map((hit) => hit.path),
        hits,
        counted: false,
    }
}

export function runSearches(entries: readonly SearchEntry[]): SearchResult[] {
    return SEARCHES.map((search) => (search.kind === "tree" ? runTree(search) : runPaperSearch(search, entries)))
}

// 階ごとの当たった紙の数（部屋の数ではない）。件数を出さない探しものでは空
export function searchCounts(result: SearchResult): Partial<Record<FloorId, number>> {
    const counts: Partial<Record<FloorId, number>> = {}
    if (!result.counted) return counts
    for (const hit of result.hits) counts[hit.floor] = (counts[hit.floor] ?? 0) + 1
    return counts
}

// 地図で光らせる部屋の id（その階の当たりのある部屋を 1 回ずつ）。件数を出さない探しものでは空
export function litRoomsOn(result: SearchResult, floor: FloorId): string[] {
    if (!result.counted) return []
    const rooms = result.hits.filter((hit) => hit.floor === floor && hit.room !== null).map((hit) => hit.room as string)
    return [...new Set(rooms)]
}
