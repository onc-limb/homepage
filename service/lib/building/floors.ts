// 建物の階と分類の定義、URL と仮想パスの変換だけを置くモジュール。
// Client Component から import されうるため、md を読み込むモジュール（skills / profile / portfolio / entries）は
// import しない。中身の一覧は lib/building/entries.ts（サーバー側専用）にある。

export type FloorId = "b1" | "1f" | "2f" | "3f" | "rf"
export type GroupSlug = "studies" | "profile" | "contact" | "histories" | "skills" | "portfolios"

export interface FloorGroup {
    floor: FloorId // この分類が属する階
    slug: GroupSlug
    name: string
    roomName: string | null // 地図の部屋の名前。null は分野ごとに部屋を分ける分類（スキル・自己学習）
    command: string // 見出しに添えるコマンド（`$ ` は付けない）
    url: string // 最終の URL（/<階>/<slug>）
    href: string // 移行中のリンク先（今の URL）
}

export interface Floor {
    id: FloorId
    label: string
    name: string
    url: string
    groups: FloorGroup[]
}

const group = (
    floor: FloorId,
    slug: GroupSlug,
    name: string,
    roomName: string | null,
    command: string,
    href: string,
): FloorGroup => ({ floor, slug, name, roomName, command, url: `/${floor}/${slug}`, href })

export const FLOORS: Floor[] = [
    {
        id: "b1",
        label: "B1",
        name: "自己学習",
        url: "/b1",
        groups: [group("b1", "studies", "自己学習", null, "ls -l ~/b1/studies | sort -k level", "/skills")],
    },
    {
        id: "1f",
        label: "1F",
        name: "プロフィール・連絡先",
        url: "/1f",
        groups: [
            group("1f", "profile", "プロフィール", "プロフィール", "man onclimb", "/profile"),
            group("1f", "contact", "連絡先", "受付・連絡先", "finger onclimb", "/contact"),
        ],
    },
    {
        id: "2f",
        label: "2F",
        name: "経歴・業務の技術",
        url: "/2f",
        groups: [
            group("2f", "histories", "経歴", "経歴", "ls -tr ~/2f/histories", "/profile"),
            group("2f", "skills", "スキル", null, "ls -l ~/2f/skills | sort -k level", "/skills"),
        ],
    },
    {
        id: "3f",
        label: "3F",
        name: "作ったもの・考え",
        url: "/3f",
        groups: [group("3f", "portfolios", "ポートフォリオ", "作ったもの", "git log --oneline ~/3f/portfolios", "/portfolio")],
    },
    {
        id: "rf",
        label: "屋上",
        name: "屋上テラス・外部リンク",
        url: "/rf",
        groups: [],
    },
]

export function findFloor(id: FloorId): Floor {
    const found = FLOORS.find((floor) => floor.id === id)
    if (!found) throw new Error(`Unknown floor: ${id}`)
    return found
}

export function findGroup(slug: GroupSlug): FloorGroup {
    for (const floor of FLOORS) {
        const found = floor.groups.find((g) => g.slug === slug)
        if (found) return found
    }
    throw new Error(`Unknown group: ${slug}`)
}

// "/2f/skills" → "~/2f/skills"
export function toVirtualPath(url: string): string {
    if (!url.startsWith("/")) throw new Error(`Expected a url starting with "/": ${url}`)
    return `~${url}`
}

// "~/2f/skills" → "/2f/skills"
export function toUrl(virtualPath: string): string {
    if (!virtualPath.startsWith("~/")) throw new Error(`Expected a virtual path starting with "~/": ${virtualPath}`)
    return virtualPath.slice(1)
}
