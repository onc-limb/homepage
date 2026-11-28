// 建物の階と分類の定義、URL と仮想パスの変換だけを置くモジュール。
// Client Component から import されうるため、md を読み込むモジュール（skills / profile / portfolio / entries）は
// import しない。中身の一覧は lib/building/entries.ts（サーバー側専用）にある。

export type FloorId = "b1" | "1f" | "2f" | "3f" | "rf"
export type GroupSlug = "studies" | "profile" | "contact" | "histories" | "skills" | "portfolios"
export type FloorMaterial = "wood" | "stone" | "deck"

export interface FloorGroup {
    floor: FloorId // この分類が属する階
    slug: GroupSlug
    name: string
    roomName: string | null // 地図の部屋の名前。null は分野ごとに部屋を分ける分類（スキル・自己学習）
    roomDescription: string | null // 案内人が読む部屋の説明。roomName が null の分類は持たない（分野の部屋は案内人が組み立てる）
    note: string | null
    command: string // 見出しに添えるコマンド（`$ ` は付けない）
    url: string // 最終の URL（/<階>/<slug>）
    href: string // 移行中のリンク先（今の URL）
}

export interface Floor {
    id: FloorId
    label: string
    name: string
    navName: string
    url: string
    material: FloorMaterial
    description: string // 案内人が読む階の説明
    groups: FloorGroup[]
}

const group = (
    floor: FloorId,
    slug: GroupSlug,
    name: string,
    roomName: string | null,
    roomDescription: string | null,
    note: string | null,
    command: string,
    href?: string,
): FloorGroup => {
    const url = `/${floor}/${slug}`
    return { floor, slug, name, roomName, roomDescription, note, command, url, href: href ?? url }
}

export const FLOORS: Floor[] = [
    {
        id: "b1",
        label: "B1",
        name: "自己学習",
        navName: "自己学習",
        url: "/b1",
        material: "stone",
        description: "関心を持って、個人開発や勉強で身につけた技術の階です。",
        groups: [group("b1", "studies", "自己学習", null, null, null, "ls -l ~/b1/studies | sort -k level")],
    },
    {
        id: "1f",
        label: "1F",
        name: "プロフィール・連絡先",
        navName: "プロフィール",
        url: "/1f",
        material: "wood",
        description: "入口のある階です。自己紹介と、連絡先があります。",
        groups: [
            group(
                "1f",
                "profile",
                "プロフィール",
                "プロフィール",
                "自己紹介と、変わらず持ち続けている関心、取得した資格です。",
                "自己紹介・関心・資格",
                "man onclimb",
            ),
            group(
                "1f",
                "contact",
                "連絡先",
                "受付・連絡先",
                "お仕事のご相談、技術的なご相談・壁打ちを受け付けています。帰る前に、ここで用件を伝えられます。",
                "フォーム・メール",
                "finger onclimb",
            ),
        ],
    },
    {
        id: "2f",
        label: "2F",
        name: "経歴・業務の技術",
        navName: "経歴・技術",
        url: "/2f",
        material: "wood",
        description: "実際に仕事で行ってきたことと、そこで使ってきた技術の階です。",
        groups: [
            group(
                "2f",
                "histories",
                "経歴",
                "経歴",
                "組み込みから Web、機械学習、AI まで。関わってきた仕事を古い順に置いてあります。",
                null,
                "ls -tr ~/2f/histories",
            ),
            group("2f", "skills", "スキル", null, null, null, "ls -l ~/2f/skills | sort -k level"),
        ],
    },
    {
        id: "3f",
        label: "3F",
        name: "作ったもの・考え",
        navName: "作品・考え",
        url: "/3f",
        material: "wood",
        description: "事実というより、考え方や思想に近いものを置いた階です。",
        groups: [
            group(
                "3f",
                "portfolios",
                "ポートフォリオ",
                "作ったもの",
                "個人で設計・開発・運用しているプロダクトです。",
                null,
                "git log --oneline ~/3f/portfolios",
            ),
        ],
    },
    {
        id: "rf",
        label: "屋上",
        name: "屋上テラス・外部リンク",
        navName: "リンク",
        url: "/rf",
        material: "deck",
        description: "屋上です。ここから外のサイトへ出られます。",
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

function matchesPath(url: string, base: string): boolean {
    return url === base || url.startsWith(base + "/")
}

function resolveFloorUrl(url: string): { floor: FloorId | null; promptPath: string } {
    if (url === "/") return { floor: null, promptPath: "~" }
    const promptPath = toVirtualPath(url)

    const floor = FLOORS.find((floor) => matchesPath(url, floor.url))
    if (floor) return { floor: floor.id, promptPath }

    const groups = FLOORS.flatMap((floor) => floor.groups).filter((group) => matchesPath(url, group.href))
    if (groups.length === 0) return { floor: null, promptPath }
    if (groups.length > 1) throw new Error(`Ambiguous floor for URL: ${url}`)
    const group = groups[0]

    return {
        floor: group.floor,
        promptPath: toVirtualPath(group.url) + url.slice(group.href.length),
    }
}

export function floorOfUrl(url: string): FloorId | null {
    return resolveFloorUrl(url).floor
}

export function toPromptPath(url: string): string {
    return resolveFloorUrl(url).promptPath
}
