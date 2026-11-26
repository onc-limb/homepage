"use client"

import { useState } from "react"

import { FloorGuide } from "@/components/ds/FloorGuide"
import { FloorMap } from "@/components/ds/FloorMap"
import { FLOORS, type FloorId } from "@/lib/building/floors"
import type { FloorLayout } from "@/lib/building/layout"

type InfoCenterProps = {
    layouts: Record<FloorId, FloorLayout>
}

type Selection = { floor: FloorId; room: string | null }

// Stacking values from the info mock (Maze.dc.html): the gap between floors (300) over the
// height of one floor (440), the opacity of the floors that are not selected, and the move.
const FLOOR_STEP_PERCENT = 68
const NEIGHBOR_OPACITY = 0.3
const FLOOR_MOVE = "transform .6s cubic-bezier(.2,.7,.2,1)"
const FRONT_Z = 3
const BACK_Z = 1

type FloorStackProps = InfoCenterProps & {
    size: "normal" | "small"
    selection: Selection
    onSelectRoom: (room: string) => void
}

function FloorStack({ layouts, size, selection, onSelectRoom }: FloorStackProps) {
    const selectedIndex = FLOORS.findIndex((floor) => floor.id === selection.floor)
    return (
        <div className="overflow-hidden py-ds-5">
            <div className="grid">
                {FLOORS.map((floor, index) => {
                    const current = floor.id === selection.floor
                    return (
                        <div
                            key={floor.id}
                            data-floor-layer=""
                            data-current={current ? "true" : undefined}
                            className="col-start-1 row-start-1"
                            style={{
                                transform: `translateY(${(selectedIndex - index) * FLOOR_STEP_PERCENT}%)`,
                                transition: FLOOR_MOVE,
                                opacity: current ? undefined : NEIGHBOR_OPACITY,
                                zIndex: current ? FRONT_Z : BACK_Z,
                            }}
                        >
                            {current ? (
                                <FloorMap
                                    layout={layouts[floor.id]}
                                    size={size}
                                    selected={selection.room}
                                    onSelect={onSelectRoom}
                                />
                            ) : (
                                <FloorMap layout={layouts[floor.id]} size={size} interactive={false} />
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export function InfoCenter({ layouts }: InfoCenterProps) {
    const [selection, setSelection] = useState<Selection>({ floor: "1f", room: null })
    const selectFloor = (floor: FloorId) => setSelection({ floor, room: null })
    const selectRoom = (room: string) => setSelection((prev) => ({ ...prev, room }))

    return (
        <div className="flex flex-col gap-ds-2 md:flex-row md:items-start md:gap-ds-4">
            <FloorGuide selected={selection.floor} onSelect={selectFloor} />
            <div className="min-w-0 flex-1">
                <div className="hidden md:block">
                    <FloorStack layouts={layouts} size="normal" selection={selection} onSelectRoom={selectRoom} />
                </div>
                <div className="md:hidden">
                    <FloorStack layouts={layouts} size="small" selection={selection} onSelectRoom={selectRoom} />
                </div>
            </div>
        </div>
    )
}
