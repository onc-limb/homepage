import { levelGauge, type SkillLevel } from "@/lib/skills-meta"

/**
 * The level as 5 marks: filled in the accent color, the rest in fg-muted.
 * The marks are hidden from screen readers; the level name or number next to
 * them carries the same information.
 */
export function LevelGauge({ level }: { level: SkillLevel }) {
    const gauge = levelGauge(level)
    return (
        <span aria-hidden="true">
            <span className="text-ds-accent">{gauge.filled}</span>
            {gauge.empty ? <span className="text-ds-fg-muted">{gauge.empty}</span> : null}
        </span>
    )
}
