import type { Metadata } from "next"
import { Page } from "@/components/ds/Page"
import { SkillTables } from "@/components/skills"
import { findGroup } from "@/lib/building/floors"
import { getSkills } from "@/lib/skills"
import { groupSkillsByCategory } from "@/lib/skills-meta"
import { createPageMetadata } from "@/lib/seo"

const group = findGroup("skills")

export const metadata: Metadata = createPageMetadata({
    title: group.name,
    description:
        "フロントエンド、バックエンド、クラウド、設計など、実務で使ってきた技術スタックと習熟度を紹介します。",
    path: group.url,
})

export default function SkillsPage() {
    return (
        <main className="flex-1">
            <Page title={group.name} command={group.command}>
                <SkillTables group={group} categories={groupSkillsByCategory(getSkills(), group.floor)} />
            </Page>
        </main>
    )
}
