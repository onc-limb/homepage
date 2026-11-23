import type { NavItem, SocialLink } from "@/lib/constants"
import type { HomeStats } from "@/lib/stats"

/** SOCIAL_LINKS に、指定した名前のリンクが存在しないことを表す。 */
export class SocialLinkNotFoundError extends Error {
    constructor(readonly linkName: string) {
        super(`SOCIAL_LINKS must include a ${linkName} entry`)
        this.name = "SocialLinkNotFoundError"
    }
}

export function findSocialLinkUrl(links: readonly SocialLink[], name: string): string {
    const link = links.find((l) => l.name === name)
    if (!link) {
        throw new SocialLinkNotFoundError(name)
    }
    return link.url
}

// Explore は「深掘りする読み物を選ぶ」セクションなので、Home と、
// 場所ではなく行動導線である Contact を除く（Contact はヒーローと CTA バンドで拾う）。
export function selectExploreItems(navItems: readonly NavItem[]): NavItem[] {
    return navItems.filter((n) => n.href !== "/" && n.href !== "/contact")
}

export type HomeStatItem = { value: string; label: string }

/** トップ STATS 4 枠の表示行。読了書籍・公開記事・使用タグ・全書籍の順。 */
export function toHomeStatItems(stats: HomeStats): HomeStatItem[] {
    const entries: Array<[number, string]> = [
        [stats.readBooksCount, "books read"],
        [stats.publishedArticlesCount, "articles published"],
        [stats.usedTagCount, "topics covered"],
        [stats.totalBooksCount, "books logged"],
    ]
    return entries.map(([value, label]) => ({ value: String(value), label }))
}
