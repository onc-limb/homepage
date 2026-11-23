// @vitest-environment jsdom
import fs from "node:fs"
import path from "node:path"
import * as React from "react"
import type { Metadata } from "next"
import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { findFloor, findGroup } from "@/lib/building/floors"
import { absoluteUrl } from "@/lib/seo"

/**
 * Profile page contract tests (/1f/profile).
 *
 * From the top: the `$ man onclimb` command, the h1 「プロフィール」, then five
 * man-page sections NAME / SYNOPSIS / DESCRIPTION / NOTES / SEE ALSO.
 * NOTES holds 関心・学習・資格, SEE ALSO links to the histories, the portfolios
 * and the rooftop. The career body and the old design parts are not shown.
 */

vi.mock("next/link", () => ({
    default: ({ children, ...props }: any) => (
        <a data-next-link="" {...props}>
            {children}
        </a>
    ),
}))

const mocks = vi.hoisted(() => ({
    getProfile: vi.fn(),
    getParsedProfile: vi.fn(),
}))
vi.mock("@/lib/profile", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@/lib/profile")>()
    return { ...actual, getProfile: mocks.getProfile, getParsedProfile: mocks.getParsedProfile }
})

import * as profileModule from "@/app/1f/profile/page"
import ProfilePage from "@/app/1f/profile/page"

const group = findGroup("profile")
const SERVICE_ROOT = path.resolve(__dirname, "../../..")

const FIXTURE = {
    name: "Fixture name",
    title: "Fixture role",
    intro: "Fixture introduction",
    quote: "Fixture quote",
    career: { role: "Fixture career", bullet: "Fixture work" },
    interest: { title: "Fixture interest", description: "Fixture interest description" },
    learning: { title: "Fixture learning", description: "Fixture learning description" },
    cert: { title: "Fixture certification", year: "2025" },
}

beforeEach(() => {
    mocks.getProfile.mockResolvedValue({
        data: { name: FIXTURE.name, title: FIXTURE.title, avatar: "/MainLogo.png", github: "https://github.com/example" },
        content: "",
    })
    mocks.getParsedProfile.mockResolvedValue({
        selfIntroduction: [
            { type: "paragraph", text: FIXTURE.intro },
            { type: "pullQuote", text: FIXTURE.quote },
        ],
        career: [{ role: FIXTURE.career.role, bullets: [FIXTURE.career.bullet] }],
        interests: [FIXTURE.interest],
        learning: [FIXTURE.learning],
        certs: [FIXTURE.cert],
    })
})

