"use client"

import { FLOORS, type FloorId, type FloorMaterial } from "@/lib/building/floors"

import { FOCUS_RING } from "./focus-styles"
import { LIT_MARK } from "./lit-mark"
import { TRIANGLE_CLIP } from "./surface-styles"

type FloorGuideProps = {
    selected?: FloorId | null
    counts?: Partial<Record<FloorId, number>>
    onSelect?: (floor: FloorId) => void
}

// Unpressed fills by material; the pressed floor shows the surface fill instead.
const UNPRESSED_FILLS: Record<FloorMaterial, string> = {
    wood: "bg-ds-bg",
    stone: "bg-ds-map-stone",
    deck: "bg-ds-bg",
}

const BUTTON_FRAME =
    "flex flex-1 items-center gap-ds-2 border px-ds-2 py-ds-2 text-left font-ds text-ds-sm text-ds-fg md:flex-none"

export function FloorGuide({ selected, counts, onSelect }: FloorGuideProps) {
    return (
        <div>
            <span
                aria-hidden="true"
                data-part="roof"
                className={`hidden h-ds-roof -mx-ds-2 mb-ds-1 bg-ds-map-wood-wall ${TRIANGLE_CLIP} md:block`}
            />
            <div
                role="group"
                aria-label="階"
                // DOM order is the visual order on both widths (屋上 → B1, left to right
                // on narrow screens and top to bottom on wide ones), so Tab follows the eye.
                className="flex flex-row gap-ds-1 md:flex-col"
            >
                {[...FLOORS].reverse().map((floor) => {
                    const pressed = floor.id === selected
                    const count = counts?.[floor.id]
                    const frame = pressed
                        ? "border-ds-fg bg-ds-surface"
                        : `border-ds-border ${UNPRESSED_FILLS[floor.material]}`
                    return (
                        <button
                            key={floor.id}
                            type="button"
                            aria-pressed={pressed}
                            data-floor={floor.id}
                            onClick={() => onSelect?.(floor.id)}
                            className={`${BUTTON_FRAME} ${frame} ${FOCUS_RING}`}
                        >
                            <span className="font-bold">{floor.label}</span>
                            <span className="sr-only font-ds-prose text-ds-fg-muted md:not-sr-only">
                                {floor.name}
                            </span>
                            {count !== undefined && count > 0 ? (
                                <span className="font-bold text-ds-accent">
                                    {LIT_MARK}
                                    {count}
                                </span>
                            ) : null}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
