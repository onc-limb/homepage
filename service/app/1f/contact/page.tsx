import type { Metadata } from "next"
import { KeyValue } from "@/components/ds/KeyValue"
import { Page } from "@/components/ds/Page"
import { TextLink } from "@/components/ds/TextLink"
import { TEXT_LINK } from "@/components/ds/link-styles"
import { findFloor, findGroup } from "@/lib/building/floors"
import { CONTACT_EMAIL } from "@/lib/constants"
import { createPageMetadata, SITE_NAME } from "@/lib/seo"
import { ContactForm } from "./ContactForm"

const group = findGroup("contact")
const rooftop = findFloor("rf")

export const metadata: Metadata = createPageMetadata({
    title: group.name,
    description:
        "仕事のご相談・技術的なご相談の窓口。メールとフォームの2つの経路で受け付けています。",
    path: group.url,
})

export default function ContactPage() {
    return (
        <main className="flex-1">
            <Page title={group.name} command={group.command}>
                <div className="max-w-ds-measure">
                    <KeyValue
                        items={[
                            { key: "名前", value: `${SITE_NAME}（おんりむ）` },
                            {
                                key: "メール",
                                value: (
                                    <a href={`mailto:${CONTACT_EMAIL}`} className={TEXT_LINK}>
                                        {CONTACT_EMAIL}
                                    </a>
                                ),
                            },
                            {
                                key: "外部リンク",
                                value: (
                                    <>
                                        <TextLink href={rooftop.url}>
                                            {rooftop.label}（{rooftop.url}）
                                        </TextLink>
                                        にあります
                                    </>
                                ),
                            },
                        ]}
                    />
                    <h2 className="mt-ds-4 mb-ds-3 font-ds text-ds-lg font-bold">
                        <span className="text-ds-fg-muted"># </span>フォームで送る
                    </h2>
                    <ContactForm />
                </div>
            </Page>
        </main>
    )
}
