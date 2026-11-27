"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { FloorMap } from "@/components/ds/FloorMap"
import { GuidePc } from "@/components/ds/GuidePc"
import { MAP_AND_GUIDE_COLUMNS } from "@/components/ds/screen-styles"
import { findFloor } from "@/lib/building/floors"
import { composeGuide, type GuideFloorData, type GuideFocus } from "@/lib/building/guide"
import type { FloorLayout } from "@/lib/building/layout"
import { litRoomsOn, type SearchResult } from "@/lib/building/searches"

type FloorViewProps = {
    layout: FloorLayout
    guide: GuideFloorData
    searches: readonly SearchResult[]
}

const FLOOR_FOCUS: GuideFocus = { kind: "floor" }

/**
 * The map of one floor and the guide PC, under the doors of a floor page. It composes the guide as the info
 * center does, except that the floor page has no link to itself, 上の階・下の階 are links to the floor pages,
 * and a result on another floor moves to that floor page.
 */
export function FloorView({ layout, guide, searches }: FloorViewProps) {
    const router = useRouter()
    const [focus, setFocus] = useState<GuideFocus>(FLOOR_FOCUS)
    const [activeCommand, setActiveCommand] = useState<string | null>(null)
    const activeSearch = searches.find((search) => search.command === activeCommand) ?? null

    const view = composeGuide({ place: "floor", data: guide, focus, search: activeSearch })

    return (
        <div className={MAP_AND_GUIDE_COLUMNS}>
            <FloorMap
                layout={layout}
                selected={focus.kind === "room" ? focus.id : null}
                lit={activeSearch ? litRoomsOn(activeSearch, layout.floor) : []}
                onSelect={(id) => setFocus({ kind: "room", id })}
            />
            <GuidePc
                text={view.text}
                papers={view.papers}
                destinations={view.destinations}
                rooms={{
                    scope: view.rooms.scope,
                    items: view.rooms.items.map(({ id, name, target }) =>
                        target.kind === "floor" ? { id, name, href: findFloor(target.floor).url } : { id, name }
                    ),
                }}
                searches={searches}
                activeSearch={activeCommand}
                onSearch={setActiveCommand}
                onSelect={(id) => {
                    const item = view.rooms.items.find((candidate) => candidate.id === id)
                    if (item?.target.kind === "focus") setFocus(item.target.focus)
                }}
                onPick={(path) => {
                    const hit = activeSearch?.hits.find((candidate) => candidate.path === path)
                    if (!hit) return
                    if (hit.floor !== layout.floor) {
                        router.push(findFloor(hit.floor).url)
                        return
                    }
                    setFocus(hit.room === null ? FLOOR_FOCUS : { kind: "room", id: hit.room })
                }}
            />
        </div>
    )
}
