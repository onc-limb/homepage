// @vitest-environment jsdom
import fs from "node:fs"
import path from "node:path"
import { act, useState } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { findFloor, findGroup, toVirtualPath } from "@/lib/building/floors"

import { FOCUS_RING } from "../focus-styles"
import { GuidePc, GuidePcInputError, type GuidePcProps } from "../GuidePc"
import { HEADING_MINOR } from "../heading-styles"
import { elementWithText, precedes, render } from "./render"

vi.mock("next/link", () => ({
    default: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}))

/**
 * GuidePc contract tests.
 *
 * Issue #343 との対応:
 *   やること 1（見出し「PC — 案内人」）                         → "shows the heading ..."
 *   やること 2（見出しの右に小さく「ボタン版」）                 → "shows the heading ..."
 *   やること 3（$ docent の文章・置いてあるもの・行き先・Contact） → "shows the text as the output of $ docent", "shows the first five papers ...",
 *                                                                 "shows the destinations ...", "always ends the destinations with Contact ..."
 *   やること 4（部屋の一覧の見出しと onSelect）                   → "titles the room list ...", "calls onSelect ..."
 *   やること 5（探しもの: 説明が上・$ コマンドが下、結果、onPick、aria-pressed）
 *                                                               → "stacks the description above ...", "shows the result ...", "calls onPick ..."
 *   やること 6（ボタンはすべて DoorButton の小）                  → destinations / rooms / searches の各テストで .border-ds-door を確かめる
 *   やること 7（テストと /design の見本）                         → このファイル、app/design/samples/components.test.tsx
 *   受け入れ 1（文章・置いてあるもの・行き先のボタン・Contact が出る） → やること 3 のテスト
 *   受け入れ 2（部屋の一覧のボタンで onSelect）                   → "calls onSelect ..."
 *   受け入れ 3（探しもので結果が出て、パスで onPick）              → "shows the result ...", "calls onPick ..."
 *   受け入れ 4（tsc / test / lint）                              → 関門
 *
 * Reference: order.md やること 2・受け入れ条件, Issue #343
 *
 * renewal 20（order.md 守ること「GuidePc の口」）で足した契約:
 *   - 探しものの状態は外から制御する: 押した状態と結果は activeSearch（コマンド）で決まり、押すと onSearch が呼ばれる
 *   - 部屋の一覧の項目は href を持てる（階のページの「上の階・下の階」はリンク）
 *   - 案内の文章は aria-live="polite" で伝える
 *   - 部屋の一覧のボタンを押した後は、フォーカスを案内の文章（tabIndex -1）へ移す（押したボタンが消えても行き先がある。読まれるのは文章だけ）
 */

// ---- 固定の入力 ----

const TEXT = "ここは 1F です。受付で連絡先を案内しています。"
const PAPERS = Array.from({ length: 7 }, (_, i) => ({ title: `paper-${i + 1}`, line: `line-${i + 1}` }))
const profile = findGroup("profile")
const portfolios = findGroup("portfolios")
const SEARCHES: GuidePcProps["searches"] = [
    {
        label: "プロフィールを読む",
        command: profile.command,
        summary: "1 件見つかりました。",
        paths: [toVirtualPath(profile.url)],
    },
    {
        label: "作ったものを並べる",
        command: portfolios.command,
        summary: "2 件見つかりました。",
        paths: [`${toVirtualPath(portfolios.url)}/a`, `${toVirtualPath(portfolios.url)}/b`],
    },
]
const ROOMS: GuidePcProps["rooms"] = {
    scope: "floor",
    items: [
        { id: "profile", name: "プロフィール" },
        { id: "contact", name: "受付・連絡先" },
    ],
}
const firstFloor = findFloor("1f")
const secondFloor = findFloor("2f")

