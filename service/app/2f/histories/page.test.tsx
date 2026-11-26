// @vitest-environment jsdom
import * as React from "react"
import type { Metadata } from "next"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { getEntries } from "@/lib/building/entries"
import { findGroup } from "@/lib/building/floors"
import { getParsedProfile } from "@/lib/profile"

/**
 * Histories page contract tests (/2f/histories).
 *
 * From the top: the `$ ls -tr ~/2f/histories` command, the h1 「経歴」, then the
 * list. No description under the heading and no peek band. Every career item of
 * docs/profile.md is listed oldest first, each with its two-digit number (the same
 * number as the getEntries() path ~/2f/histories/<nn>-...), its heading and all
 * of its bullets. lib/profile is not mocked: the real profile.md is read.
 */

vi.mock("next/link", () => ({
    default: ({ children, ...props }: any) => (
        <a data-next-link="" {...props}>
            {children}
        </a>
    ),
}))

import * as historiesModule from "@/app/2f/histories/page"
import HistoriesPage from "@/app/2f/histories/page"

const group = findGroup("histories")

const OLDEST_FIRST = [
    "組み込み開発（車載ソフトウェア）",
    "リバースエンジニアリング（車載ソフトウェア）",
    "Web開発（人材系）",
    "MLOps（推薦系）",
    "AIドキュメント検索サービス",
]

async function renderHistories(): Promise<HTMLElement> {
    const html = renderToStaticMarkup(await HistoriesPage())
    const doc = new DOMParser().parseFromString(html, "text/html")
    const mains = doc.querySelectorAll("main")
    expect(mains).toHaveLength(1)
    return mains[0] as HTMLElement
}

function elementsOf(main: HTMLElement): Element[] {
    return Array.from(main.querySelectorAll("*"))
}

function commandLine(main: HTMLElement): Element {
    const found = elementsOf(main).filter((el) => el.tagName === "P" && el.textContent === `$ ${group.command}`)
    expect(found).toHaveLength(1)
    return found[0]
}

function itemsOf(main: HTMLElement): Element[] {
    const lists = main.querySelectorAll("ol")
    expect(lists).toHaveLength(1)
    return Array.from(lists[0].children).filter((el) => el.tagName === "LI")
}

/** Whether some element inside `item` has `text` as its whole text. */
function hasExactText(item: Element, text: string): boolean {
    return Array.from(item.querySelectorAll("*")).some((el) => el.textContent?.trim() === text)
}

describe("histories page /2f/histories frame", () => {
    it("shows the ls -tr command from FLOORS first, with no peek band before it", async () => {
        const main = await renderHistories()
        expect(group.command).toBe("ls -tr ~/2f/histories")
        const command = commandLine(main)
        const elements = elementsOf(main)
        const before = elements.slice(0, elements.indexOf(command))
        for (const el of before) {
            expect(el.contains(command), `${el.tagName}.${el.className}`).toBe(true)
        }
    })

    it("has one h1 with the group name, right after the command", async () => {
        const main = await renderHistories()
        const headings = main.querySelectorAll("h1")
        expect(headings).toHaveLength(1)
        expect(headings[0].textContent).toBe(group.name)
        expect(group.name).toBe("経歴")
        expect(commandLine(main).nextElementSibling).toBe(headings[0])
    })

    it("starts the body with the list, with no description between the heading and it", async () => {
        const main = await renderHistories()
        const elements = elementsOf(main)
        const h1 = main.querySelector("h1")!
        const ol = main.querySelector("ol")
        expect(ol, "list").not.toBeNull()
        const between = elements.slice(elements.indexOf(h1) + 1, elements.indexOf(ol!))
        for (const el of between) {
            expect(el.tagName, el.textContent ?? "").toBe("DIV")
            expect(el.contains(ol), `${el.tagName}.${el.className}`).toBe(true)
        }
    })
})

describe("histories page /2f/histories list", () => {
    it("lists every career item of profile.md, oldest first", async () => {
        const main = await renderHistories()
        const parsed = await getParsedProfile()
        const items = itemsOf(main)

        expect(items).toHaveLength(parsed.career.length)
        expect(items).toHaveLength(OLDEST_FIRST.length)
        OLDEST_FIRST.forEach((role, index) => {
            expect(hasExactText(items[index], role), `${index}: ${role}`).toBe(true)
        })
    })

    it("shows every bullet of each career item", async () => {
        const main = await renderHistories()
        const oldestFirst = [...(await getParsedProfile()).career].reverse()
        const items = itemsOf(main)

        oldestFirst.forEach((career, index) => {
            expect(career.bullets.length, career.role).toBeGreaterThan(0)
            const bullets = Array.from(items[index].querySelectorAll("ul > li")).map((li) => li.textContent?.trim())
            expect(bullets, career.role).toEqual(career.bullets)
        })
    })

    it("numbers the items 01 to 05 with the same numbers as the getEntries() paths", async () => {
        const main = await renderHistories()
        const items = itemsOf(main)
        const histories = (await getEntries()).filter((entry) => entry.group === "histories")

        items.forEach((item, index) => {
            const number = String(index + 1).padStart(2, "0")
            const role = OLDEST_FIRST[index]
            expect(hasExactText(item, number), `${role} has ${number}`).toBe(true)

            const entry = histories.filter((candidate) => candidate.title === role)
            expect(entry, role).toHaveLength(1)
            expect(entry[0].path.startsWith(`~/2f/histories/${number}-`), entry[0].path).toBe(true)
        })
    })

    it("adds no decoration: no icons, inline styles, rounded corners, shadows or translucency", async () => {
        const main = await renderHistories()
        expect(main.querySelector("svg"), "no icons").toBeNull()
        expect(main.querySelector("img"), "no images").toBeNull()
        expect(main.querySelector("[style]"), "no inline styles").toBeNull()
        const banned = elementsOf(main)
            .flatMap((el) => Array.from(el.classList))
            .filter((c) => /rounded|shadow|gradient|backdrop|opacity|animate|\/\d+$|\[/.test(c))
        expect(banned).toEqual([])
    })
})

describe("histories page /2f/histories metadata", () => {
    it("exports the group name as title, a description and the 2F canonical URL", async () => {
        const page = historiesModule as { metadata?: Metadata; generateMetadata?: () => Metadata | Promise<Metadata> }
        const metadata = page.metadata ?? (await page.generateMetadata?.())
        expect(metadata?.title).toBe(group.name)
        expect(typeof metadata?.description).toBe("string")
        expect((metadata?.description as string).length).toBeGreaterThan(0)
        expect(String(metadata?.alternates?.canonical)).toMatch(/\/2f\/histories$/)
    })
})
