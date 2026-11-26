import type { CSSProperties, ReactElement } from "react"

import { FLOORS, findFloor, type FloorMaterial } from "@/lib/building/floors"
import { layoutFloor, projectTopDown, TOP_DOWN_TRANSFORM, type Point } from "@/lib/building/layout"

import { Planks } from "./Planks"
import { MAP_EDGE, TRIANGLE_CLIP } from "./surface-styles"

type LodgeExteriorProps = {
    door?: "closed" | "open"
    size?: "desktop" | "narrow"
}

// Drawing sizes, the projection scale and the tree sizes, from the first-screen
// exterior in Maze.dc.html (SW / SG / se / SH / tw / th).
const SIZES: Record<
    NonNullable<LodgeExteriorProps["size"]>,
    {
        width: number
        height: number
        scale: number
        floorHeight: number
        treeWidth: number
        treeHeight: number
    }
> = {
    desktop: { width: 1000, height: 780, scale: 0.8, floorHeight: 96, treeWidth: 70, treeHeight: 120 },
    narrow: { width: 358, height: 400, scale: 0.36, floorHeight: 46, treeWidth: 30, treeHeight: 52 },
}

// atan(0.5): the lean that makes the two faces read as one box seen from above.
const WALL_SKEW_DEG = 26.565
// The stair tower rises above the rooftop terrace by just over half a floor.
const TOWER_HEIGHT_RATIO = 0.55
// Wooden faces carry lit windows: four on the light face, three on the shade face.
const WINDOW_COUNTS = { light: 4, shade: 3 } as const
const WINDOW = { inset: 0.05, top: 0.26, width: 0.1, height: 0.42 } as const
// The entrance sits in 1F's shade face; ratios of the face width / a floor height.
const DOOR = { inset: 0.44, width: 0.12, top: 0.3, height: 0.7 } as const
// 32 joints at ds-space-4 (24px) cover the terrace even at the desktop scale.
const TERRACE_PLANK_COUNT = 32

// Conifers around the lodge [x, y, size, front?] and ridges behind it [x, y, w, h],
// as fractions of the drawing's width / height, from Maze.dc.html TREES / HILLS.
const TREES: ReadonlyArray<readonly [number, number, number, boolean]> = [
    [0.06, 0.3, 1.0, false],
    [0.14, 0.18, 0.8, false],
    [0.22, 0.07, 0.9, false],
    [0.31, 0.02, 0.7, false],
    [0.66, 0.01, 0.75, false],
    [0.76, 0.07, 0.95, false],
    [0.86, 0.19, 0.8, false],
    [0.92, 0.32, 1.0, false],
    [0.01, 0.48, 0.85, false],
    [0.93, 0.5, 0.9, false],
    [0.04, 0.7, 1.1, true],
    [0.13, 0.8, 0.9, true],
    [0.23, 0.86, 0.75, true],
    [0.78, 0.86, 0.8, true],
    [0.86, 0.76, 1.0, true],
    [0.93, 0.68, 0.85, true],
]
const HILLS: ReadonlyArray<readonly [number, number, number, number]> = [
    [-0.06, 0.04, 0.52, 0.56],
    [0.28, -0.03, 0.5, 0.5],
    [0.6, 0.06, 0.5, 0.52],
]

// Face fills by floor material; only the wooden floors carry windows.
const FACE_FILL: Record<
    Exclude<FloorMaterial, "deck">,
    { light: string; shade: string; windows: boolean }
> = {
    wood: { light: "bg-ds-map-wood-wall", shade: "bg-ds-map-wood-shade", windows: true },
    stone: { light: "bg-ds-map-stone-wall", shade: "bg-ds-map-stone-shade", windows: false },
}

