import { PagerDoors } from "@/components/ds/PagerDoors"

import type { DesignSample } from "./types"

const PREV = { title: "agora", href: "/3f/portfolios/agora" }
const NEXT = { title: "ol-soldiers", href: "/3f/portfolios/ol-soldiers" }
const LIST = { category: "Portfolio", listHref: "/3f/portfolios" }

export const pagerDoorsSample: DesignSample = {
    id: "pager-doors",
    title: "PagerDoors",
    Sample: () => (
        <div className="flex flex-col gap-ds-4">
            <PagerDoors prev={PREV} next={NEXT} {...LIST} />
            <PagerDoors next={NEXT} {...LIST} />
            <PagerDoors prev={PREV} {...LIST} />
        </div>
    ),
}
