import { LodgeExterior } from "@/components/ds/LodgeExterior"

import type { DesignSample } from "./types"

const COMBINATIONS: ReadonlyArray<{
    door: "closed" | "open"
    size: "desktop" | "narrow"
}> = [
    { size: "desktop", door: "closed" },
    { size: "desktop", door: "open" },
    { size: "narrow", door: "closed" },
    { size: "narrow", door: "open" },
]

export const lodgeExteriorSample: DesignSample = {
    id: "lodge-exterior",
    title: "LodgeExterior",
    Sample: () => (
        <div className="flex flex-col gap-ds-4 overflow-x-auto">
            {COMBINATIONS.map(({ door, size }) => (
                <div key={`${door}-${size}`} className="w-fit overflow-hidden">
                    <LodgeExterior door={door} size={size} />
                </div>
            ))}
        </div>
    ),
}
