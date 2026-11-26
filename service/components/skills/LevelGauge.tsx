import { levelGauge, type SkillLevel } from "@/lib/skills-meta"

/** The level as 5 marks: filled in the accent color, the rest in the border color. */
export function LevelGauge({ level }: { level: SkillLevel }) {
    const gauge = levelGauge(level)
    return (
        <>
            <span className="text-ds-accent">{gauge.filled}</span>
            {gauge.empty ? <span className="text-ds-border">{gauge.empty}</span> : null}
        </>
    )
}
