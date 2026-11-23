import { TextLink } from "@/components/ds/TextLink"

import type { DesignSample } from "./types"

export const textLinkSample: DesignSample = {
    id: "text-link",
    title: "TextLink",
    Sample: () => (
        <p className="flex flex-wrap gap-ds-4 font-ds text-ds-base">
            <TextLink href="/3f/portfolios">内部リンク</TextLink>
            <TextLink href="https://github.com/onc-limb">外部リンク</TextLink>
        </p>
    ),
}
