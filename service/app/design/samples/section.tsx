import { Section } from "@/components/ds/Section"

import type { DesignSample } from "./types"

export const sectionSample: DesignSample = {
    id: "section",
    title: "Section",
    Sample: () => (
        <Section heading="description">
            <p className="font-ds-prose">見出しは大文字、本文は字下げして並べる。</p>
        </Section>
    ),
}
