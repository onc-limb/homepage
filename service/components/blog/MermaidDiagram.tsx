"use client"

import { useEffect, useId, useState, useSyncExternalStore } from "react"

type Props = { chart: string }

// サイトのテーマ（:root[data-theme]）に合わせて mermaid のテーマを選ぶ。
function currentMermaidTheme(): "dark" | "neutral" {
    return document.documentElement.dataset.theme === "dark" ? "dark" : "neutral"
}

// data-theme の切替を購読する（useSyncExternalStore 用）
function subscribeToTheme(callback: () => void): () => void {
    const observer = new MutationObserver(callback)
    observer.observe(document.documentElement, { attributeFilter: ["data-theme"] })
    return () => observer.disconnect()
}

function getServerThemeSnapshot(): "dark" | "neutral" {
    return "neutral"
}

/**
 * ```mermaid コードブロックを SVG に描画するクライアントコンポーネント。
 * mermaid は重い（数 MB）ため動的 import とし、図を含むページを開いたときだけ読み込む。
 * テーマ切替（data-theme の変更）にも追従して再描画する。
 */
export function MermaidDiagram({ chart }: Props) {
    // mermaid.render の要素 id は英数字のみ許容されるため useId の記号を除去する
    const id = useId().replace(/[^a-zA-Z0-9]/g, "")
    const [svg, setSvg] = useState<string | null>(null)
    const [failed, setFailed] = useState(false)
    const theme = useSyncExternalStore(
        subscribeToTheme,
        currentMermaidTheme,
        getServerThemeSnapshot,
    )

    useEffect(() => {
        let cancelled = false
        import("mermaid")
            .then(async ({ default: mermaid }) => {
                mermaid.initialize({ startOnLoad: false, securityLevel: "strict", theme })
                const rendered = await mermaid.render(`mermaid-${id}-${theme}`, chart)
                if (!cancelled) setSvg(rendered.svg)
            })
            .catch(() => {
                if (!cancelled) setFailed(true)
            })
        return () => {
            cancelled = true
        }
    }, [chart, id, theme])

    // 構文エラー等で描画できないときは元のコードブロック表示に戻す
    if (failed) {
        return (
            <pre>
                <code>{chart}</code>
            </pre>
        )
    }

    if (!svg) {
        return (
            <div
                data-testid="mermaid-loading"
                className="my-6 rounded-[3px] border border-hairline px-4 py-8 text-center font-mono text-[11px] text-fg-dim"
            >
                diagram loading…
            </div>
        )
    }

    return (
        <div
            className="not-prose my-6 flex justify-center overflow-x-auto [&_svg]:h-auto [&_svg]:max-w-full"
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    )
}
