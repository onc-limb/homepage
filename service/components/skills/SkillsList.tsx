"use client"

import { useState } from "react"
import {
    categoryOrder,
    sortSkillsByLevel,
    type Skill,
    type SkillCategory,
} from "@/lib/skills-meta"
import { SkillBar } from "./SkillBar"
import { SkillCategorySection } from "./SkillCategorySection"

type ViewMode = "category" | "level"

export function SkillsList({
    skillsByCategory,
}: {
    skillsByCategory: Record<SkillCategory, Skill[]>
}) {
    const [viewMode, setViewMode] = useState<ViewMode>("category")
    const allSkills = sortSkillsByLevel(Object.values(skillsByCategory).flat())

    return (
        <div>
            <div
                className="mb-10 flex flex-wrap gap-1 rounded-[var(--radius)] border border-hairline bg-bg-elev p-1"
                role="group"
                aria-label="スキル一覧の表示順"
            >
                <button
                    type="button"
                    aria-pressed={viewMode === "category"}
                    onClick={() => setViewMode("category")}
                    className={`rounded-[calc(var(--radius)-2px)] px-4 py-2 font-mono text-xs transition-colors ${
                        viewMode === "category"
                            ? "bg-accent-soft text-accent"
                            : "text-fg-muted hover:text-fg"
                    }`}
                >
                    カテゴリ別
                </button>
                <button
                    type="button"
                    aria-pressed={viewMode === "level"}
                    onClick={() => setViewMode("level")}
                    className={`rounded-[calc(var(--radius)-2px)] px-4 py-2 font-mono text-xs transition-colors ${
                        viewMode === "level"
                            ? "bg-accent-soft text-accent"
                            : "text-fg-muted hover:text-fg"
                    }`}
                >
                    レベル順
                </button>
            </div>

            {viewMode === "category" ? (
                categoryOrder
                    .filter((category) => skillsByCategory[category].length > 0)
                    .map((category, index) => (
                        <SkillCategorySection
                            key={category}
                            category={category}
                            skills={skillsByCategory[category]}
                            index={index}
                        />
                    ))
            ) : (
                <div className="grid grid-cols-1 gap-3 [@media(min-width:720px)]:grid-cols-2 [@media(min-width:720px)]:gap-x-8 [@media(min-width:720px)]:gap-y-3">
                    {allSkills.map((skill) => (
                        <SkillBar key={skill.name} skill={skill} />
                    ))}
                </div>
            )}
        </div>
    )
}
