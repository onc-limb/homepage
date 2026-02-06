/**
 * サイト全体で使用するナビゲーション項目の定義
 */
export interface NavItem {
    href: string
    label: string
    description: string
}
/**
 * メインナビゲーション項目
 */
export const NAV_ITEMS: NavItem[] = [
    {
        href: "/profile",
        label: "Profile",
        description: "経歴・価値観",
    },
    {
        href: "/skills",
        label: "Skills",
        description: "技術スタック",
    },
    {
        href: "/portfolio",
        label: "Portfolio",
        description: "制作実績",
    },
    {
        href: "/books",
        label: "Books",
        description: "読んだ書籍の一覧",
    },
    {
        href: "/news",
        label: "News",
        description: "技術ニュース",
    },
    {
        href: "/social",
        label: "Social",
        description: "各種リンク",
    },
]
