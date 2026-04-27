import type { RadarAxis } from "@/lib/skills"

interface RadarChartProps {
    axes: RadarAxis[]
    radius?: number
}

/**
 * docs/design/skill.html の SVG レーダーチャートを SSR で再現。
 * - viewBox -200 -200 400 400, 半径 R = 160
 * - 5 段の grid ring + 軸線 + 軸ラベル + polygon + dots
 */
export function RadarChart({ axes, radius = 160 }: RadarChartProps) {
    const N = axes.length || 1
    const point = (i: number, r: number) => {
        const a = -Math.PI / 2 + (i / N) * Math.PI * 2
        return [Math.cos(a) * r, Math.sin(a) * r] as const
    }

    const rings: string[] = []
    for (let level = 1; level <= 5; level++) {
        const r = (radius * level) / 5
        let d = ""
        for (let i = 0; i < N; i++) {
            const [x, y] = point(i, r)
            d += (i === 0 ? "M" : "L") + x.toFixed(1) + "," + y.toFixed(1)
        }
        d += "Z"
        rings.push(d)
    }

    let polyD = ""
    axes.forEach((a, i) => {
        const [x, y] = point(i, (radius * a.value) / 5)
        polyD += (i === 0 ? "M" : "L") + x.toFixed(1) + "," + y.toFixed(1)
    })
    polyD += "Z"

    return (
        <svg
            viewBox="-200 -200 400 400"
            className="h-full w-full overflow-visible"
            role="img"
            aria-label="Skills radar chart"
        >
            {rings.map((d, i) => (
                <path
                    key={i}
                    d={d}
                    fill="none"
                    stroke="var(--hairline-strong)"
                />
            ))}
            {axes.map((a, i) => {
                const [x, y] = point(i, radius)
                const [lx, ly] = point(i, radius + 28)
                return (
                    <g key={a.key}>
                        <line
                            x1={0}
                            y1={0}
                            x2={x.toFixed(1)}
                            y2={y.toFixed(1)}
                            stroke="var(--hairline)"
                        />
                        <text
                            x={lx.toFixed(1)}
                            y={ly.toFixed(1)}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontFamily="var(--font-mono)"
                            fontSize="11"
                            fill="var(--fg-muted)"
                            letterSpacing="0.06em"
                        >
                            {a.label.toUpperCase()}
                        </text>
                    </g>
                )
            })}
            <path
                d={polyD}
                fill="var(--accent-soft)"
                stroke="var(--accent)"
                strokeWidth={2}
            />
            {axes.map((a, i) => {
                const [x, y] = point(i, (radius * a.value) / 5)
                return (
                    <circle
                        key={`dot-${a.key}`}
                        cx={x.toFixed(1)}
                        cy={y.toFixed(1)}
                        r={5}
                        fill="var(--bg)"
                        stroke="var(--accent)"
                        strokeWidth={2}
                    >
                        <title>{`${a.label} ${a.value.toFixed(1)}/5`}</title>
                    </circle>
                )
            })}
        </svg>
    )
}
