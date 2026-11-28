"use client"

import { useState } from "react"

import { FloorGuide } from "@/components/ds/FloorGuide"
import { FloorMap } from "@/components/ds/FloorMap"
import { GuidePc } from "@/components/ds/GuidePc"
import { MAP_AND_GUIDE_COLUMNS } from "@/components/ds/screen-styles"
import { FLOORS, type FloorId } from "@/lib/building/floors"
import { composeGuide, toggleSearch, type GuideFloorData, type GuideFocus, type GuideSelection } from "@/lib/building/guide"
import type { FloorLayout } from "@/lib/building/layout"
import { litRoomsOn, searchCounts, type SearchResult } from "@/lib/building/searches"

type InfoCenterProps = {
    layouts: Record<FloorId, FloorLayout>
    guides: Record<FloorId, GuideFloorData>
    searches: readonly SearchResult[]
    /** Controlled selection: when given, the parent decides what is shown (changes are only reported). */
    selection?: GuideSelection
    defaultSelection?: GuideSelection
    onSelectionChange?: (selection: GuideSelection) => void
}

const FLOOR_FOCUS: GuideFocus = { kind: "floor" }
const INITIAL_SELECTION: GuideSelection = { floor: "1f", focus: FLOOR_FOCUS }

// Stacking values from the info mock (Maze.dc.html): the gap between floors (300) over the
// height of one floor (440), the opacity of the floors that are not selected, and the move.
const FLOOR_STEP_PERCENT = 68
const NEIGHBOR_OPACITY = 0.3
const FLOOR_MOVE = "transform .6s cubic-bezier(.2,.7,.2,1)"
const FRONT_Z = 3
const BACK_Z = 1

type FloorStackProps = {
    layouts: Record<FloorId, FloorLayout>
    selection: GuideSelection
    lit: readonly string[]
    onSelectRoom: (room: string) => void
}

function FloorStack({ layouts, selection, lit, onSelectRoom }: FloorStackProps) {
    const selectedIndex = FLOORS.findIndex((floor) => floor.id === selection.floor)
    const selectedRoom = selection.focus.kind === "room" ? selection.focus.id : null
    return (
        <div className="overflow-y-clip py-ds-5">
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
                                    selected={selectedRoom}
                                    lit={lit}
                                    onSelect={onSelectRoom}
                                />
                            ) : (
                                <FloorMap layout={layouts[floor.id]} interactive={false} />
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export function InfoCenter({
    layouts,
    guides,
    searches,
    selection: controlled,
    defaultSelection = INITIAL_SELECTION,
    onSelectionChange,
}: InfoCenterProps) {
    const [ownSelection, setOwnSelection] = useState<GuideSelection>(defaultSelection)
    const [activeCommand, setActiveCommand] = useState<string | null>(null)
    const selection = controlled ?? ownSelection
    const activeSearch = searches.find((search) => search.command === activeCommand) ?? null

    const select = (next: GuideSelection) => {
        if (controlled === undefined) setOwnSelection(next)
        onSelectionChange?.(next)
    }
    const selectFloor = (floor: FloorId) => select({ floor, focus: FLOOR_FOCUS })
    const selectRoom = (id: string) => select({ floor: selection.floor, focus: { kind: "room", id } })

    const view = composeGuide({ place: "info", data: guides[selection.floor], focus: selection.focus, search: activeSearch })

    return (
        <div className={MAP_AND_GUIDE_COLUMNS}>
            <div className="relative min-w-0">
                <div className="mb-ds-2 md:absolute md:left-ds-2 md:top-ds-2 md:z-10 md:mb-0">
                    <FloorGuide
                        selected={selection.floor}
                        counts={activeSearch ? searchCounts(activeSearch) : undefined}
                        onSelect={selectFloor}
                    />
                </div>
                <FloorStack
                    layouts={layouts}
                    selection={selection}
                    lit={activeSearch ? litRoomsOn(activeSearch, selection.floor) : []}
                    onSelectRoom={selectRoom}
                />
            </div>
            <GuidePc
                text={view.text}
                papers={view.papers}
                destinations={view.destinations}
                rooms={{ scope: view.rooms.scope, items: view.rooms.items.map(({ id, name }) => ({ id, name })) }}
                searches={searches}
                activeSearch={activeCommand}
                onSearch={(command) => setActiveCommand((active) => toggleSearch(active, command))}
                onSelect={(id) => {
                    const item = view.rooms.items.find((candidate) => candidate.id === id)
                    if (item?.target.kind === "focus") select({ floor: selection.floor, focus: item.target.focus })
                    if (item?.target.kind === "floor") selectFloor(item.target.floor)
                }}
                onPick={(path) => {
                    const hit = activeSearch?.hits.find((candidate) => candidate.path === path)
                    if (!hit) return
                    select({ floor: hit.floor, focus: hit.room === null ? FLOOR_FOCUS : { kind: "room", id: hit.room } })
                }}
            />
        </div>
    )
}
