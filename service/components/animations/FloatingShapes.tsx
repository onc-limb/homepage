/**
 * docs/design/top.html の `.hero__shapes` を React 化。
 * 6 種類のサイズ・配置・回転を素案準拠で再現。
 */
const SHAPES = [
    {
        className:
            "top-[12%] left-[8%] w-[140px] h-[140px] rotate-12 [animation-delay:-2s]",
        rotate: "12deg",
    },
    {
        className:
            "top-[18%] right-[10%] w-[90px] h-[90px] rounded-full [animation-delay:-8s]",
        rotate: "0deg",
    },
    {
        className:
            "bottom-[14%] left-[14%] w-[60px] h-[60px] rounded-[4px] -rotate-[15deg] [animation-delay:-12s]",
        rotate: "-15deg",
    },
    {
        className:
            "bottom-[22%] right-[18%] w-[110px] h-[110px] rotate-[8deg] [animation-delay:-5s]",
        rotate: "8deg",
    },
    {
        className:
            "top-1/2 left-[4%] w-9 h-9 rounded-full [animation-delay:-15s] !bg-accent-soft",
        rotate: "0deg",
    },
    {
        className:
            "top-[38%] right-[6%] w-[50px] h-[50px] rounded-[4px] rotate-45 [animation-delay:-3s]",
        rotate: "45deg",
    },
]

export function FloatingShapes() {
    return (
        <div
            className="pointer-events-none absolute inset-0 z-0 [perspective:1200px]"
            aria-hidden="true"
        >
            {SHAPES.map((s, i) => (
                <div
                    key={i}
                    className={`shape absolute rounded-[var(--radius-lg)] border border-hairline-strong shadow-card-soft backdrop-blur-[6px] ${s.className}`}
                    style={
                        {
                            // グラデーション廃止・単色化: 線形グラデーションを単色のアクセント面に置換
                            background: "var(--accent-soft)",
                            // CSS animation defined in globals.css uses `--r`
                            ["--r" as never]: s.rotate,
                        } as React.CSSProperties
                    }
                />
            ))}
        </div>
    )
}
