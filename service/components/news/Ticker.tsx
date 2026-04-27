/**
 * docs/design/news.html の `.ticker` 横スクロールバー。
 * トレンドカウントは MISSING_FEATURES.md 記載のとおり暫定の固定リスト。
 */
const ITEMS = [
    { emoji: "📈", tag: "react", delta: "+12", up: true },
    { emoji: "⚡️", tag: "bun", delta: "+8", up: true },
    { emoji: "🦀", tag: "rust", delta: "+5", up: true },
    { emoji: "📉", tag: "webpack", delta: "-3", up: false },
    { emoji: "🤖", tag: "llm", delta: "+24", up: true },
    { emoji: "☁️", tag: "cloudflare", delta: "+9", up: true },
    { emoji: "🐳", tag: "kubernetes", delta: "+2", up: true },
    { emoji: "🔐", tag: "oauth2.1", delta: "+11", up: true },
    { emoji: "🟦", tag: "typescript", delta: "+7", up: true },
]

export function Ticker() {
    const doubled = [...ITEMS, ...ITEMS]
    return (
        <div
            className="ticker-wrap my-7 overflow-hidden border-y border-hairline whitespace-nowrap"
            style={{ background: "var(--bg-elev)" }}
        >
            <div className="ticker-track inline-flex gap-12 py-3.5 font-mono text-[13px]">
                {doubled.map((it, i) => (
                    <span
                        key={i}
                        className="inline-flex items-center gap-2.5 text-fg-muted"
                    >
                        {it.emoji}{" "}
                        <b className="font-semibold text-accent">{it.tag}</b>{" "}
                        <span
                            style={{
                                color: it.up ? "#4ADE80" : "var(--rose)",
                            }}
                        >
                            {it.delta}
                        </span>
                    </span>
                ))}
            </div>
        </div>
    )
}
