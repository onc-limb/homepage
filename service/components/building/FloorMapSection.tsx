import type { Entry } from "@/lib/building/entries"
import type { Floor } from "@/lib/building/floors"
import { buildGuideFloorData } from "@/lib/building/guide"
import { layoutFloor } from "@/lib/building/layout"
import { runSearches } from "@/lib/building/searches"

import { FloorView } from "./FloorView"

/** Server side of a floor page's map and guide: the layout, the guide data and the searches come from the papers. */
export function FloorMapSection({ floor, entries }: { floor: Floor; entries: readonly Entry[] }) {
    const onFloor = entries.filter((entry) => entry.floor === floor.id)
    const layout = layoutFloor(floor, onFloor)
    return <FloorView layout={layout} guide={buildGuideFloorData(layout, onFloor)} searches={runSearches(entries)} />
}
