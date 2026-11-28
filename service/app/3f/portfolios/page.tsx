import type { Metadata } from "next"

import { LogList } from "@/components/ds/LogList"
import { Page } from "@/components/ds/Page"
import { findGroup } from "@/lib/building/floors"
import { getProjects, listProjects, projectDate, projectHref } from "@/lib/portfolio"
import { createPageMetadata } from "@/lib/seo"

const group = findGroup("portfolios")

export const metadata: Metadata = createPageMetadata({
    title: group.name,
    description: "設計・実装・運用に携わったWebアプリケーションや、個人開発プロジェクトの実績を紹介します。",
    path: group.url,
})

export default function PortfolioListPage() {
    const items = listProjects(getProjects()).map((project) => ({
        id: project.id,
        date: projectDate(project),
        title: project.title,
        description: project.description,
        href: projectHref(project),
    }))
    return (
        <main className="flex-1">
            <Page title={group.name} command={group.command}>
                <LogList items={items} />
            </Page>
        </main>
    )
}
