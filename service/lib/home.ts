import type { SocialLink } from "./constants"
import type { HomeStats } from "./stats"

/** トップ STATS の 1 枠。 */
export type HomeStatItem = {
    value: string
    sup: string
    label: string
}

// STATS 4 枠の並び順とラベル。
const HOME_STAT_LABELS: ReadonlyArray<readonly [keyof HomeStats, string]> = [
    ["readBooksCount", "books read"],
    ["publishedArticlesCount", "articles published"],
    ["usedTagCount", "topics covered"],
    ["totalBooksCount", "books logged"],
]

/** 集計値を、表示順に並んだ STATS の枠へ変換する。 */
export function toHomeStatItems(stats: HomeStats): HomeStatItem[] {
    return HOME_STAT_LABELS.map(([key, label]) => ({
        value: String(stats[key]),
        sup: "",
        label,
    }))
}

/** 必要なリンクが SOCIAL_LINKS に含まれていないことを表すエラー。 */
export class SocialLinkNotFoundError extends Error {
    readonly linkName: string

    constructor(linkName: string) {
        super(`SOCIAL_LINKS must include a ${linkName} entry`)
        this.name = "SocialLinkNotFoundError"
        this.linkName = linkName
    }
}

/** 名前が一致するリンクを返す。見つからなければ SocialLinkNotFoundError を投げる。 */
export function findSocialLink(links: readonly SocialLink[], name: string): SocialLink {
    const link = links.find((l) => l.name === name)
    if (!link) {
        throw new SocialLinkNotFoundError(name)
    }
    return link
}
