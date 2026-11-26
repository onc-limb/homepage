import { FloorGuide } from "@/components/ds/FloorGuide"

import type { DesignSample } from "./types"

export const floorGuideSample: DesignSample = {
    id: "floor-guide",
    title: "FloorGuide",
    Sample: () => <FloorGuide selected="1f" counts={{ "2f": 3, b1: 1 }} />,
}
