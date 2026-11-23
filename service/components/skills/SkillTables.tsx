import type { ReactNode } from "react"

import { DataTable, type DataTableColumn } from "@/components/ds/DataTable"
import { toVirtualPath, type FloorGroup } from "@/lib/building/floors"
import { categoryLabels, levelGauge, levelLabels, type Skill, type SkillCategoryGroup } from "@/lib/skills-meta"

const COLUMNS: readonly DataTableColumn<"name" | "level" | "label">[] = [
    { key: "name", header: "名前" },
    { key: "level", header: "level" },
    { key: "label", header: "レベルの名前" },
]

type SkillTablesProps = {
    group: FloorGroup
    categories: SkillCategoryGroup[]
}

export function SkillTables({ group, categories }: SkillTablesProps) {
    return (
        <>
            {categories.map(({ category, skills }) => (
                <section key={category} className="mt-ds-5">
                    <h2 className="font-ds text-ds-lg font-bold">
                        <span className="text-ds-fg-muted"># </span>
                        {categoryLabels[category]}
                    </h2>
                    <p className="mb-ds-2 text-ds-sm text-ds-link">
                        {toVirtualPath(group.url)}/{category}/
                    </p>
                    <DataTable columns={COLUMNS} rows={skills.map(skillRows)} />
                </section>
            ))}
        </>
    )
}

function skillRows(skill: Skill): Record<"name" | "level" | "label", ReactNode> {
    const gauge = levelGauge(skill.level)
    return {
        name: skill.name,
        level: (
            <>
                <span className="text-ds-accent">{gauge.filled}</span>
                {gauge.empty ? <span className="text-ds-border">{gauge.empty}</span> : null}{" "}
                <span className="text-ds-fg-muted">{skill.level}</span>
            </>
        ),
        label: levelLabels[skill.level].label,
    }
}
