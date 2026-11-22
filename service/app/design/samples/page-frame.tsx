import { Page } from "@/components/ds/Page"

import type { DesignSample } from "./types"

export const pageFrameSample: DesignSample = {
    id: "page",
    title: "Page",
    Sample: () => (
        <Page
            title="自己紹介"
            command="man onclimb"
            peek={<p className="font-ds text-ds-sm text-ds-fg-muted">のぞき窓の帯がここに入る</p>}
        >
            <p className="font-ds-prose">見出しの上にコマンド、下に本文を置く。</p>
        </Page>
    ),
}
