// Shared by Prose, Section and HashHeading so ds headings keep one type scale.
// Each carries `text-ds-fg` explicitly: the legacy base CSS still colours
// h1-h4 with `--fg-strong`, so a heading without a colour class leaks it.
export const HEADING_MAJOR = "font-ds text-ds-lg font-bold text-ds-fg"
export const HEADING_MINOR = "font-ds text-ds-base font-bold text-ds-fg"
