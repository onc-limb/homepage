"use client"

import type { CSSProperties } from "react"

import { findFloor, type FloorMaterial } from "@/lib/building/floors"
import {
    projectTopDown,
    TOP_DOWN_TRANSFORM,
    type FloorLayout,
    type Rect,
} from "@/lib/building/layout"

import { Planks } from "./Planks"
import { FOCUS_RING } from "./focus-styles"
import { LIT_MARK } from "./lit-mark"
import { CLIPPED_SURFACE } from "./surface-styles"

type FloorMapProps = {
    layout: FloorLayout
    selected?: string | null
    lit?: readonly string[]
    onSelect?: (roomId: string) => void
    size?: "normal" | "small"
    interactive?: boolean
}

export class FloorMapInputError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "FloorMapInputError"
    }
}

// Geometry in layout units, from the single-floor view in Maze.dc.html.
const WALL_OFFSETS = [18, 12, 6]
const RIM_OFFSETS = [5]
const SLAB_OVERHANG = 6
const SLAB_OFFSETS = [16, 8]
const STAIR_TREAD = 14
const STAIR_RISER = 4
const DOOR_LAYER = 400
const ROOM_DEPTH_INTERVAL = 10
const MAP_ASPECT_RATIO = 1.73
// 32 joints at ds-space-4 (24px) cover even a full-width surface in a normal map.
const MAP_BOARD_COUNT = 32

const MATERIAL_STYLES: Record<FloorMaterial, { floor: string; wall: string }> = {
    wood: { floor: "bg-ds-map-wood", wall: "bg-ds-map-wood-wall" },
    stone: { floor: "bg-ds-map-stone", wall: "bg-ds-map-stone-wall" },
    deck: { floor: "bg-ds-map-deck", wall: "bg-ds-map-deck-joint" },
}

const ROOM_TRANSITION = "background-color .3s, border-color .3s"
const CORRIDOR_FILL = "bg-ds-map-corridor"
const MAP_EDGE = "border-2 border-ds-fg"

const percent = (value: number, total: number) => `${(value / total) * 100}%`

function rectStyle(rect: Rect, frame: Rect): CSSProperties {
    return {
        left: percent(rect.x - frame.x, frame.w),
        top: percent(rect.y - frame.y, frame.h),
        width: percent(rect.w, frame.w),
        height: percent(rect.h, frame.h),
    }
}

function mapFrame(slab: Rect, ground: FloorLayout["ground"]): Rect {
    const surfaces = ground ? [slab, ground.deck, ground.entranceStep] : [slab]
    const corners = surfaces.flatMap(({ x, y, w, h }) =>
        [x, x + w].flatMap((edgeX) =>
            [y, y + h].map((edgeY) => projectTopDown({ x: edgeX, y: edgeY }))
        )
    )
    // Keep the building centered, with room for the raised walls and shifted slab.
    const padding = WALL_OFFSETS[0]
    const width = (Math.max(...corners.map(({ x }) => Math.abs(x))) + padding) * 2
    const height = Math.max(
        width / MAP_ASPECT_RATIO,
        (Math.max(...corners.map(({ y }) => Math.abs(y))) + padding) * 2
    )
    return { x: -width / 2, y: -height / 2, w: width, h: height }
}

function wallSteps(rect: Rect, offsets: readonly number[], color: string) {
    return offsets.map((offset) => (
        <span
            key={offset}
            aria-hidden="true"
            data-part="wall"
            className={`pointer-events-none absolute h-full w-full ${color}`}
            style={{ left: percent(-offset, rect.w), top: percent(-offset, rect.h) }}
        />
    ))
}