function props(overrides: Partial<GuidePcProps> = {}): GuidePcProps {
    return {
        text: TEXT,
        papers: PAPERS,
        destinations: [{ label: secondFloor.label, href: secondFloor.url }],
        rooms: ROOMS,
        searches: SEARCHES,
        activeSearch: null,
        ...overrides,
    }
}

/** A parent that owns the search state, as InfoCenter and the floor pages do. */
function ControlledGuidePc(overrides: Partial<GuidePcProps> = {}) {
    const [activeSearch, setActiveSearch] = useState<string | null>(null)
    return <GuidePc {...props({ ...overrides, activeSearch, onSearch: setActiveSearch })} />
}

const squash = (s: string | null | undefined) => (s ?? "").replace(/\s+/g, "")

function mustText(root: Element, text: string): HTMLElement {
    const el = elementWithText(root, text)
    expect(el, text).toBeDefined()
    return el!
}

/** The closest ancestor (self first) that is a DoorButton small frame. */
const doorOf = (el: Element) => el.closest<HTMLElement>(".border-ds-door")

/** Door frames whose whole text is `text`. */
const doorsWithText = (root: Element, text: string) =>
    Array.from(root.querySelectorAll<HTMLElement>(".border-ds-door")).filter((d) => d.textContent?.trim() === text)

function roomsHeading(root: Element): HTMLElement {
    const heading = Array.from(root.querySelectorAll<HTMLElement>("h3")).find((h) =>
        ["この階の部屋", "つながっている部屋"].includes(h.textContent ?? "")
    )
    expect(heading, "rooms heading").toBeDefined()
    return heading!
}

/** Door frames before the room list heading: the destination doors. */
function destinationDoors(root: Element): HTMLElement[] {
    const heading = roomsHeading(root)
    return Array.from(root.querySelectorAll<HTMLElement>(".border-ds-door")).filter((d) => precedes(d, heading))
}

function searchButton(root: Element, label: string): HTMLButtonElement {
    const found = Array.from(root.querySelectorAll<HTMLButtonElement>("button[aria-pressed]")).filter((b) =>
        b.textContent?.includes(label)
    )
    expect(found, label).toHaveLength(1)
    return found[0]
}

