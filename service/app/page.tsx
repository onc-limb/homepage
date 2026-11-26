import type { Metadata } from "next"

import { InfoCenter } from "@/components/building/InfoCenter"
import { CONTACT_DOOR } from "@/components/ds/contact-door"
import { DoorButton } from "@/components/ds/DoorButton"
import { Page } from "@/components/ds/Page"
import { JsonLd } from "@/components/seo"
import { getEntries } from "@/lib/building/entries"
import { FLOORS, type FloorId } from "@/lib/building/floors"
import { layoutFloor, type FloorLayout } from "@/lib/building/layout"
import { absoluteUrl, createPageMetadata, LODGE_NAME, SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo"

export const metadata: Metadata = createPageMetadata({
    title: "Home",
    description: SITE_DESCRIPTION,
    path: "/",
})

export default async function TopPage() {
    const entries = await getEntries()
    const layouts = Object.fromEntries(
        FLOORS.map((floor) => [floor.id, layoutFloor(floor, entries.filter((entry) => entry.floor === floor.id))])
    ) as Record<FloorId, FloorLayout>

    return (
        <main className="flex-1">
            <JsonLd
                data={{
                    "@context": "https://schema.org",
                    "@type": "WebSite",
                    name: SITE_NAME,
                    url: absoluteUrl("/"),
                    description: SITE_DESCRIPTION,
                    inLanguage: "ja-JP",
                }}
            />
            <Page title={LODGE_NAME}>
                <p className="flex flex-wrap items-center gap-x-ds-3 gap-y-ds-2">
                    <DoorButton href={CONTACT_DOOR.href} primary>
                        {CONTACT_DOOR.label}
                    </DoorButton>
                    <span className="font-ds-prose text-ds-sm text-ds-fg-muted">
                        お仕事のご相談、技術的なご相談・壁打ちを受け付けています
                    </span>
                </p>
                <div className="mt-ds-4">
                    <InfoCenter layouts={layouts} />
                </div>
            </Page>
        </main>
    )
}
