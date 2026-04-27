import type { Skill } from "@/lib/skills"

const LEVEL_GRADIENT: Record<number, string> = {
    5: "linear-gradient(90deg, #4ADE80, #22C55E)",
    4: "linear-gradient(90deg, var(--accent), var(--cyan))",
    3: "linear-gradient(90deg, var(--rose), var(--accent))",
    2: "linear-gradient(90deg, var(--amber), var(--rose))",
    1: "linear-gradient(90deg, var(--amber), var(--amber))",
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
                        background: LEVEL_GRADIENT[skill.level],
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
