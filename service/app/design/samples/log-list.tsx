import { LogList } from "@/components/ds/LogList"

import type { DesignSample } from "./types"

export const logListSample: DesignSample = {
    id: "log-list",
    title: "LogList",
    Sample: () => (
        <LogList
            items={[
                { id: "a1b2c3d", date: "2026-11-01", title: "homepage", href: "/3f/portfolios/homepage" },
                { id: "e4f5a6b", date: "2026-10-12", title: "ol-soldiers", href: "/3f/portfolios/ol-soldiers" },
                { id: "c7d8e9f", date: "2026-09-03", title: "agora", href: "/3f/portfolios/agora" },
            ]}
        />
    ),
}
