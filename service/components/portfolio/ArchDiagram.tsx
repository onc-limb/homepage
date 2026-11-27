/**
 * ASSUMPTION: 計画レポートの MISSING_FEATURES.md 通り、
 * arch SVG の構造データは現状 schema に無いため `portfolio-site` 専用の
 * SVG をハードコードした。他プロジェクトには表示されない。
 * docs/design/portfolio/onc-limb.html:439-524 を再構成。
 */
import { BOXED_SURFACE } from "@/components/ds/surface-styles"

const SVG_TEXT = "font-ds text-ds-sm"

export function ArchDiagram() {
    return (
        <div className={`overflow-hidden ${BOXED_SURFACE}`}>
            <svg
                viewBox="0 0 900 480"
                preserveAspectRatio="xMidYMid meet"
                className="block h-auto w-full"
                role="img"
                aria-label="onc-limb.com architecture diagram"
            >
                <defs>
                    <marker
                        id="arr"
                        viewBox="0 0 10 10"
                        refX="9"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto"
                    >
                        <path d="M0,0 L10,5 L0,10 z" className="fill-ds-accent" />
                    </marker>
                </defs>

                <ClusterRect x={20} y={20} w={160} h={440} label="USER" />
                <Box x={50} y={200} w={100} h={60} label="User" sub="browser" />

                <ClusterRect x={220} y={20} w={320} h={440} label="CLOUDFLARE EDGE" />
                <Box
                    x={260}
                    y={80}
                    w={240}
                    h={80}
                    label="Cloudflare Workers"
                    sub="OpenNext / Next.js 15 App Router"
                    sub2="RSC · Server Actions · NextAuth"
                    accent
                />
                <Box x={260} y={200} w={110} h={60} label="R2" sub="images / md" />
                <Box x={390} y={200} w={110} h={60} label="KV Cache" sub="ISR cache" />
                <Box
                    x={260}
                    y={320}
                    w={240}
                    h={80}
                    label="Cloudflare D1"
                    sub="SQLite · Drizzle ORM"
                    sub2="books · notes · views"
                    accent
                />

                <ClusterRect x={580} y={20} w={300} h={240} label="EXTERNAL" />
                <Box
                    x={620}
                    y={80}
                    w={220}
                    h={60}
                    label="OpenAI / Anthropic"
                    sub="news summary"
                />
                <Box
                    x={620}
                    y={170}
                    w={220}
                    h={60}
                    label="RSS / GitHub Trending"
                    sub="scheduled fetch"
                />

                <ClusterRect x={580} y={280} w={300} h={180} label="CI / CD" />
                <Box
                    x={620}
                    y={330}
                    w={220}
                    h={60}
                    label="GitHub Actions"
                    sub="Wrangler deploy"
                />
                <Box x={620} y={400} w={220} h={40} label="GitHub Repo (main)" />

                <path
                    d="M 150 220 C 200 220, 220 120, 260 120"
                    className="stroke-ds-accent"
                    strokeWidth={1}
                    fill="none"
                    markerEnd="url(#arr)"
                    strokeDasharray="5 5"
                />
                <ArrowLabel x={170} y={155}>HTTPS</ArrowLabel>

                <path
                    d="M 320 160 L 315 200"
                    className="stroke-ds-accent"
                    strokeWidth={1}
                    fill="none"
                    markerEnd="url(#arr)"
                />
                <path
                    d="M 440 160 L 445 200"
                    className="stroke-ds-accent"
                    strokeWidth={1}
                    fill="none"
                    markerEnd="url(#arr)"
                />

                <path
                    d="M 380 260 L 380 320"
                    className="stroke-ds-accent"
                    strokeWidth={1}
                    fill="none"
                    markerEnd="url(#arr)"
                    strokeDasharray="4 3"
                />
                <ArrowLabel x={390} y={295}>SQL</ArrowLabel>

                <path
                    d="M 500 110 L 620 110"
                    className="stroke-ds-accent"
                    strokeWidth={1}
                    fill="none"
                    markerEnd="url(#arr)"
                />
                <ArrowLabel x={525} y={100}>fetch</ArrowLabel>

                <path
                    d="M 620 200 L 500 140"
                    className="stroke-ds-fg-muted"
                    strokeWidth={1}
                    fill="none"
                    markerEnd="url(#arr)"
                />
                <ArrowLabel x={525} y={170}>cron</ArrowLabel>

                <path
                    d="M 620 360 C 540 360, 540 130, 500 130"
                    className="stroke-ds-fg-muted"
                    strokeWidth={1}
                    fill="none"
                    markerEnd="url(#arr)"
                />
                <ArrowLabel x={540} y={252}>deploy</ArrowLabel>

                <path
                    d="M 730 400 L 730 390"
                    className="stroke-ds-fg-muted"
                    strokeWidth={1}
                    fill="none"
                    markerEnd="url(#arr)"
                />
            </svg>

            <div className="mt-ds-3 flex flex-wrap gap-ds-3 font-ds text-ds-sm text-ds-fg-muted">
                <Legend swatch="border-ds-accent">Core compute</Legend>
                <Legend swatch="border-ds-border-strong">Storage / external</Legend>
                <Legend line="border-t border-dashed border-ds-accent">request flow</Legend>
                <Legend line="border-t border-ds-fg-muted">scheduled / deploy</Legend>
            </div>
        </div>
    )
}

