import { FLOORS } from "./building/floors"

/**
 * サイト全体で使用するナビゲーション項目の定義。
 * ヘッダー・フッター・トップの一覧で共有する。
 */
export interface NavItem {
    href: string
    label: string
    description: string
}

/**
 * 外部 SNS / プロフィールリンクの正準定義。
 * Footer / 屋上（/rf）の扉・プロフィールから参照する。
 * URL を変更する場合はこの 1 箇所だけを更新すること。
 */
export interface SocialLink {
    name: string
    url: string
    username: string
    note: string
}

/**
 * 公開する連絡先メールアドレス。
 * 連絡先ページ（/1f/contact）の mailto 経路とエラーの文面から参照する。
 * アドレスを変更する場合はこの 1 箇所だけを更新すること。
 */
export const CONTACT_EMAIL = "satoshi.onga@onc-limb.com"

export const SOCIAL_LINKS: SocialLink[] = [
    {
        name: "GitHub",
        url: "https://github.com/onc-limb",
        username: "@onc-limb",
        note: "ソースコード",
    },
    {
        name: "Zenn",
        url: "https://zenn.dev/onclimb",
        username: "@onclimb",
        note: "技術記事",
    },
    {
        name: "X (Twitter)",
        url: "https://twitter.com/onc_limb",
        username: "@onc_limb",
        note: "近況",
    },
]

export const NAV_ITEMS: NavItem[] = [
    {
        href: "/",
        label: "案内",
        description: "案内所",
    },
    ...FLOORS.map((floor) => ({
        href: floor.url,
        label: `${floor.label} ${floor.navName}`,
        description: floor.name,
    })),
]
