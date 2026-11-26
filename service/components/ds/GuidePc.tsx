"use client"

import { useState } from "react"

import { CONTACT_DOOR } from "./contact-door"
import { DoorButton } from "./DoorButton"
import { TEXT_LINK } from "./link-styles"

export class GuidePcInputError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "GuidePcInputError"
    }
}

export type GuidePaper = {
    title: string
    line: string
}

export type GuideDestination = { label: string; href: string } | { label: string; onClick: () => void }

export type GuideRoom = {
    id: string
    name: string
}

export type GuideRooms = {
    scope: "floor" | "room"
    items: readonly GuideRoom[]
}

export type GuideSearch = {
    label: string
    command: string
    summary: string
    paths: readonly string[]
}

export type GuidePcProps = {
    text: string
    papers?: readonly GuidePaper[]
    destinations?: readonly GuideDestination[]
    rooms: GuideRooms
    searches: readonly GuideSearch[]
    onSelect?: (roomId: string) => void
    onPick?: (path: string) => void
}

const PAPER_PREVIEW_COUNT = 5

const ROOMS_HEADING = {
    floor: "この階の部屋",
    room: "つながっている部屋",
} as const

const MUTED_PROSE = "font-ds-prose text-ds-sm text-ds-fg-muted"
const MUTED_LABEL = `${MUTED_PROSE} font-normal`
const SECTION_LABEL = `mt-ds-3 ${MUTED_LABEL}`
const STACK_LIST = "mt-ds-1 flex flex-col gap-ds-1"

function firstDuplicate<T>(values: readonly T[]): T | undefined {
    const seen = new Set<T>()
    for (const value of values) {
        if (seen.has(value)) return value
        seen.add(value)
    }
    return undefined
}

// Duplicate commands or room ids would leave the pressed search and the
// onSelect target ambiguous, so they are rejected up front.
function validateGuidePcInput(searches: readonly GuideSearch[], rooms: GuideRooms): void {
    const duplicateCommand = firstDuplicate(searches.map((search) => search.command))
    if (duplicateCommand !== undefined) {
        throw new GuidePcInputError(`Duplicate search command: ${duplicateCommand}`)
    }
    const duplicateRoomId = firstDuplicate(rooms.items.map((room) => room.id))
    if (duplicateRoomId !== undefined) {
        throw new GuidePcInputError(`Duplicate room id: ${duplicateRoomId}`)
    }
}

export function GuidePc({
    text,
    papers = [],
    destinations = [],
    rooms,
    searches,
    onSelect,
    onPick,
}: GuidePcProps) {
    validateGuidePcInput(searches, rooms)

    const [activeCommand, setActiveCommand] = useState<string | null>(null)
    const activeSearch = searches.find((search) => search.command === activeCommand) ?? null
    const visiblePapers = papers.slice(0, PAPER_PREVIEW_COUNT)
    const restCount = papers.length - visiblePapers.length

    return (
        <section className="border border-ds-fg-muted bg-ds-surface p-ds-3">
            <h2 className="font-ds text-ds-base">
                PC{" "}
                <span className={MUTED_LABEL}>
                    — 案内人
                </span>{" "}
                <span className={`float-right ${MUTED_LABEL}`}>
                    ボタン版
                </span>
            </h2>
            <div className="mt-ds-3 border border-ds-border bg-ds-bg p-ds-2">
                <p className="text-ds-sm text-ds-fg-muted">
                    $ <span className="text-ds-fg">docent</span>
                </p>
                <p className="mt-ds-1 font-ds-prose text-ds-base">{text}</p>
                {visiblePapers.length > 0 ? (
                    <ul className="mt-ds-3 border-t border-ds-border">
                        {visiblePapers.map((paper, index) => (
                            <li
                                key={index}
                                className="flex flex-col border-b border-ds-border py-ds-2"
                            >
                                <span className="font-ds-prose font-bold">{paper.title}</span>
                                <span className={MUTED_PROSE}>
                                    {paper.line}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : null}
                {restCount > 0 ? (
                    <p className={`mt-ds-2 ${MUTED_PROSE}`}>
                        ほか {restCount} 枚
                    </p>
                ) : null}
                <div className="mt-ds-2 flex flex-wrap gap-ds-2">
                    {destinations.map((destination, index) =>
                        "href" in destination ? (
                            <DoorButton key={index} href={destination.href}>
                                {destination.label}
                            </DoorButton>
                        ) : (
                            <DoorButton key={index} onClick={destination.onClick}>
                                {destination.label}
                            </DoorButton>
                        )
                    )}
                    <DoorButton href={CONTACT_DOOR.href} primary>
                        {CONTACT_DOOR.label}
                    </DoorButton>
                </div>
            </div>
            <h3 className={SECTION_LABEL}>
                {ROOMS_HEADING[rooms.scope]}
            </h3>
            <div className={STACK_LIST}>
                {rooms.items.map((room) => (
                    <DoorButton key={room.id} onClick={() => onSelect?.(room.id)}>
                        {room.name}
                    </DoorButton>
                ))}
            </div>
            <p className={SECTION_LABEL}>
                探しもの
            </p>
            <div className="mt-ds-3 flex flex-col gap-ds-2">
                {searches.map((search) => (
                    <DoorButton
                        key={search.command}
                        pressed={search.command === activeCommand}
                        onClick={() => setActiveCommand(search.command)}
                    >
                        <span className="flex flex-col">
                            <span className="font-ds-prose font-normal">{search.label}</span>
                            <span className="font-ds-prose text-ds-sm text-ds-link">
                                $ {search.command}
                            </span>
                        </span>
                    </DoorButton>
                ))}
            </div>
            {activeSearch !== null ? (
                <div className="mt-ds-3 border-t border-ds-border pt-ds-3">
                    <p className="text-ds-sm text-ds-fg">$ {activeSearch.command}</p>
                    <p className="mt-ds-1 font-ds-prose text-ds-base font-bold">
                        {activeSearch.summary}
                    </p>
                    <div className={STACK_LIST}>
                        {activeSearch.paths.map((path) => (
                            <button
                                key={path}
                                type="button"
                                className={`block w-full text-left text-ds-sm ${TEXT_LINK} [overflow-wrap:anywhere]`}
                                onClick={() => onPick?.(path)}
                            >
                                {path}
                            </button>
                        ))}
                    </div>
                </div>
            ) : null}
        </section>
    )
}