describe("GuidePc (static)", () => {
    it("shows the heading 「PC — 案内人」 with a small 「ボタン版」 inside it, and no long note", () => {
        const root = render(<GuidePc {...props()} />)
        const h2s = root.querySelectorAll("h2")
        expect(h2s).toHaveLength(1)
        expect(squash(h2s[0].textContent)).toContain(squash("PC — 案内人"))
        const badge = mustText(root, "ボタン版")
        expect(h2s[0].contains(badge), "badge inside the heading").toBe(true)
        expect(badge.classList.contains("text-ds-sm"), "small").toBe(true)
        const mentions = Array.from(root.querySelectorAll("*")).filter(
            (el) => el.children.length === 0 && el.textContent?.includes("ボタン版")
        )
        expect(mentions, "only the badge mentions ボタン版").toHaveLength(1)
    })

    it("shows the text as the output of $ docent, before the papers", () => {
        const root = render(<GuidePc {...props()} />)
        const prompt = mustText(root, "$ docent")
        const text = mustText(root, TEXT)
        expect(precedes(prompt, text), "$ docent before the text").toBe(true)
        expect(precedes(text, mustText(root, PAPERS[0].title)), "text before the papers").toBe(true)
    })

    it("shows the first five papers with title and line, then 「ほか 2 枚」", () => {
        const root = render(<GuidePc {...props()} />)
        const items = Array.from(root.querySelectorAll("li")).filter((li) =>
            PAPERS.some((p) => li.textContent?.includes(p.title))
        )
        expect(items).toHaveLength(5)
        for (const [i, paper] of PAPERS.slice(0, 5).entries()) {
            expect(items[i].textContent, paper.title).toContain(paper.title)
            expect(items[i].textContent, paper.line).toContain(paper.line)
        }
        for (const paper of PAPERS.slice(5)) expect(root.textContent).not.toContain(paper.title)
        const rest = mustText(root, "ほか 2 枚")
        expect(precedes(items[4], rest), "rest after the list").toBe(true)
    })

    it("does not show 「ほか」 when there are five papers or fewer", () => {
        for (const count of [5, 1, 0]) {
            const root = render(<GuidePc {...props({ papers: PAPERS.slice(0, count) })} />)
            expect(root.textContent, `${count} papers`).not.toMatch(/ほか\s*\d+\s*枚/)
        }
    })

    it("shows the destinations in order as small doors, links for href and buttons for onClick", () => {
        const root = render(
            <GuidePc
                {...props({
                    destinations: [
                        { label: firstFloor.label, href: firstFloor.url },
                        { label: "地図を開く", onClick: () => {} },
                        { label: secondFloor.label, href: secondFloor.url },
                    ],
                })}
            />
        )
        const doors = destinationDoors(root)
        expect(doors.map((d) => d.textContent?.trim())).toEqual([firstFloor.label, "地図を開く", secondFloor.label, "Contact"])
        expect(doors[0].tagName).toBe("A")
        expect(doors[0].getAttribute("href")).toBe(firstFloor.url)
        expect(doors[1].tagName).toBe("BUTTON")
        expect(doors[2].getAttribute("href")).toBe(secondFloor.url)
        expect(root.querySelectorAll(".border-ds-door-lg"), "no large doors").toHaveLength(0)
    })

    it("always ends the destinations with Contact in the accent frame, even with no destinations", () => {
        for (const destinations of [undefined, [], props().destinations]) {
            const root = render(<GuidePc {...props({ destinations })} />)
            const doors = destinationDoors(root)
            const contact = doors[doors.length - 1]
            expect(contact, "Contact door").toBeDefined()
            expect(contact.textContent?.trim()).toBe("Contact")
            expect(contact.getAttribute("href")).toBe(findGroup("contact").href)
            expect(contact.getAttribute("data-primary")).toBe("true")
            expect(contact.classList.contains("border-ds-accent")).toBe(true)
            expect(doorsWithText(root, "Contact"), "Contact once").toHaveLength(1)
            expect(precedes(mustText(root, TEXT), contact), "after the text").toBe(true)
        }
    })

    it("titles the room list by scope and shows each room as a small door button", () => {
        const cases = [
            ["floor", "この階の部屋"],
            ["room", "つながっている部屋"],
        ] as const
        for (const [scope, title] of cases) {
            const root = render(<GuidePc {...props({ rooms: { ...ROOMS, scope } })} />)
            const heading = roomsHeading(root)
            expect(heading.textContent, scope).toBe(title)
            for (const room of ROOMS.items) {
                const doors = doorsWithText(root, room.name)
                expect(doors, room.name).toHaveLength(1)
                expect(doors[0].tagName, room.name).toBe("BUTTON")
                expect(precedes(heading, doors[0]), `${room.name} after the heading`).toBe(true)
            }
        }
    })

    it("stacks the description above the $ command in each search button, as small doors, none pressed at first", () => {
        const root = render(<GuidePc {...props()} />)
        const heading = mustText(root, "探しもの")
        for (const search of SEARCHES) {
            const button = searchButton(root, search.label)
            expect(doorOf(button), `${search.label} is a small door`).toBe(button)
            expect(button.getAttribute("aria-pressed")).toBe("false")
            const label = mustText(button, search.label)
            const command = mustText(button, `$ ${search.command}`)
            const stack = label.parentElement
            expect(stack, `${search.label}: one stacked element holds the pair`).toBe(command.parentElement)
            expect(stack!.classList.contains("flex"), `${search.label}: stacked vertically`).toBe(true)
            expect(stack!.classList.contains("flex-col"), `${search.label}: stacked vertically`).toBe(true)
            expect(precedes(label, command), `${search.label}: description above the command`).toBe(true)
            expect(label.classList.contains("font-ds-prose"), "description in prose").toBe(true)
            expect(command.classList.contains("text-ds-link"), "command in link colour").toBe(true)
            expect(command.classList.contains("text-ds-sm"), "command small").toBe(true)
            expect(precedes(heading, button), "after the 探しもの heading").toBe(true)
        }
        for (const search of SEARCHES) expect(root.textContent).not.toContain(search.summary)
        expect(precedes(roomsHeading(root), heading), "rooms before 探しもの").toBe(true)
    })

    // The legacy base CSS colours bare h1-h4; the PC heading takes the ds heading scale instead.
    it("draws the PC heading with the ds heading scale", () => {
        const root = render(<GuidePc {...props()} />)
        const heading = root.querySelector("h2")!
        for (const cls of HEADING_MINOR.split(" ")) expect(heading.classList.contains(cls), cls).toBe(true)
    })

    it("announces the text with aria-live polite", () => {
        const root = render(<GuidePc {...props()} />)
        const text = mustText(root, TEXT)
        const live = text.closest("[aria-live]")
        expect(live, "a live region around the text").not.toBeNull()
        expect(live!.getAttribute("aria-live")).toBe("polite")
        expect(live!.contains(mustText(root, "$ docent")), "the region is the $ docent output").toBe(true)
    })

    it("shows a room item with href as a link door and the others as button doors", () => {
        const rooms: GuidePcProps["rooms"] = {
            scope: "floor",
            items: [
                { id: "up", name: "上の階へ — 3F", href: findFloor("3f").url },
                { id: "profile", name: "プロフィール" },
            ],
        }
        const root = render(<GuidePc {...props({ rooms })} />)
        const [link] = doorsWithText(root, "上の階へ — 3F")
        expect(link.tagName).toBe("A")
        expect(link.getAttribute("href")).toBe(findFloor("3f").url)
        expect(precedes(roomsHeading(root), link), "in the room list").toBe(true)
        expect(doorsWithText(root, "プロフィール")[0].tagName).toBe("BUTTON")
    })

    it("shows the pressed state and the result from activeSearch without a click", () => {
        const [first, second] = SEARCHES
        const root = render(<GuidePc {...props({ activeSearch: second.command })} />)
        expect(searchButton(root, first.label).getAttribute("aria-pressed")).toBe("false")
        expect(searchButton(root, second.label).getAttribute("aria-pressed")).toBe("true")
        expect(mustText(root, second.summary).classList.contains("font-bold")).toBe(true)
        for (const p of second.paths) expect(mustText(root, p).tagName, p).toBe("BUTTON")
        expect(root.textContent).not.toContain(first.summary)
    })

    it("rejects searches with the same command and rooms with the same id", () => {
        expect(() =>
            render(<GuidePc {...props({ searches: [SEARCHES[0], { ...SEARCHES[1], command: SEARCHES[0].command }] })} />)
        ).toThrow(GuidePcInputError)
        expect(() =>
            render(<GuidePc {...props({ rooms: { ...ROOMS, items: [ROOMS.items[0], { ...ROOMS.items[1], id: ROOMS.items[0].id }] } })} />)
        ).toThrow(GuidePcInputError)
        const error = new GuidePcInputError("x")
        expect(error).toBeInstanceOf(Error)
        expect(error.name).toBe("GuidePcInputError")
    })

    it("adds no decoration", () => {
        const root = render(<GuidePc {...props()} />)
        const classes = Array.from(root.querySelectorAll("[class]")).flatMap((el) => Array.from(el.classList))
        expect(classes.filter((c) => /gradient|shadow|rounded|opacity|blur/.test(c))).toEqual([])
        expect(classes.filter((c) => /^(bg|text|border)-(white|black|gray|slate|zinc|neutral|\[)/.test(c))).toEqual([])
        expect(root.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(/)
    })

    it("does not import the modules that load markdown", () => {
        const source = fs.readFileSync(path.resolve(__dirname, "../GuidePc.tsx"), "utf-8")
        const specifiers = [...source.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1])
        for (const specifier of specifiers) {
            expect(specifier).not.toMatch(/(^|\/)(skills|profile|portfolio|entries)$|\.md$/)
        }
    })

    it("takes the Contact label and destination from one shared definition", () => {
        for (const file of ["../GuidePc.tsx", "../../../app/page.tsx"]) {
            const source = fs.readFileSync(path.resolve(__dirname, file), "utf-8")
            expect(source, file).not.toMatch(/["'>]\s*Contact\s*["'<]/)
            expect(source, file).not.toContain('findGroup("contact")')
        }
    })
})

describe("GuidePc (interactive)", () => {
    let container: HTMLDivElement
    let root: Root

    beforeEach(() => {
        vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true)
        container = document.createElement("div")
        document.body.append(container)
        root = createRoot(container)
    })

    afterEach(async () => {
        await act(async () => root.unmount())
        container.remove()
        vi.unstubAllGlobals()
    })

    const click = async (el: HTMLElement) => act(async () => el.click())

    it("calls a destination's onClick once when its door is pressed", async () => {
        const onClick = vi.fn()
        await act(async () =>
            root.render(<GuidePc {...props({ destinations: [{ label: "地図を開く", onClick }] })} />)
        )
        await click(doorsWithText(container, "地図を開く")[0])
        expect(onClick).toHaveBeenCalledTimes(1)
    })

    it("calls onSelect once with the room id when a room button is pressed", async () => {
        const onSelect = vi.fn()
        await act(async () => root.render(<GuidePc {...props({ onSelect })} />))
        await click(doorsWithText(container, ROOMS.items[1].name)[0])
        expect(onSelect).toHaveBeenCalledTimes(1)
        expect(onSelect).toHaveBeenCalledWith(ROOMS.items[1].id)
    })

    it("does not throw when a room is pressed without onSelect", async () => {
        await act(async () => root.render(<GuidePc {...props()} />))
        await click(doorsWithText(container, ROOMS.items[0].name)[0])
        expect(doorsWithText(container, ROOMS.items[0].name)).toHaveLength(1)
    })

    it("calls onSearch with the command and leaves the pressed state to the parent", async () => {
        const onSearch = vi.fn()
        await act(async () => root.render(<GuidePc {...props({ onSearch })} />))
        const [first] = SEARCHES

        await click(searchButton(container, first.label))
        expect(onSearch).toHaveBeenCalledTimes(1)
        expect(onSearch).toHaveBeenCalledWith(first.command)
        // Without a new activeSearch from the parent, nothing is pressed and no result is shown
        expect(searchButton(container, first.label).getAttribute("aria-pressed")).toBe("false")
        expect(container.textContent).not.toContain(first.summary)
    })

    it("follows activeSearch changes from the parent in the same component", async () => {
        const [first, second] = SEARCHES
        await act(async () => root.render(<GuidePc {...props({ activeSearch: first.command })} />))
        const firstButton = searchButton(container, first.label)
        expect(firstButton.getAttribute("aria-pressed")).toBe("true")
        expect(container.textContent).toContain(first.summary)

        await act(async () => root.render(<GuidePc {...props({ activeSearch: second.command })} />))
        expect(searchButton(container, first.label), "same button element").toBe(firstButton)
        expect(firstButton.getAttribute("aria-pressed")).toBe("false")
        expect(searchButton(container, second.label).getAttribute("aria-pressed")).toBe("true")
        expect(container.textContent).not.toContain(first.summary)
        expect(container.textContent).toContain(second.summary)

        await act(async () => root.render(<GuidePc {...props({ activeSearch: null })} />))
        expect(container.querySelectorAll('button[aria-pressed="true"]')).toHaveLength(0)
        expect(container.textContent).not.toContain(second.summary)
    })

    it("shows the result of the pressed search and moves it when another search is pressed", async () => {
        await act(async () => root.render(<ControlledGuidePc />))
        const [first, second] = SEARCHES
        const commandCount = (command: string) =>
            Array.from(container.querySelectorAll("*")).filter(
                (el) => el.children.length === 0 && el.textContent === `$ ${command}`
            ).length

        expect(commandCount(first.command), "only in the button before pressing").toBe(1)

        await click(searchButton(container, first.label))
        expect(searchButton(container, first.label).getAttribute("aria-pressed")).toBe("true")
        expect(searchButton(container, second.label).getAttribute("aria-pressed")).toBe("false")
        expect(commandCount(first.command), "the result repeats the command").toBe(2)
        expect(mustText(container, first.summary).classList.contains("font-bold"), "summary in bold").toBe(true)
        for (const p of first.paths) expect(mustText(container, p).tagName, p).toBe("BUTTON")
        expect(container.textContent).not.toContain(second.summary)

        await click(searchButton(container, second.label))
        expect(searchButton(container, first.label).getAttribute("aria-pressed")).toBe("false")
        expect(searchButton(container, second.label).getAttribute("aria-pressed")).toBe("true")
        expect(commandCount(first.command)).toBe(1)
        expect(commandCount(second.command)).toBe(2)
        expect(container.textContent).not.toContain(first.summary)
        for (const p of first.paths) expect(elementWithText(container, p), p).toBeUndefined()
        for (const p of second.paths) expect(mustText(container, p).tagName, p).toBe("BUTTON")
        expect(precedes(searchButton(container, second.label), mustText(container, second.summary))).toBe(true)
    })

    it("moves the focus to the output frame after a room button is pressed, even when the button goes away", async () => {
        function Parent() {
            const [rooms, setRooms] = useState<GuidePcProps["rooms"]>(ROOMS)
            const [text, setText] = useState(TEXT)
            return (
                <GuidePc
                    {...props({
                        text,
                        rooms,
                        onSelect: (id) => {
                            setText(`selected ${id}`)
                            setRooms({ scope: "room", items: ROOMS.items.filter((room) => room.id !== id) })
                        },
                    })}
                />
            )
        }
        await act(async () => root.render(<Parent />))
        const pressed = doorsWithText(container, ROOMS.items[0].name)[0]
        pressed.focus()
        await click(pressed)

        expect(doorsWithText(container, ROOMS.items[0].name), "the pressed button is gone").toHaveLength(0)
        const focused = document.activeElement as HTMLElement | null
        expect(focused, "focus stays inside the PC").not.toBe(document.body)
        expect(container.contains(focused)).toBe(true)
        expect(focused!.getAttribute("tabindex")).toBe("-1")
        expect(focused!.tagName).toBe("P")
        expect(focused!.textContent).toBe(`selected ${ROOMS.items[0].id}`)
        expect(focused!.closest("[aria-live]"), "the text is still announced on other changes").not.toBeNull()
        for (const cls of FOCUS_RING.split(" ")) expect(focused!.classList.contains(cls), cls).toBe(true)
    })

    it("shows the result paths as underlined text buttons and calls onPick once with the path", async () => {
        const onPick = vi.fn()
        const search = SEARCHES[1]
        await act(async () => root.render(<GuidePc {...props({ onPick, activeSearch: search.command })} />))

        const pathButton = mustText(container, search.paths[1])
        expect(pathButton.tagName).toBe("BUTTON")
        expect(pathButton.getAttribute("type")).toBe("button")
        expect(pathButton.classList.contains("underline"), "underlined").toBe(true)
        expect(pathButton.classList.contains("text-ds-link"), "link colour").toBe(true)
        expect(doorOf(pathButton), "not a door").toBeNull()
        expect(pathButton.closest("a"), "not a link").toBeNull()

        await click(pathButton)
        expect(onPick).toHaveBeenCalledTimes(1)
        expect(onPick).toHaveBeenCalledWith(search.paths[1])
    })
})
