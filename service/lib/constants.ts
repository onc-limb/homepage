/**
 * サイト全体で使用するナビゲーション項目の定義。
 * docs/design/shared/shell.js の NAV 配列順序に従う。
 */
export interface NavItem {
    href: string
    label: string
    description: string
}

/**
 * 外部 SNS / プロフィールリンクの正準定義。
 * Footer "Find me" / Social ページ / Top の CTA バンドから参照する。
 * URL を変更する場合はこの 1 箇所だけを更新すること。
 */
export interface SocialLink {
    name: string
    url: string
    username: string
}

/**
 * 公開する連絡先メールアドレス。
 * コンタクトページの mailto 経路とトップの導線から参照する。
 * アドレスを変更する場合はこの 1 箇所だけを更新すること。
 */
export const CONTACT_EMAIL = "satoshi-onga@onc-limb.com"

export const SOCIAL_LINKS: SocialLink[] = [
    {
        name: "GitHub",
        url: "https://github.com/onc-limb",
        username: "@onc-limb",
    },
    {
        name: "Zenn",
        url: "https://zenn.dev/onclimb",
        username: "@onclimb",
    },
    {
        name: "X (Twitter)",
        url: "https://twitter.com/onc_limb",
        username: "@onc_limb",
    },
]

export const NAV_ITEMS: NavItem[] = [
    {
        href: "/",
        label: "Home",
        description: "トップページ",
    },
    {
        href: "/profile",
        label: "Profile",
        description: "経歴と価値観、エンジニアとしての今",
    },
    {
        href: "/skills",
        label: "Skills",
        description: "技術スタックと習熟度を可視化",
    },
    {
        href: "/portfolio",
        label: "Portfolio",
        description: "制作したアプリケーションとプロジェクト",
    },
    {
        href: "/books",
        label: "Books",
        description: "読書記録、知識を線でつなぐ",
    },
    {
        href: "/blog",
        label: "Blog",
        description: "技術記事、学んだことを言葉にして残す",
    },
]
