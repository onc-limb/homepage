/**
 * Display data for /design. The values mirror docs/design-system.md §3 and
 * app/globals.css; lib/__tests__/ds-tokens.test.ts and app/design/page.test.tsx
 * compare them against the spec so they cannot drift.
 *
 * Utility classes are written out as literals (not built from the token name)
 * so Tailwind's content scan can see them.
 */

export type DesignTheme = "light" | "dark"

export type ColorTokenView = {
    name: string
    role: string
    light: string
    dark: string
    swatch: string
}

export const COLOR_TOKENS: readonly ColorTokenView[] = [
    { name: "--ds-bg", role: "ページの地", light: "#e6efcf", dark: "#12241a", swatch: "bg-ds-bg" },
    { name: "--ds-surface", role: "枠の中の地", light: "#f6f9ea", dark: "#1a3125", swatch: "bg-ds-surface" },
    { name: "--ds-fg", role: "文字", light: "#1e2a1a", dark: "#e9ecdd", swatch: "bg-ds-fg" },
    { name: "--ds-fg-muted", role: "控えめな文字（コマンド・補足）", light: "#4c5c40", dark: "#a6b59b", swatch: "bg-ds-fg-muted" },
    { name: "--ds-border", role: "罫線", light: "#c2cfa5", dark: "#30503b", swatch: "bg-ds-border" },
    { name: "--ds-border-strong", role: "濃い罫線（のぞき窓の階の枠など）", light: "#a3b383", dark: "#46664f", swatch: "bg-ds-border-strong" },
    { name: "--ds-accent", role: "現在地・光る部屋・主なボタンの枠", light: "#8a4a06", dark: "#f5b95c", swatch: "bg-ds-accent" },
    { name: "--ds-on-accent", role: "accent の地に載せる文字", light: "#ffffff", dark: "#12241a", swatch: "bg-ds-on-accent" },
    { name: "--ds-prompt", role: "プロンプトの `guest@onclimb` と「選んでいる部屋」", light: "#1d6a33", dark: "#8fd6a2", swatch: "bg-ds-prompt" },
    { name: "--ds-link", role: "リンクとパス（リンクは下線付き）", light: "#1c4c9c", dark: "#a6caff", swatch: "bg-ds-link" },
    { name: "--ds-map-wood", role: "木の床（1F〜3F）・扉の板", light: "#f3e2c0", dark: "#3b2f21", swatch: "bg-ds-map-wood" },
    { name: "--ds-map-wood-joint", role: "木の床の目地", light: "#dcc497", dark: "#4c3d2a", swatch: "bg-ds-map-wood-joint" },
    { name: "--ds-map-wood-wall", role: "木の壁・扉の枠", light: "#b98b56", dark: "#7d5c37", swatch: "bg-ds-map-wood-wall" },
    { name: "--ds-map-wood-shade", role: "外観の木の壁の陰の面", light: "#96703f", dark: "#5d4428", swatch: "bg-ds-map-wood-shade" },
    { name: "--ds-map-stone", role: "石の床（B1）", light: "#dddccf", dark: "#2b332d", swatch: "bg-ds-map-stone" },
    { name: "--ds-map-stone-joint", role: "石の床の目地", light: "#c5c3b3", dark: "#3a433c", swatch: "bg-ds-map-stone-joint" },
    { name: "--ds-map-stone-wall", role: "石の壁", light: "#9d9a8b", dark: "#59635c", swatch: "bg-ds-map-stone-wall" },
    { name: "--ds-map-stone-shade", role: "外観の石の壁の陰の面", light: "#807d70", dark: "#454e48", swatch: "bg-ds-map-stone-shade" },
    { name: "--ds-map-deck", role: "板張りのテラス（屋上・デッキ）", light: "#ead3a2", dark: "#43351f", swatch: "bg-ds-map-deck" },
    { name: "--ds-map-deck-joint", role: "テラスの目地", light: "#cfb57e", dark: "#57452b", swatch: "bg-ds-map-deck-joint" },
    { name: "--ds-map-corridor", role: "廊下", light: "#e9dcbe", dark: "#32281b", swatch: "bg-ds-map-corridor" },
    { name: "--ds-map-lit", role: "光る部屋の地・外観の窓", light: "#f9d893", dark: "#4f3c1b", swatch: "bg-ds-map-lit" },
    { name: "--ds-map-slab", role: "床板の厚み（側面）", light: "#7c5c36", dark: "#241a0f", swatch: "bg-ds-map-slab" },
    { name: "--ds-map-tree-1", role: "まわりの木（濃い方）", light: "#4f7f3a", dark: "#1d4a32", swatch: "bg-ds-map-tree-1" },
    { name: "--ds-map-tree-2", role: "まわりの木（明るい方）", light: "#6c9f4c", dark: "#2a6444", swatch: "bg-ds-map-tree-2" },
    { name: "--ds-map-trunk", role: "木の幹", light: "#7a5a36", dark: "#4b3824", swatch: "bg-ds-map-trunk" },
    { name: "--ds-map-hill", role: "遠くの山の稜線", light: "#d3e2b3", dark: "#182f22", swatch: "bg-ds-map-hill" },
]

export type TextTokenView = { name: string; value: string; utility: string }

export const TEXT_TOKENS: readonly TextTokenView[] = [
    { name: "--ds-text-sm", value: "0.875rem", utility: "text-ds-sm" },
    { name: "--ds-text-base", value: "1rem", utility: "text-ds-base" },
    { name: "--ds-text-lg", value: "1.25rem", utility: "text-ds-lg" },
    { name: "--ds-text-xl", value: "1.75rem", utility: "text-ds-xl" },
]

export type SpaceTokenView = { name: string; value: string; utility: string }

export const SPACE_TOKENS: readonly SpaceTokenView[] = [
    { name: "--ds-space-1", value: "4px", utility: "w-ds-1" },
    { name: "--ds-space-2", value: "8px", utility: "w-ds-2" },
    { name: "--ds-space-3", value: "16px", utility: "w-ds-3" },
    { name: "--ds-space-4", value: "24px", utility: "w-ds-4" },
    { name: "--ds-space-5", value: "48px", utility: "w-ds-5" },
]
