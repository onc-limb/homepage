import type { FloorMaterial } from "@/lib/building/floors"

import { CLIPPED_SURFACE } from "./surface-styles"

const DOOR_PLANK_COUNT = 24
const JOINT_COLOR: Record<FloorMaterial, string> = {
    wood: "border-ds-map-wood-joint",
    stone: "border-ds-map-stone-joint",
    deck: "border-ds-map-deck-joint",
}

export function Planks({
    material = "wood",
    count = DOOR_PLANK_COUNT,
}: {
    material?: FloorMaterial
    count?: number
}) {
    return (
        <span aria-hidden="true" className={CLIPPED_SURFACE}>
            {Array.from({ length: count }, (_, i) => (
                <span
                    key={i}
                    className={`h-full w-ds-4 shrink-0 border-r-2 ${JOINT_COLOR[material]}`}
                />
            ))}
        </span>
    )
}
