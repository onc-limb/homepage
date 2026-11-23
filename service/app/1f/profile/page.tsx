import type { Metadata } from "next"
import { KeyValue } from "@/components/ds/KeyValue"
import { Page } from "@/components/ds/Page"
import { Section } from "@/components/ds/Section"
import { TextLink } from "@/components/ds/TextLink"
import { PROSE_BODY, PROSE_HEADING_MINOR } from "@/components/ds/prose-styles"
import { BOXED_SURFACE } from "@/components/ds/surface-styles"
import { JsonLd } from "@/components/seo"
import { findFloor, findGroup } from "@/lib/building/floors"
import { SOCIAL_LINKS } from "@/lib/constants"
import { getProfile, getParsedProfile } from "@/lib/profile"
import { absoluteUrl, createPageMetadata } from "@/lib/seo"

const group = findGroup("profile")
const histories = findGroup("histories")
const portfolios = findGroup("portfolios")
const rooftop = findFloor("rf")

// 一行の紹介文。docs/profile.md は変えられないため、旧 /profile のヒーローの文をここに置く
const SYNOPSIS =
    "「作る」と決まったプロダクトを、動き続けるソフトウェアとして実装し、運用まで担う当事者。ソフトウェアアーキテクトの視点で設計しながら、自ら手を動かす。フロントエンドからバックエンド、インフラまで一貫して携わるフルスタックエンジニア。"

const description =
    "フルスタックエンジニア onclimb の経歴、価値観、資格、ソフトウェア開発への向き合い方を紹介します。"

export const metadata: Metadata = createPageMetadata({
    title: group.name,
    description,
    path: group.url,
})

export default async function ProfilePage() {
    const profile = await getProfile()
    const parsed = await getParsedProfile()

    const notes = [
        { heading: "関心", items: parsed.interests.map((item) => ({ key: item.title, value: item.description })) },
        { heading: "学習", items: parsed.learning.map((item) => ({ key: item.title, value: item.description })) },
        { heading: "資格", items: parsed.certs.map((item) => ({ key: item.year, value: item.title })) },
    ]
    const seeAlso = [
        { href: histories.href, label: histories.name },
        { href: portfolios.href, label: portfolios.name },
        { href: rooftop.url, label: rooftop.label },
    ]

    return (
        <>
            <JsonLd
                data={{
                    "@context": "https://schema.org",
                    "@type": "Person",
                    name: profile.data.name,
                    url: absoluteUrl(group.url),
                    image: absoluteUrl(profile.data.avatar),
                    jobTitle: profile.data.title,
                    description,
                    sameAs: SOCIAL_LINKS.map((link) => link.url),
                }}
            />
            <main className="flex-1">
                <Page title={group.name} command={group.command}>
                    <div className="flex max-w-ds-measure flex-col gap-ds-4">
                        <Section heading="NAME">
                            <p>{`${profile.data.name} — ${profile.data.title}`}</p>
                        </Section>
                        <Section heading="SYNOPSIS">
                            <p>{SYNOPSIS}</p>
                        </Section>
                        <Section heading="DESCRIPTION">
                            <div className={PROSE_BODY}>
                                {parsed.selfIntroduction.map((block, index) =>
                                    block.type === "pullQuote" ? (
                                        <div key={index} className={BOXED_SURFACE}>
                                            {block.text}
                                        </div>
                                    ) : (
                                        <p key={index}>{block.text}</p>
                                    ),
                                )}
                            </div>
                        </Section>
                        <Section heading="NOTES">
                            <div className="flex flex-col gap-ds-3">
                                {notes.map((note) => (
                                    <div key={note.heading} className="flex flex-col gap-ds-2">
                                        <h3 className={PROSE_HEADING_MINOR}>{note.heading}</h3>
                                        <KeyValue items={note.items} />
                                    </div>
                                ))}
                            </div>
                        </Section>
                        <Section heading="SEE ALSO">
                            <ul className="flex flex-wrap gap-ds-2">
                                {seeAlso.map((item) => (
                                    <li key={item.href}>
                                        <TextLink href={item.href}>{item.label}</TextLink>
                                    </li>
                                ))}
                            </ul>
                        </Section>
                    </div>
                </Page>
            </main>
        </>
    )
}
