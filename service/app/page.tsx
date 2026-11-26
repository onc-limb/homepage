import type { Metadata } from "next"

import { floorTitle } from "@/components/building/FloorFrame"
import { CONTACT_DOOR } from "@/components/ds/contact-door"
import { DoorButton } from "@/components/ds/DoorButton"
import { Page } from "@/components/ds/Page"
import { TextLink } from "@/components/ds/TextLink"
import { JsonLd } from "@/components/seo"
import { FLOORS } from "@/lib/building/floors"
import { absoluteUrl, createPageMetadata, LODGE_NAME, SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo"

export const metadata: Metadata = createPageMetadata({
    title: "Home",
    description: SITE_DESCRIPTION,
    path: "/",
})

export default function TopPage() {
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
                <ul className="mt-ds-4 flex flex-col gap-ds-2">
                    {[...FLOORS].reverse().map((floor) => (
                        <li key={floor.id}>
                            <TextLink href={floor.url}>{floorTitle(floor)}</TextLink>
                        </li>
                    ))}
                </ul>
            </Page>
        </main>
    )
}
