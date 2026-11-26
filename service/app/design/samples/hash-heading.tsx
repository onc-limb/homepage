import { HashHeading } from "@/components/ds/HashHeading"

import type { DesignSample } from "./types"

export const hashHeadingSample: DesignSample = {
    id: "hash-heading",
    title: "HashHeading",
    Sample: () => (
        <div className="flex flex-col gap-ds-2">
            <HashHeading>経験</HashHeading>
            <HashHeading level={3}>業務</HashHeading>
        </div>
    ),
}
