// @vitest-environment jsdom
import fs from "node:fs"
import path from "node:path"
import * as React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { afterAll, describe, expect, it, vi } from "vitest"

import { elementWithText, precedes } from "@/components/ds/__tests__/render"
import { FLOORS, findGroup } from "@/lib/building/floors"

vi.hoisted(() => {
    // SITE_URL is evaluated when @/lib/seo is imported, so pin the default origin first.
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", undefined)
})

// next/link -> plain anchor so href assertions work under a static render.
vi.mock("next/link", () => ({
    default: ({ children, ...props }: React.ComponentProps<"a">) => <a {...props}>{children}</a>,
}))

import TopPage, * as pageModule from "@/app/page"

/**
 * Home contract tests (/).
 *
 * From the top: the h1 "onclimb 山荘", then the small primary Contact door with
 * one sentence beside it, then one text link per floor from the roof down to B1.
 * Nothing else is shown: no prose under the heading, no `$ command` line.
 */

const ORIGIN_ROOT = "https://onc-limb.com/"
const DESCRIPTION =
    "ソフトウェアアーキテクトの視点で、設計から実装・運用まで担うフルスタックエンジニア onclimb のポートフォリオ。"
const TITLE = "onclimb 山荘"
const CONTACT_NOTE = "お仕事のご相談、技術的なご相談・壁打ちを受け付けています"
const FLOOR_ORDER = ["/rf", "/3f", "/2f", "/1f", "/b1"]
const floorText = (url: string): string => {
    const floor = FLOORS.find((f) => f.url === url)
    if (!floor) throw new Error(`No floor for ${url}`)
    return `${floor.label} ${floor.name}`
}

async function renderMain(): Promise<HTMLElement> {
    const html = renderToStaticMarkup(await TopPage())
    const doc = new DOMParser().parseFromString(html, "text/html")
    const main = doc.querySelector("main")
    expect(main).not.toBeNull()
    return main as HTMLElement
}

function contactLink(main: HTMLElement): HTMLAnchorElement {
    const links = Array.from(main.querySelectorAll("a")).filter((a) => a.textContent === "Contact")
    expect(links).toHaveLength(1)
    return links[0]
}

function floorLinks(main: HTMLElement): HTMLAnchorElement[] {
    const floorUrls = FLOORS.map((floor) => floor.url)
    return Array.from(main.querySelectorAll("a")).filter((a) => floorUrls.includes(a.getAttribute("href") ?? ""))
}

afterAll(() => {
    vi.unstubAllEnvs()
})

describe("home heading", () => {
    it("has exactly one h1 reading the lodge name", async () => {
        const main = await renderMain()
        const headings = main.querySelectorAll("h1")

        expect(headings).toHaveLength(1)
        expect(headings[0].textContent).toBe(TITLE)
    })
})

describe("home Contact door", () => {
    it("is a small primary door linking to the contact group's href", async () => {
        const main = await renderMain()
        const link = contactLink(main)

        expect(link.getAttribute("href")).toBe(findGroup("contact").href)
        expect(link.getAttribute("data-primary")).toBe("true")
    })

    it("has the contact sentence beside it, in the same parent element", async () => {
        const main = await renderMain()
        const link = contactLink(main)
        const note = elementWithText(main, CONTACT_NOTE)

        expect(note).toBeDefined()
        expect(note?.parentElement).toBe(link.parentElement)
    })
})

describe("home floor links", () => {
    it("links every floor from the roof down to B1, labelled '<label> <name>'", async () => {
        const main = await renderMain()
        const links = floorLinks(main)

        expect(links.map((a) => a.getAttribute("href"))).toEqual(FLOOR_ORDER)
        expect(links.map((a) => a.textContent)).toEqual(FLOOR_ORDER.map(floorText))
    })

    it("has no links other than Contact and the five floors", async () => {
        const main = await renderMain()

        expect(main.querySelectorAll("a")).toHaveLength(1 + FLOOR_ORDER.length)
    })

    it("does not reorder the shared FLOORS definition", async () => {
        await renderMain()

        expect(FLOORS.map((floor) => floor.url)).toEqual(["/b1", "/1f", "/2f", "/3f", "/rf"])
    })
})

describe("home order and content", () => {
    it("places the h1 before Contact, and Contact before the first floor link", async () => {
        const main = await renderMain()
        const heading = main.querySelector("h1") as HTMLElement
        const link = contactLink(main)
        const [firstFloor] = floorLinks(main)

        expect(precedes(heading, link)).toBe(true)
        expect(precedes(link, firstFloor)).toBe(true)
    })

    it("shows only the title, Contact, its sentence and the floor names", async () => {
        const main = await renderMain()
        main.querySelectorAll("script").forEach((script) => script.remove())

        expect(main.textContent).toBe([TITLE, "Contact", CONTACT_NOTE, ...FLOOR_ORDER.map(floorText)].join(""))
    })

    it("shows no `$ command` line", async () => {
        const main = await renderMain()
        const lines = Array.from(main.querySelectorAll("*")).map((el) => el.textContent ?? "")

        expect(lines.some((text) => text.trimStart().startsWith("$ "))).toBe(false)
    })
})

describe("home source", () => {
    it("imports neither lib/stats nor components/animations", () => {
        const source = fs.readFileSync(path.resolve(__dirname, "page.tsx"), "utf-8")

        expect(source).not.toContain("@/lib/stats")
        expect(source).not.toContain("@/components/animations")
    })

    it("is no longer forced to render dynamically", () => {
        expect("dynamic" in pageModule).toBe(false)
    })

    it("has removed the stats module and its test", () => {
        const root = path.resolve(__dirname, "..")

        expect(fs.existsSync(path.join(root, "lib/stats.ts"))).toBe(false)
        expect(fs.existsSync(path.join(root, "lib/__tests__/stats.test.ts"))).toBe(false)
    })

    it("has removed the unused home view model and its test", () => {
        expect(fs.existsSync(path.resolve(__dirname, "home-view-model.ts"))).toBe(false)
        expect(fs.existsSync(path.resolve(__dirname, "home-view-model.test.ts"))).toBe(false)
    })
})

describe("home metadata and structured data", () => {
    it("exports metadata for the root path", () => {
        const { metadata } = pageModule

        expect(metadata.title).toBe("Home")
        expect(metadata.description).toBe(DESCRIPTION)
        expect(metadata.alternates?.canonical).toBe(ORIGIN_ROOT)
        expect(metadata.openGraph).toMatchObject({
            title: "Home | onclimb",
            description: DESCRIPTION,
            url: ORIGIN_ROOT,
        })
    })

    it("embeds WebSite JSON-LD", async () => {
        const main = await renderMain()
        const scripts = main.querySelectorAll('script[type="application/ld+json"]')

        expect(scripts).toHaveLength(1)
        expect(JSON.parse(scripts[0].textContent ?? "")).toEqual({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "onclimb",
            url: ORIGIN_ROOT,
            description: DESCRIPTION,
            inLanguage: "ja-JP",
        })
    })
})
