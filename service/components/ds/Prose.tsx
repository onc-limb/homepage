import type { ComponentPropsWithoutRef } from "react"
import ReactMarkdown, { type Components, type ExtraProps } from "react-markdown"
import remarkGfm from "remark-gfm"

import { CodeBlock } from "./CodeBlock"
import { HashHeading } from "./HashHeading"
import { HEADING_MAJOR, HEADING_MINOR } from "./heading-styles"
import { PROSE_BODY, PROSE_LIST } from "./prose-styles"
import { BOXED_SURFACE } from "./surface-styles"
import { TABLE, TABLE_SCROLL, TD, TH } from "./table-styles"

type HastElement = NonNullable<ExtraProps["node"]>

// Concatenates the text children of the `code` element inside a fenced block.
function codeText(node: HastElement | undefined): string {
    const first = node?.children[0]
    if (first?.type !== "element" || first.tagName !== "code") return ""
    return first.children
        .map((child) => (child.type === "text" ? child.value : ""))
        .join("")
        .replace(/\n$/, "")
}

// `node` is dropped so it never reaches the DOM element.
function tag<T extends "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "ul" | "ol" | "blockquote" | "a" | "hr" | "th" | "td">(
    Tag: T,
    className: string
) {
    return function Styled({ node: _node, ...props }: ComponentPropsWithoutRef<T> & ExtraProps) {
        const Element = Tag as "div"
        return <Element {...(props as ComponentPropsWithoutRef<"div">)} className={className} />
    }
}

// h2-h4 carry the muted `#` marker (`#`, `##`, `###`), like the headings the
// pages write around the text, so the nesting shows and the page reads as one.
function hashHeading(level: 2 | 3 | 4) {
    return function Heading({ children }: ComponentPropsWithoutRef<"h2"> & ExtraProps) {
        return <HashHeading level={level}>{children}</HashHeading>
    }
}

const COMPONENTS: Components = {
    h1: tag("h1", HEADING_MAJOR),
    h2: hashHeading(2),
    h3: hashHeading(3),
    h4: hashHeading(4),
    h5: tag("h5", HEADING_MINOR),
    h6: tag("h6", HEADING_MINOR),
    ul: tag("ul", PROSE_LIST),
    ol: tag("ol", "list-decimal pl-ds-4"),
    blockquote: tag("blockquote", BOXED_SURFACE),
    a: tag("a", "text-ds-link underline"),
    hr: tag("hr", "border-ds-border"),
    th: tag("th", TH),
    td: tag("td", TD),
    table: ({ node: _node, ...props }) => (
        <div className={TABLE_SCROLL}>
            <table {...props} className={TABLE} />
        </div>
    ),
    pre: ({ node }) => <CodeBlock code={codeText(node)} />,
    code: ({ node: _node, ...props }) => (
        <code {...props} className="border border-ds-border bg-ds-surface px-ds-1 font-ds text-ds-sm" />
    ),
}

type ProseProps = {
    markdown: string
}

/** Renders Markdown with ds tokens. Raw HTML in the text is not rendered (no rehype-raw). */
export function Prose({ markdown }: ProseProps) {
    return (
        <div className={PROSE_BODY}>
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={COMPONENTS}>
                {markdown}
            </ReactMarkdown>
        </div>
    )
}
