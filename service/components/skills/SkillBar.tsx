import type { Skill } from "@/lib/skills-meta"

// グラデーション廃止・単色化: レベル別のバー色を線形グラデーションから単色へ置換。
// 色はすべて既存テーマ機構（globals.css のトークン）で定義し、コンポーネント内に
// ハードコード HEX を持たない。レベル 5 の緑は skills ページの LEVEL_LEGEND
// （「5 — 専門」）と一致させるため専用トークン --level-expert を参照する。
const LEVEL_COLOR: Record<number, string> = {
    5: "var(--level-expert)",
    4: "var(--accent)",
    3: "var(--rose)",
    2: "var(--amber)",
    1: "var(--amber)",
}

export function SkillBar({ skill }: { skill: Skill }) {
    const ratio = skill.level / 5
    return (
        <div
            data-level={skill.level}
            className="cursor-pointer rounded-[var(--radius)] border border-hairline bg-bg-elev px-4 py-3.5 transition-all duration-200 hover:translate-x-1 hover:border-accent"
        >
            <div className="mb-2.5 flex items-center justify-between gap-3">
                <span className="text-[14.5px] font-medium text-fg-strong">
                    {skill.name}
                </span>
                <span className="font-mono text-[11px] text-fg-muted">
                    {skill.level}/5
                </span>
            </div>
            <div
                className="relative h-1 overflow-hidden rounded-full"
                style={{ background: "var(--hairline)" }}
            >
                <div
                    className="h-full rounded-full"
                    style={{
                        background: LEVEL_COLOR[skill.level],
                        width: `${ratio * 100}%`,
                    }}
                />
            </div>
            {skill.relatedTech.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                    {skill.relatedTech.map((tech) => (
                        <span
                            key={tech}
                            className="rounded-[3px] border border-hairline px-1.5 py-0.5 font-mono text-[10px] text-fg-muted"
                        >
                            {tech}
                        </span>
                    ))}
                </div>
            )}
        </div>
    )
}