function ClusterRect({
    x,
    y,
    w,
    h,
    label,
}: {
    x: number
    y: number
    w: number
    h: number
    label: string
}) {
    return (
        <>
            <rect
                x={x}
                y={y}
                width={w}
                height={h}
                fill="none"
                className="stroke-ds-border"
                strokeWidth={1}
                strokeDasharray="4 3"
            />
            <text
                x={x + 20}
                y={y + 22}
                className={`${SVG_TEXT} fill-ds-fg-muted`}
            >
                {label}
            </text>
        </>
    )
}

function Box({
    x,
    y,
    w,
    h,
    label,
    sub,
    sub2,
    accent = false,
}: {
    x: number
    y: number
    w: number
    h: number
    label: string
    sub?: string
    sub2?: string
    accent?: boolean
}) {
    return (
        <>
            <rect
                x={x}
                y={y}
                width={w}
                height={h}
                className={`fill-ds-bg ${accent ? "stroke-ds-accent" : "stroke-ds-border-strong"}`}
                strokeWidth={1}
            />
            <text
                x={x + w / 2}
                y={y + (sub ? (sub2 ? 28 : 25) : h / 2 + 5)}
                textAnchor="middle"
                className={`${SVG_TEXT} font-bold fill-ds-fg`}
            >
                {label}
            </text>
            {sub && (
                <text
                    x={x + w / 2}
                    y={y + 45}
                    textAnchor="middle"
                    className={`${SVG_TEXT} fill-ds-fg-muted`}
                >
                    {sub}
                </text>
            )}
            {sub2 && (
                <text
                    x={x + w / 2}
                    y={y + 63}
                    textAnchor="middle"
                    className={`${SVG_TEXT} fill-ds-fg-muted`}
                >
                    {sub2}
                </text>
            )}
        </>
    )
}

function ArrowLabel({
    x,
    y,
    children,
}: {
    x: number
    y: number
    children: React.ReactNode
}) {
    return (
        <text
            x={x}
            y={y}
            className={`${SVG_TEXT} fill-ds-fg-muted`}
        >
            {children}
        </text>
    )
}

function Legend({
    swatch,
    line,
    children,
}: {
    /** Border color class of a filled sample box. */
    swatch?: string
    /** Border classes of a line sample. */
    line?: string
    children: React.ReactNode
}) {
    return (
        <div className="flex items-center gap-ds-2">
            {swatch ? (
                <span className={`block h-ds-2 w-ds-3 border bg-ds-bg ${swatch}`} />
            ) : (
                <span className={`block h-0 w-ds-3 ${line}`} />
            )}
            {children}
        </div>
    )
}
