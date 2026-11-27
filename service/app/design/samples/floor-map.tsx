import { FloorMap } from "@/components/ds/FloorMap"
import { findFloor, findGroup, toVirtualPath } from "@/lib/building/floors"
import { layoutFloor } from "@/lib/building/layout"
import { SOCIAL_LINKS } from "@/lib/constants"
import { categoryOrder } from "@/lib/skills-meta"

import type { DesignSample } from "./types"

const wood = layoutFloor(findFloor("1f"), [])
const studies = findGroup("studies")
const stone = layoutFloor(
    findFloor(studies.floor),
    categoryOrder.slice(0, 3).map((category) => ({
        path: `${toVirtualPath(studies.url)}/${category}/sample.md`,
        floor: studies.floor,
        group: studies.slug,
        room: category,
        title: category,
    }))
)
const rooftop = findFloor("rf")
const deck = layoutFloor(
    rooftop,
    SOCIAL_LINKS.map((link, index) => ({
        path: `${toVirtualPath(rooftop.url)}/${index + 1}.url`,
        floor: rooftop.id,
        group: null,
        room: null,
        title: link.name,
    }))
)

export const floorMapSample: DesignSample = {
    id: "floor-map",
    title: "FloorMap",
    Sample: () => (
        <div className="flex flex-col gap-ds-4">
            <FloorMap layout={wood} selected={wood.rooms[0].id} />
            <FloorMap layout={stone} lit={[stone.rooms[1].id]} />
            <FloorMap layout={deck} />
            <FloorMap layout={wood} selected={wood.rooms[0].id} lit={[wood.rooms[1].id]} />
        </div>
    ),
}
