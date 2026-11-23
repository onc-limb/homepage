import type { ReactNode } from "react"

import type { DesignTheme } from "../tokens"

/** One token sample shown inside each theme frame of /design. */
export type DesignSample = {
    id: string
    title: string
    Sample: (props: { theme: DesignTheme }) => ReactNode
}
