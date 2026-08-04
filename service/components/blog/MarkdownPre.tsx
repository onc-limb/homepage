"use client"

import type { ComponentPropsWithoutRef } from "react"
import type { ExtraProps } from "react-markdown"
import { MermaidDiagram } from "./MermaidDiagram"

type Props = ComponentPropsWithoutRef<"pre"> & ExtraProps

// react-markdown が渡す hast ノード（ExtraProps["node"]）の要素型
type HastElement = NonNullable<ExtraProps["node"]>

// hast の code 要素から言語クラス（language-xxx）一覧を取り出す
function codeClassNames(codeNode: HastElement): string[] {
    const cls = codeNode.properties?.className
    if (Array.isArray(cls)) return cls.map(String)
    if (typeof cls === "string") return [cls]
    return []
}

// code 要素配下のテキストを連結してソースを復元する
function codeText(codeNode: HastElement): string {
    return codeNode.children
        .map((child) => (child.type === "text" ? child.value : ""))
        .join("")
}

/**
 * react-markdown の pre 要素オーバーライド。
 * ```mermaid ブロックだけ MermaidDiagram で SVG 描画し、
 * それ以外のコードブロックは通常の <pre> のまま表示する。
 */
export function MarkdownPre({ node, children, ...props }: Props) {
    const first = node?.children?.[0]
    if (first?.type === "element" && first.tagName === "code") {
        if (codeClassNames(first).includes("language-mermaid")) {
            return <MermaidDiagram chart={codeText(first).trim()} />
        }
    }
    return <pre {...props}>{children}</pre>
}