// Floors that show walls, from the top floor down. The deck floor is the terrace alone.
const WALLED_FLOORS = [...FLOORS].reverse().flatMap((floor) =>
    floor.material === "deck" ? [] : [{ ...floor, fill: FACE_FILL[floor.material] }]
)
// The entrance door goes on the 1F row of the shade face.
const DOOR_ROW = WALLED_FLOORS.findIndex((floor) => floor.id === findFloor("1f").id)
// The building and stair frames, kept in step with FloorMap by reading the same layout.
const { building, stairs } = layoutFloor(findFloor("1f"), [])

export function LodgeExterior({ door = "closed", size = "desktop" }: LodgeExteriorProps) {
    const s = SIZES[size]
    const baseTop = (s.height - WALLED_FLOORS.length * s.floorHeight) / 2
    // pe(x, y) of Maze.dc.html: the top-down projection, scaled and moved into the drawing.
    const place = (point: Point): Point => {
        const projected = projectTopDown(point)
        return { x: s.width / 2 + projected.x * s.scale, y: baseTop + projected.y * s.scale }
    }
    // A plate seen from above (Maze.dc.html plate): the rect scaled down, lifted off the roof.
    const plate = (rect: { x: number; y: number; w: number; h: number }, lift = 0) => {
        const center = place({ x: rect.x + rect.w / 2, y: rect.y + rect.h / 2 })
        return {
            left: center.x - (rect.w * s.scale) / 2,
            top: center.y - lift - (rect.h * s.scale) / 2,
            width: rect.w * s.scale,
            height: rect.h * s.scale,
        }
    }

    const leftCorner = place({ x: building.x, y: building.y + building.h })
    const frontCorner = place({ x: building.x + building.w, y: building.y + building.h })
    const rightCorner = place({ x: building.x + building.w, y: building.y })
    const faceEdge = {
        light: { left: leftCorner.x, width: frontCorner.x - leftCorner.x },
        shade: { left: frontCorner.x, width: rightCorner.x - frontCorner.x },
    } as const
    const towerLeft = place({ x: stairs.x, y: stairs.y + stairs.h })
    const towerFront = place({ x: stairs.x + stairs.w, y: stairs.y + stairs.h })
    const towerHeight = s.floorHeight * TOWER_HEIGHT_RATIO
    const doorInset = faceEdge.shade.width * DOOR.inset
    // The 2px frame is subtracted so the leaf itself spans DOOR.height of a floor.
    const doorHeight = s.floorHeight * DOOR.height - 2

    const faceStyle = (face: "light" | "shade", row: number): CSSProperties => ({
        left: faceEdge[face].left,
        top: (face === "light" ? leftCorner.y : frontCorner.y) + row * s.floorHeight,
        width: faceEdge[face].width,
        height: s.floorHeight,
        transform: `skewY(${face === "light" ? WALL_SKEW_DEG : -WALL_SKEW_DEG}deg)`,
        transformOrigin: "0 0",
    })

    const windowsOf = (face: "light" | "shade", count: number): ReactElement[] =>
        Array.from({ length: count }, (_, i) => {
            const faceWidth = faceEdge[face].width
            return (
                <span
                    key={i}
                    data-part="window"
                    className={`absolute box-border bg-ds-map-lit ${MAP_EDGE}`}
                    style={{
                        left: (faceWidth * (i + 0.5)) / count - faceWidth * WINDOW.inset,
                        top: s.floorHeight * WINDOW.top,
                        width: faceWidth * WINDOW.width,
                        height: s.floorHeight * WINDOW.height,
                    }}
                />
            )
        })

    // A conifer: a trunk under two triangular tiers, with the two tree colours swapped by index.
    const treeAt = (index: number): ReactElement => {
        const [x, y, treeScale, front] = TREES[index]
        const lower = index % 2 ? "bg-ds-map-tree-1" : "bg-ds-map-tree-2"
        const upper = index % 2 ? "bg-ds-map-tree-2" : "bg-ds-map-tree-1"
        return (
            <span
                key={index}
                data-part="tree"
                data-row={front ? "front" : "back"}
                className="absolute"
                style={{
                    left: x * s.width,
                    top: y * s.height,
                    width: s.treeWidth * treeScale,
                    height: s.treeHeight * treeScale,
                }}
            >
                <span
                    className="absolute bg-ds-map-trunk"
                    style={{ left: "43%", bottom: 0, width: "14%", height: "22%" }}
                />
                <span
                    className={`absolute ${lower} ${TRIANGLE_CLIP}`}
                    style={{ left: 0, top: "30%", width: "100%", height: "54%" }}
                />
                <span
                    className={`absolute ${upper} ${TRIANGLE_CLIP}`}
                    style={{ left: "12%", top: 0, width: "76%", height: "50%" }}
                />
            </span>
        )
    }

    return (
        <div
            aria-hidden="true"
            data-part="lodge-exterior"
            data-size={size}
            data-door={door}
            className="relative shrink-0"
            style={{ width: s.width, height: s.height }}
        >
            {HILLS.map(([x, y, w, h], i) => (
                <span
                    key={i}
                    data-part="hill"
                    className={`absolute bg-ds-map-hill ${TRIANGLE_CLIP}`}
                    style={{ left: x * s.width, top: y * s.height, width: w * s.width, height: h * s.height }}
                />
            ))}
            {TREES.map((tree, index) => (tree[3] ? null : treeAt(index)))}
            <span
                data-part="terrace"
                className={`absolute box-border bg-ds-map-deck ${MAP_EDGE}`}
                style={{ ...plate(building), transform: TOP_DOWN_TRANSFORM }}
            >
                <Planks material="deck" count={TERRACE_PLANK_COUNT} />
            </span>
            {WALLED_FLOORS.map((floor, row) =>
                (["light", "shade"] as const).map((face) => (
                    <span
                        key={`${floor.id}-${face}`}
                        data-part="wall"
                        data-floor={floor.id}
                        data-face={face}
                        className={`absolute box-border ${MAP_EDGE} ${floor.fill[face]}`}
                        style={faceStyle(face, row)}
                    >
                        {floor.fill.windows ? windowsOf(face, WINDOW_COUNTS[face]) : null}
                    </span>
                ))
            )}
            {(["light", "shade"] as const).map((face) => (
                <span
                    key={face}
                    data-part="tower-wall"
                    data-face={face}
                    className={`absolute box-border ${MAP_EDGE} ${FACE_FILL.wood[face]}`}
                    style={{
                        left: face === "light" ? towerLeft.x : towerFront.x,
                        top: (face === "light" ? towerLeft.y : towerFront.y) - towerHeight,
                        width:
                            face === "light"
                                ? towerFront.x - towerLeft.x
                                : rightCorner.x - towerFront.x,
                        height: towerHeight,
                        transform: `skewY(${face === "light" ? WALL_SKEW_DEG : -WALL_SKEW_DEG}deg)`,
                        transformOrigin: "0 0",
                    }}
                />
            ))}
            <span
                data-part="door"
                className={`absolute box-border bg-ds-surface ${MAP_EDGE}`}
                style={{
                    left: faceEdge.shade.left + doorInset,
                    top: frontCorner.y + DOOR_ROW * s.floorHeight + s.floorHeight * DOOR.top - doorInset * 0.5,
                    width: faceEdge.shade.width * DOOR.width,
                    height: doorHeight,
                    transform: `skewY(-${WALL_SKEW_DEG}deg)`,
                    transformOrigin: "0 0",
                }}
            >
                <span
                    data-part="door-leaf"
                    className="absolute bg-ds-accent"
                    style={{
                        left: 0,
                        top: 0,
                        width: "100%",
                        height: "100%",
                        transformOrigin: "0 50%",
                        transform: door === "open" ? "scaleX(0.1)" : "none",
                    }}
                />
            </span>
            <span
                data-part="tower-top"
                className={`absolute box-border bg-ds-map-wood-wall ${MAP_EDGE}`}
                style={{ ...plate(stairs, towerHeight), transform: TOP_DOWN_TRANSFORM }}
            />
            {TREES.map((tree, index) => (tree[3] ? treeAt(index) : null))}
        </div>
    )
}
