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
    description: string // 案内人が屋上の部屋で読む説明（↗ は DoorButton が付けるので書かない）
}

/**
 * 公開する連絡先メールアドレス。
 * 連絡先ページ（/1f/contact）の mailto 経路とエラーの文面から参照する。
 * アドレスを変更する場合はこの 1 箇所だけを更新すること。
 */
export const CONTACT_EMAIL = "satoshi.onga@onc-limb.com"

const X_USERNAME = "@onc_limb"

export const SOCIAL_LINKS: SocialLink[] = [
    {
        name: "GitHub",
        url: "https://github.com/onc-limb",
        username: "@onc-limb",
        note: "ソースコード",
        description: "ソースコードを置いている GitHub へ出ます。",
    },
    {
        name: "Zenn",
        url: "https://zenn.dev/onclimb",
        username: "@onclimb",
        note: "技術記事",
        description: "技術記事を書いている Zenn へ出ます。",
    },
    {
        name: "X (Twitter)",
        url: "https://twitter.com/onc_limb",
        username: X_USERNAME,
        note: "近況",
        description: `X（${X_USERNAME}）へ出ます。`,
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
