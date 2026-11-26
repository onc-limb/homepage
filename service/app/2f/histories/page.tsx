import type { Metadata } from "next"
import { Page } from "@/components/ds/Page"
import { findGroup } from "@/lib/building/floors"
import { getParsedProfile, listHistories } from "@/lib/profile"
import { createPageMetadata, SITE_NAME } from "@/lib/seo"

const group = findGroup("histories")

export const metadata: Metadata = createPageMetadata({
    title: group.name,
    description: `${SITE_NAME} の職務経歴を古い順に並べています。`,
    path: group.url,
})

export default async function HistoriesPage() {
    const parsed = await getParsedProfile()

    return (
        <main className="flex-1">
            <Page title={group.name} command={group.command}>
                <ol className="flex flex-col">
                    {listHistories(parsed.career).map((history) => (
                        <li key={history.number} className="flex gap-ds-3 border-t border-ds-border py-ds-3">
                            <span className="text-ds-sm text-ds-fg-muted">{history.number}</span>
                            <div>
                                <p className="font-ds-prose font-bold">{history.role}</p>
                                <ul className="mt-ds-1 flex list-disc flex-col gap-ds-1 pl-ds-4 font-ds-prose">
                                    {history.bullets.map((bullet) => (
                                        <li key={bullet}>{bullet}</li>
                                    ))}
                                </ul>
                            </div>
                        </li>
                    ))}
                </ol>
            </Page>
        </main>
    )
}
