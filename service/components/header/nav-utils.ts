/**
 * NAV_ITEMS の active 判定。SiteNav / MobileNav 共通。
 * - "/" は完全一致のみ active
 * - それ以外は完全一致または "{href}/..." の prefix を active とみなす
 */
export function isNavItemActive(pathname: string, href: string): boolean {
    if (href === "/") return pathname === "/"
    return pathname === href || pathname.startsWith(href + "/")
}