export function FloorMap({
    layout,
    selected,
    lit = [],
    onSelect,
    size = "normal",
    interactive = true,
}: FloorMapProps) {
    const roomIds = new Set(layout.rooms.map(({ id }) => id))
    if (selected != null && !roomIds.has(selected)) {
        throw new FloorMapInputError(
            `Selected room is not on floor ${layout.floor}: ${selected}`
        )
    }
    const unknownLit = lit.find((id) => !roomIds.has(id))
    if (unknownLit !== undefined) {
        throw new FloorMapInputError(
            `Lit room is not on floor ${layout.floor}: ${unknownLit}`
        )
    }

    const { building, corridor, stairs, ground } = layout
    const { material } = findFloor(layout.floor)
    const colors = MATERIAL_STYLES[material]
    const offsets = material === "deck" ? RIM_OFFSETS : WALL_OFFSETS
    const small = size === "small"
    const litRooms = new Set(lit)
    const rooms = layout.rooms.map((room) => ({
        ...room,
        isSelected: room.id === selected,
        isLit: litRooms.has(room.id),
    }))
    const doors = rooms.flatMap(({ id, door, outsideDoor }) => [
        { key: `room:${id}`, rect: door },
        ...(outsideDoor ? [{ key: `outside:${id}`, rect: outsideDoor }] : []),
    ])
    const groundDoors = ground
        ? [
              { key: "entrance", rect: ground.entrance },
              { key: "exit", rect: ground.exit },
          ]
        : []
    const slab = {
        x: building.x - SLAB_OVERHANG,
        y: building.y - SLAB_OVERHANG,
        w: building.w + SLAB_OVERHANG * 2,
        h: building.h + SLAB_OVERHANG * 2,
    }
    const frame = mapFrame(slab, ground)
    const treads = Math.floor(stairs.h / (STAIR_TREAD + STAIR_RISER))

    return (
        <div
            aria-hidden={interactive ? undefined : true}
            data-floor={layout.floor}
            data-material={material}
            data-size={size}
            className={`relative w-full overflow-hidden bg-ds-bg font-ds outline outline-1 outline-ds-border ${small ? "max-w-ds-map-small" : "max-w-ds-map"}`}
            style={{ aspectRatio: frame.w / frame.h }}
        >
            <div
                data-part="plane"
                className="absolute"
                style={{
                    ...rectStyle(
                        { ...building, x: -building.w / 2, y: -building.h / 2 },
                        frame
                    ),
                    transform: TOP_DOWN_TRANSFORM,
                }}
            >
                {SLAB_OFFSETS.map((offset) => (
                    <span
                        key={offset}
                        aria-hidden="true"
                        data-part="slab"
                        className="absolute bg-ds-map-slab"
                        style={rectStyle(
                            { ...slab, x: slab.x + offset, y: slab.y + offset },
                            building
                        )}
                    />
                ))}
                <span
                    aria-hidden="true"
                    className={`absolute ${colors.wall}`}
                    style={rectStyle(slab, building)}
                />
                {ground &&
                    (
                        [
                            ["deck", ground.deck],
                            ["entrance-step", ground.entranceStep],
                        ] as const
                    ).map(([part, rect]) => (
                        <span
                            key={part}
                            aria-hidden="true"
                            data-part={part}
                            className={`absolute flex overflow-hidden border-2 border-ds-map-wood-wall ${MATERIAL_STYLES.deck.floor}`}
                            style={rectStyle(rect, building)}
                        >
                            <Planks material="deck" count={MAP_BOARD_COUNT} />
                        </span>
                    ))}
                <span
                    aria-hidden="true"
                    data-part="corridor"
                    className={`absolute ${MAP_EDGE} ${CORRIDOR_FILL}`}
                    style={rectStyle(corridor, building)}
                />
                <span
                    className="absolute"
                    aria-hidden="true"
                    style={rectStyle(stairs, building)}
                >
                    {wallSteps(stairs, offsets, colors.wall)}
                    <span
                        data-part="stairs"
                        className={`${CLIPPED_SURFACE} ${MAP_EDGE} ${colors.floor}`}
                    >
                        {Array.from({ length: treads }, (_, i) => (
                            <span
                                key={i}
                                className={`absolute w-full ${colors.wall}`}
                                style={{
                                    top: percent(
                                        i * (STAIR_TREAD + STAIR_RISER) + STAIR_TREAD,
                                        stairs.h
                                    ),
                                    height: percent(STAIR_RISER, stairs.h),
                                }}
                            />
                        ))}
                    </span>
                </span>
                {rooms.map(({ id, name, rect, isSelected, isLit }) => {
                    const frameClass = isSelected
                        ? "border-4 border-ds-prompt"
                        : isLit
                          ? "border-2 border-ds-accent"
                          : MAP_EDGE
                    const roomProps = {
                        "data-part": "room",
                        "data-selected": isSelected ? "true" : undefined,
                        "data-lit": isLit ? "true" : undefined,
                        className: `${CLIPPED_SURFACE} ${frameClass} ${isLit ? "bg-ds-map-lit" : colors.floor}`,
                        style: { transition: ROOM_TRANSITION },
                    }
                    const planks = <Planks material={material} count={MAP_BOARD_COUNT} />
                    const selectRoom = () => onSelect?.(id)
                    const zIndex = 1 + Math.round((rect.x + rect.y) / ROOM_DEPTH_INTERVAL)

                    return (
                        <span
                            key={id}
                            className="pointer-events-none absolute"
                            style={{ ...rectStyle(rect, building), zIndex }}
                        >
                            {wallSteps(rect, offsets, colors.wall)}
                            {interactive ? (
                                <button
                                    {...roomProps}
                                    type="button"
                                    aria-label={name}
                                    aria-pressed={isSelected}
                                    className={`${roomProps.className} pointer-events-auto ${FOCUS_RING}`}
                                    onClick={selectRoom}
                                    onKeyDown={(event) => {
                                        if (event.key !== "Enter") return
                                        event.preventDefault()
                                        selectRoom()
                                    }}
                                >
                                    {planks}
                                </button>
                            ) : (
                                <span {...roomProps}>{planks}</span>
                            )}
                        </span>
                    )
                })}
                {[...doors, ...groundDoors].map(({ key, rect }) => (
                    <span
                        key={key}
                        aria-hidden="true"
                        data-part="door"
                        className={`pointer-events-none absolute ${CORRIDOR_FILL}`}
                        style={{ ...rectStyle(rect, building), zIndex: DOOR_LAYER }}
                    />
                ))}
            </div>
            {rooms
                .filter(({ isSelected, isLit }) => !small || isSelected || isLit)
                .map(({ id, name, rect, isSelected, isLit }) => {
                    const center = projectTopDown({
                        x: rect.x + rect.w / 2,
                        y: rect.y + rect.h / 2,
                    })
                    const tone = isSelected
                        ? "text-ds-prompt"
                        : isLit
                          ? "text-ds-accent"
                          : "text-ds-fg"
                    const labelFrame = isSelected
                        ? "border border-ds-prompt"
                        : isLit
                          ? "border border-ds-accent"
                          : ""
                    return (
                        <span
                            key={id}
                            aria-hidden="true"
                            data-part={small ? "mark" : "label"}
                            className={`pointer-events-none absolute whitespace-nowrap text-ds-sm ${tone} ${small ? "" : `bg-ds-bg px-ds-1 ${labelFrame}`} ${isSelected || isLit ? "font-bold" : ""}`}
                            style={{
                                left: percent(center.x - frame.x, frame.w),
                                top: percent(center.y - frame.y, frame.h),
                                transform: "translate(-50%, -50%)",
                            }}
                        >
                            {small ? LIT_MARK : isLit ? `${name} ${LIT_MARK}` : name}
                        </span>
                    )
                })}
        </div>
    )
}
