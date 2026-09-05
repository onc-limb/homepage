import type { Skill, SkillCategory } from "@/lib/skills-meta"
import { categoryLabels } from "@/lib/skills-meta"
import { Reveal } from "@/components/animations"
import { SkillBar } from "./SkillBar"

export function SkillCategorySection({
    category,
    skills,
    index,
}: {
    category: SkillCategory
    skills: Skill[]
    index: number
}) {
    if (skills.length === 0) return null
    return (
        <div>
            <Reveal
                as="header"
                className="mb-6 flex items-baseline gap-4 border-b border-hairline pb-4"
            >
                <span className="font-mono text-xs tracking-[0.18em] text-accent">
                    /{String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="text-[22px] font-semibold tracking-[-0.01em]">
                    {categoryLabels[category]}
                </h3>
                <span className="ml-auto font-mono text-[11px] tracking-[0.16em] text-fg-dim">
                    {skills.length} skills
                </span>
            </Reveal>
            <div className="mb-12 grid grid-cols-1 gap-3 [@media(min-width:720px)]:grid-cols-2 [@media(min-width:720px)]:gap-x-8 [@media(min-width:720px)]:gap-y-3">
                {skills.map((skill, j) => (
                    <Reveal key={skill.name} delay={j * 40}>
                        <SkillBar skill={skill} />
                    </Reveal>
                ))}
            </div>
        </div>
    )
}
