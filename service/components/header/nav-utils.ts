import { floorOfUrl } from "@/lib/building/floors"

/**
 * NAV_ITEMS の active 判定。SiteNav / MobileNav 共通。
 * - "/" は完全一致のみ active
 * - 階の項目は現在のページが同じ階に属するときに active
 */
export function isNavItemActive(pathname: string, href: string): boolean {
    if (href === "/") return pathname === "/"
    const floor = floorOfUrl(pathname)
    return floor !== null && floor === floorOfUrl(href)
}
