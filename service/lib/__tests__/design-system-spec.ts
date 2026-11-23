import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

/**
 * Reads the token tables of the design system spec (docs/design-system.md at
 * the repository root) so tests compare against the single source of truth
 * instead of re-typing the values.
 */

const here = dirname(fileURLToPath(import.meta.url))
// service/lib/__tests__ -> repository root
export const SPEC_PATH = join(here, "..", "..", "..", "docs", "design-system.md")

export type ColorToken = { name: string; light: string; dark: string }
export type ValueToken = { name: string; value: string }

export function readSpec(): string {
    return readFileSync(SPEC_PATH, "utf8")
}

/** Rows shaped like: | `--ds-x` | role | `#light` | `#dark` | */
export function parseColorTokens(spec: string): ColorToken[] {
    const rowRe =
        /^\|\s*`(--ds-[\w-]+)`\s*\|[^|\n]*\|\s*`(#[0-9a-fA-F]{6})`\s*\|\s*`(#[0-9a-fA-F]{6})`\s*\|\s*$/gm
    const tokens: ColorToken[] = []
    let m: RegExpExecArray | null
    while ((m = rowRe.exec(spec)) !== null) {
        tokens.push({ name: m[1], light: m[2].toLowerCase(), dark: m[3].toLowerCase() })
    }
    return tokens
}

/**
 * Rows of the "文字" / "余白" tables: | `--ds-x` | value | ... |
 * The value cell may wrap a font name in backticks (`M PLUS 1 Code`, monospace).
 */
export function parseValueTokens(spec: string): ValueToken[] {
    const rowRe = /^\|\s*`(--ds-(?:font|text|leading|measure|page|space)[\w-]*)`\s*\|\s*([^|\n]+?)\s*\|/gm
    const tokens: ValueToken[] = []
    let m: RegExpExecArray | null
    while ((m = rowRe.exec(spec)) !== null) {
        tokens.push({ name: m[1], value: m[2] })
    }
    return tokens
}

/** Text colors and backgrounds the contrast contract pairs up. */
export const TEXT_COLOR_TOKENS = [
    "--ds-fg",
    "--ds-fg-muted",
    "--ds-accent",
    "--ds-prompt",
    "--ds-link",
] as const
export const BACKGROUND_COLOR_TOKENS = ["--ds-bg", "--ds-surface", "--ds-map-wood"] as const
