import type { Metadata } from "next"
import { Page } from "@/components/ds/Page"
import { SkillTables } from "@/components/skills"
import { findGroup } from "@/lib/building/floors"
import { getSkills } from "@/lib/skills"
import { groupSkillsByCategory } from "@/lib/skills-meta"
import { createPageMetadata } from "@/lib/seo"

const group = findGroup("studies")

export const metadata: Metadata = createPageMetadata({
    title: group.name,
    description: "自己学習として取り組んできた技術を、分野ごとの表で習熟度とともに紹介します。",
    path: group.url,
})

export default function StudiesPage() {
    return (
        <main className="flex-1">
            <Page title={group.name} command={group.command}>
                <SkillTables group={group} categories={groupSkillsByCategory(getSkills(), group.floor)} />
            </Page>
        </main>
    )
}