async function renderProfile(): Promise<HTMLElement> {
    const html = renderToStaticMarkup(await ProfilePage())
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

function sectionOf(main: HTMLElement, heading: string): Element {
    const found = Array.from(main.querySelectorAll("section")).filter(
        (section) => section.querySelector("h2")?.textContent === heading,
    )
    expect(found, heading).toHaveLength(1)
    return found[0]
}

describe("profile page /1f/profile frame", () => {
    it("shows the man onclimb command from FLOORS first, with no peek band before it", async () => {
        const main = await renderProfile()
        expect(group.command).toBe("man onclimb")
        const command = commandLine(main)
        const elements = elementsOf(main)
        const before = elements.slice(0, elements.indexOf(command))
        for (const el of before) {
            expect(el.contains(command), `${el.tagName}.${el.className}`).toBe(true)
        }
    })

    it("has one h1 with the group name, right after the command", async () => {
        const main = await renderProfile()
        const headings = main.querySelectorAll("h1")
        expect(headings).toHaveLength(1)
        expect(headings[0].textContent).toBe(group.name)
        expect(group.name).toBe("プロフィール")
        expect(commandLine(main).nextElementSibling).toBe(headings[0])
    })

    it("has the five man-page sections in order", async () => {
        const main = await renderProfile()
        const headings = Array.from(main.querySelectorAll("section > h2")).map((h2) => h2.textContent)
        expect(headings).toEqual(["NAME", "SYNOPSIS", "DESCRIPTION", "NOTES", "SEE ALSO"])
    })
})

describe("profile page /1f/profile sections", () => {
    it("shows the name and the job title in NAME", async () => {
        const main = await renderProfile()
        const text = sectionOf(main, "NAME").textContent ?? ""
        expect(text).toContain(FIXTURE.name)
        expect(text).toContain(FIXTURE.title)
    })

    it("shows a one-line introduction in SYNOPSIS, apart from NAME and DESCRIPTION", async () => {
        const main = await renderProfile()
        const synopsis = sectionOf(main, "SYNOPSIS")
        const body = (synopsis.textContent ?? "").replace("SYNOPSIS", "").trim()
        expect(body.length).toBeGreaterThan(0)
        expect(body).not.toContain(FIXTURE.intro)
        expect(body).not.toContain(FIXTURE.name)
    })

    it("shows the self introduction paragraphs and the pull quote in DESCRIPTION", async () => {
        const main = await renderProfile()
        const text = sectionOf(main, "DESCRIPTION").textContent ?? ""
        expect(text).toContain(FIXTURE.intro)
        expect(text).toContain(FIXTURE.quote)
    })

    it("shows the interests, the learning and the certifications in NOTES", async () => {
        const main = await renderProfile()
        const notes = sectionOf(main, "NOTES")
        const text = notes.textContent ?? ""
        for (const value of [
            "関心",
            FIXTURE.interest.title,
            FIXTURE.interest.description,
            "学習",
            FIXTURE.learning.title,
            FIXTURE.learning.description,
            "資格",
            FIXTURE.cert.title,
            FIXTURE.cert.year,
        ]) {
            expect(text, value).toContain(value)
        }
        const subheadings = Array.from(notes.querySelectorAll("h3")).map((h3) => h3.textContent)
        expect(subheadings).toEqual(["関心", "学習", "資格"])
    })

    it("links to the histories, the portfolios and the rooftop in SEE ALSO", async () => {
        const main = await renderProfile()
        const hrefs = Array.from(sectionOf(main, "SEE ALSO").querySelectorAll("a")).map((a) => a.getAttribute("href"))
        expect(hrefs).toEqual([findGroup("histories").href, findGroup("portfolios").href, findFloor("rf").url])
        expect(hrefs[0]).toBe("/2f/histories")
        expect(hrefs[2]).toBe("/rf")
    })
})

describe("profile page /1f/profile removed parts", () => {
    it("does not show the career body or its period labels", async () => {
        const main = await renderProfile()
        const text = main.textContent ?? ""
        expect(text).not.toContain(FIXTURE.career.role)
        expect(text).not.toContain(FIXTURE.career.bullet)
        for (const label of ["CURRENT", "PRIOR", "START"]) {
            expect(text, label).not.toContain(label)
        }
    })

    it("drops the identity card, the breadcrumb, the icons and the link to the skills", async () => {
        const main = await renderProfile()
        expect(main.querySelector("img"), "no avatar image").toBeNull()
        expect(main.querySelector("svg"), "no icons").toBeNull()
        expect(main.querySelector("[style]"), "no inline styles").toBeNull()
        expect(main.textContent).not.toContain("onclimb/profile")
        expect(main.textContent).not.toContain("使ってきた技術スタックを見る")
        expect(main.querySelector('a[href="/skills"]')).toBeNull()
    })

    it("adds no decoration: no rounded corners, shadows, translucency or animation", async () => {
        const main = await renderProfile()
        const banned = elementsOf(main)
            .flatMap((el) => Array.from(el.classList))
            .filter((c) => /rounded|shadow|gradient|backdrop|opacity|animate|\/\d+$|\[/.test(c))
        expect(banned).toEqual([])
    })

    it("does not import components/animations anywhere under app/1f/profile", () => {
        const dir = path.join(SERVICE_ROOT, "app/1f/profile")
        const files = fs
            .readdirSync(dir, { recursive: true, encoding: "utf-8" })
            .filter((file) => /\.(tsx?|jsx?)$/.test(file) && !/\.test\./.test(file))
        expect(files).toContain("page.tsx")
        for (const file of files) {
            const source = fs.readFileSync(path.join(dir, file), "utf-8")
            expect(source, file).not.toMatch(/components\/animations/)
        }
    })
})

describe("profile page /1f/profile structured data and metadata", () => {
    it("keeps the Person JSON-LD with the 1F URL", async () => {
        const html = renderToStaticMarkup(await ProfilePage())
        const doc = new DOMParser().parseFromString(html, "text/html")
        const scripts = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'))
        const people = scripts
            .map((script) => JSON.parse(script.textContent ?? "{}"))
            .filter((data) => data["@type"] === "Person")
        expect(people).toHaveLength(1)
        expect(people[0].name).toBe(FIXTURE.name)
        expect(people[0].jobTitle).toBe(FIXTURE.title)
        expect(people[0].url).toBe(absoluteUrl(group.url))
        expect(people[0].url).toBe(absoluteUrl("/1f/profile"))
    })

    it("exports the group name as title, a description and the 1F canonical URL", async () => {
        const page = profileModule as { metadata?: Metadata; generateMetadata?: () => Metadata | Promise<Metadata> }
        const metadata = page.metadata ?? (await page.generateMetadata?.())
        expect(metadata?.title).toBe(group.name)
        expect(typeof metadata?.description).toBe("string")
        expect((metadata?.description as string).length).toBeGreaterThan(0)
        expect(String(metadata?.alternates?.canonical)).toMatch(/\/1f\/profile$/)
    })
})
