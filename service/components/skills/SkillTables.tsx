import type { ReactNode } from "react"

import { DataTable, type DataTableColumn } from "@/components/ds/DataTable"
import { HashHeading } from "@/components/ds/HashHeading"
import { TextLink } from "@/components/ds/TextLink"
import { toVirtualPath, type FloorGroup } from "@/lib/building/floors"
import { categoryLabels, levelLabels, skillHref, type Skill, type SkillCategoryGroup } from "@/lib/skills-meta"
import { LevelGauge } from "./LevelGauge"

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
                    <HashHeading>{categoryLabels[category]}</HashHeading>
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
    return {
        name: <TextLink href={skillHref(skill)}>{skill.name}</TextLink>,
        level: (
            <>
                <LevelGauge level={skill.level} />{" "}
                <span className="text-ds-fg-muted">{skill.level}</span>
            </>
        ),
        label: levelLabels[skill.level].label,
    }
}
