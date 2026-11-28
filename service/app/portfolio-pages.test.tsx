// @vitest-environment jsdom
import fs from "node:fs"
import path from "node:path"
import * as React from "react"
import type { Metadata } from "next"
import type { ReactElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { PROSE_BODY } from "@/components/ds/prose-styles"
import { findGroup } from "@/lib/building/floors"
import { getProjects, listProjects, projectDate, projectHref, type Project } from "@/lib/portfolio"
import { absoluteUrl } from "@/lib/seo"

/**
 * Portfolio pages (/3f/portfolios and /3f/portfolios/[id]) contract tests.
 *
 * List: from the top the `$ git log --oneline ~/3f/portfolios` command, the h1
 * with the group name, then (no description) a LogList with every project,
 * newest first: date (YYYY-MM-DD of updatedAt), id, title and the one-line
 * description, each row linking to the detail page.
 * Detail: the `$ cat ~/3f/portfolios/<id>.md` command, the h1 with the title,
 * then (no description) a KeyValue with 期間 / 役割 / 技術 / ハイライト (and
 * リンク when the md has links), the whole md body rendered by Prose, the
 * architecture diagram for portfolio-site only, and at the end the PagerDoors
 * in list order. The BreadcrumbList and CreativeWork JSON-LD use the new URLs.
 * The route resolves the project and owns the 404.
 *
 * lib/portfolio reads the real docs/portfolio md (vitest loads .md as raw text).
 */

vi.mock("next/link", () => ({
    default: ({ children, ...props }: any) => (
        <a data-next-link="" {...props}>
            {children}
        </a>
    ),
}))

import PortfolioListPage, * as listModule from "@/app/3f/portfolios/page"
import PortfolioDetailRoute, * as detailModule from "@/app/3f/portfolios/[id]/page"

type Params = { params: Promise<{ id: string }> }

const renderList = PortfolioListPage as unknown as () => ReactElement | Promise<ReactElement>
const renderDetail = PortfolioDetailRoute as unknown as (props: Params) => ReactElement | Promise<ReactElement>
const detail = detailModule as unknown as {
    generateStaticParams: () => Array<{ id: string }> | Promise<Array<{ id: string }>>
    generateMetadata: (props: Params) => Metadata | Promise<Metadata>
}
const list = listModule as unknown as { metadata?: Metadata }

const SERVICE_ROOT = path.resolve(__dirname, "..")
const group = findGroup("portfolios")
const params = (id: string): Params => ({ params: Promise.resolve({ id }) })

const PROJECTS = getProjects()
const LISTED = listProjects(PROJECTS)
const byId = (id: string): Project => PROJECTS.find((project) => project.id === id)!

/** The list order of the real md: newest updatedAt first, md order for equal timestamps. */
const LIST_ORDER = ["noboru-note", "climbinsight", "iron-legion", "onclimb-industries", "portfolio-site"]

const NOT_FOUND_DIGEST = "NEXT_HTTP_ERROR_FALLBACK;404"

function parse(html: string): Document {
    return new DOMParser().parseFromString(html, "text/html")
}

function mainOf(doc: Document): HTMLElement {
    const mains = doc.querySelectorAll("main")
    expect(mains).toHaveLength(1)
    return mains[0] as HTMLElement
}

async function renderListMain(): Promise<HTMLElement> {
    return mainOf(parse(renderToStaticMarkup(await renderList())))
}

async function renderDetailDoc(id: string): Promise<Document> {
    return parse(renderToStaticMarkup(await renderDetail(params(id))))
}

async function renderDetailMain(id: string): Promise<HTMLElement> {
    return mainOf(await renderDetailDoc(id))
}

async function thrownBy(id: string): Promise<{ digest?: unknown }> {
    try {
        renderToStaticMarkup(await renderDetail(params(id)))
    } catch (error) {
        return error as { digest?: unknown }
    }
    throw new Error(`/3f/portfolios/${id} rendered instead of throwing`)
}

const elementsOf = (root: Element) => Array.from(root.querySelectorAll("*"))

/** Asserts that everything between `from` and `to` in document order is an ancestor of `to`. */
function expectNothingBetween(root: Element, from: Element, to: Element) {
    const elements = elementsOf(root)
    for (const el of elements.slice(elements.indexOf(from) + 1, elements.indexOf(to))) {
        expect(el.contains(to), `${el.tagName}.${el.className}: ${el.textContent}`).toBe(true)
    }
}

/** The command paragraph and the h1 right after it. */
function headOf(main: HTMLElement, command: string) {
    const found = elementsOf(main).filter((el) => el.tagName === "P" && el.textContent === command)
    expect(found, command).toHaveLength(1)
    const headings = main.querySelectorAll("h1")
    expect(headings).toHaveLength(1)
    expect(found[0].nextElementSibling).toBe(headings[0])
    return { command: found[0], h1: headings[0] }
}

/** [visible text, href] of each door inside the pager nav, in order. */
function doors(main: HTMLElement): Array<[string, string | null]> {
    const nav = main.querySelector('nav[aria-label="前後のページ"]')
    expect(nav, "pager nav").not.toBeNull()
    return Array.from(nav!.querySelectorAll("a")).map((a) => [(a.textContent ?? "").trim(), a.getAttribute("href")])
}

/** The element rendered by Prose (it carries exactly the shared prose body classes). */
function proseOf(main: HTMLElement): Element {
    const found = elementsOf(main).filter((el) => el.getAttribute("class") === PROSE_BODY)
    expect(found, "Prose body").toHaveLength(1)
    return found[0]
}

/** A heading's text without its decorative `#` marker (aria-hidden). */
function headingText(heading: Element): string {
    const copy = heading.cloneNode(true) as Element
    copy.querySelectorAll('[aria-hidden="true"]').forEach((marker) => marker.remove())
    return (copy.textContent ?? "").trim()
}

/** Headings of an md body as [level, text], outside the frontmatter (the body has no code fences). */
function mdHeadings(body: string): Array<[number, string]> {
    return Array.from(body.matchAll(/^(#{1,6})\s+(.+?)\s*$/gm)).map((m) => [m[1].length, m[2]])
}

function jsonLdOf(doc: Document): Array<Record<string, any>> {
    return Array.from(doc.querySelectorAll('script[type="application/ld+json"]')).flatMap((script) => {
        const data = JSON.parse(script.textContent ?? "null")
        return Array.isArray(data) ? data : [data]
    })
}

const DECORATION = /rounded|shadow|gradient|backdrop|opacity|animate|transition|translate|\/\d+$|\[/

describe("portfolio list page", () => {
    it("shows the git log command from FLOORS, then the group name as the only h1", async () => {
        const main = await renderListMain()
        const { h1 } = headOf(main, `$ ${group.command}`)
        expect(group.command).toBe("git log --oneline ~/3f/portfolios")
        expect(h1.textContent).toBe(group.name)
    })

    it("puts nothing before the command (no peek window yet)", async () => {
        const main = await renderListMain()
        const { command } = headOf(main, `$ ${group.command}`)
        const elements = elementsOf(main)
        for (const el of elements.slice(0, elements.indexOf(command))) {
            expect(el.contains(command), `${el.tagName}.${el.className}`).toBe(true)
        }
    })

    it("starts the body with the log list, with no description between the h1 and it", async () => {
        const main = await renderListMain()
        const { h1 } = headOf(main, `$ ${group.command}`)
        const ul = main.querySelector("ul")
        expect(ul, "LogList").not.toBeNull()
        expectNothingBetween(main, h1, ul!)
    })

    it("lists every project once, newest first, each row linking to its detail page", async () => {
        const main = await renderListMain()
        const rows = Array.from(main.querySelector("ul")!.children)
        expect(rows.map((row) => row.tagName)).toEqual(PROJECTS.map(() => "LI"))
        expect(rows).toHaveLength(5)

        const hrefs = rows.map((row) => {
            const links = row.querySelectorAll("a")
            expect(links, row.textContent ?? "").toHaveLength(1)
            return links[0].getAttribute("href")
        })
        expect(hrefs).toEqual(LIST_ORDER.map((id) => `/3f/portfolios/${id}`))
        expect(hrefs).toEqual(LISTED.map(projectHref))
    })

    it("shows the date, the id, the title and the one-line description in each row", async () => {
        const main = await renderListMain()
        const links = Array.from(main.querySelectorAll("ul > li > a"))
        links.forEach((a, i) => {
            const project = LISTED[i]
            const texts = elementsOf(a).map((el) => el.textContent)
            expect(projectDate(project)).toMatch(/^\d{4}-\d{2}-\d{2}$/)
            for (const text of [projectDate(project), project.id, project.title, project.description]) {
                expect(texts, `${project.id}: ${text}`).toContain(text)
            }
            expect(a.textContent).toBe(`${projectDate(project)}${project.id}${project.title}${project.description}`)
        })
    })

    it("links to no retired /portfolio URL", async () => {
        const main = await renderListMain()
        for (const a of Array.from(main.querySelectorAll("a"))) {
            expect(a.getAttribute("href"), a.textContent ?? "").not.toMatch(/^\/portfolio(\/|$)/)
        }
    })

    it("exports the group name as title, a description and the canonical URL", () => {
        const metadata = list.metadata
        expect(metadata, "metadata").toBeDefined()
        expect(metadata!.title).toBe(group.name)
        expect(typeof metadata!.description).toBe("string")
        expect((metadata!.description as string).length).toBeGreaterThan(0)
        expect(String(metadata!.alternates?.canonical)).toBe(absoluteUrl(group.url))
    })

    it("adds no decoration: no icons, images, inline styles, rounded corners, shadows or translucency", async () => {
        const main = await renderListMain()
        expect(main.querySelector("svg"), "no icons").toBeNull()
        expect(main.querySelector("img"), "no images").toBeNull()
        expect(main.querySelector("[style]"), "no inline styles").toBeNull()
        const banned = elementsOf(main)
            .flatMap((el) => Array.from(el.classList))
            .filter((c) => DECORATION.test(c))
        expect(banned).toEqual([])
    })
})

describe("portfolio detail static params and 404", () => {
    it("generates one page per project, from the same list as the list page", async () => {
        const generated = (await detail.generateStaticParams()).map(({ id }) => id)
        expect(generated).toEqual(LISTED.map((project) => project.id))
        expect(generated).toEqual(LIST_ORDER)
    })

    it.each([
        { id: "unknown", why: "unknown" },
        { id: "ClimbInsight", why: "the title instead of the id" },
        { id: "portfolio-site.md", why: "the md file name with its extension" },
    ])("is not found for $id ($why)", async ({ id }) => {
        expect((await thrownBy(id)).digest).toBe(NOT_FOUND_DIGEST)
    })

    it("exports no metadata of a project for an unknown id", async () => {
        const metadata = await detail.generateMetadata(params("unknown"))
        expect(metadata.title).toBeUndefined()
    })

    it.each(LIST_ORDER)("exports the title, the description and the canonical URL of %s", async (id) => {
        const project = byId(id)
        const metadata = await detail.generateMetadata(params(id))
        expect(metadata.title).toBe(project.title)
        expect(metadata.description).toBe(project.description)
        expect(String(metadata.alternates?.canonical)).toBe(absoluteUrl(`/3f/portfolios/${id}`))
    })
})

describe.each(LIST_ORDER)("portfolio detail %s", (id) => {
    const project = byId(id)

    it("shows the cat command with the virtual path of the md, then the title as the only h1", async () => {
        const main = await renderDetailMain(id)
        const { h1 } = headOf(main, `$ cat ~/3f/portfolios/${id}.md`)
        expect(h1.textContent).toBe(project.title)
    })

    it("starts the body with the KeyValue, with no description between the h1 and it", async () => {
        const main = await renderDetailMain(id)
        const h1 = main.querySelector("h1")!
        const dl = main.querySelector("dl")
        expect(dl, "KeyValue").not.toBeNull()
        expectNothingBetween(main, h1, dl!)
        expect(dl!.closest(".max-w-ds-measure"), "measure").not.toBeNull()
    })

    it("shows 期間 / 役割 / 技術 / ハイライト (and リンク when the md has links) in the KeyValue", async () => {
        const main = await renderDetailMain(id)
        const dls = main.querySelectorAll("dl")
        expect(dls, "one KeyValue").toHaveLength(1)
        const keys = Array.from(dls[0].querySelectorAll("dt")).map((dt) => dt.textContent?.trim())
        const values = Array.from(dls[0].querySelectorAll("dd"))
        const links = Object.values(project.links ?? {}).filter((href): href is string => Boolean(href))

        expect(keys).toEqual(["期間", "役割", "技術", "ハイライト", ...(links.length > 0 ? ["リンク"] : [])])
        expect(values[0].textContent?.trim()).toBe(project.period)
        expect(values[1].textContent?.trim()).toBe(project.role)
        expect(values[2].textContent?.trim()).toBe(project.technologies.join(" · "))
        expect(Array.from(values[3].querySelectorAll("li")).map((li) => li.textContent?.trim())).toEqual(
            project.highlights,
        )
        if (links.length > 0) {
            expect(Array.from(values[4].querySelectorAll("a")).map((a) => a.getAttribute("href"))).toEqual(links)
        }
    })

    it("renders every heading of the md body with its level, and nothing of the frontmatter", async () => {
        const main = await renderDetailMain(id)
        const prose = proseOf(main)
        const expected = mdHeadings(project.body)
        expect(expected.length, "the md body has headings").toBeGreaterThan(0)
        const rendered = Array.from(prose.querySelectorAll("h1, h2, h3, h4, h5, h6")).map(
            (h): [number, string] => [Number(h.tagName.slice(1)), headingText(h)],
        )
        expect(rendered).toEqual(expected)

        const text = prose.textContent ?? ""
        for (const line of [`id: ${project.id}`, "updatedAt:", `title: ${project.title}`, "highlights:", "technologies:", "category: personal"]) {
            expect(text, line).not.toContain(line)
        }
    })

    it("renders every list item of the md body", async () => {
        const main = await renderDetailMain(id)
        const prose = proseOf(main)
        const mdItems = project.body.split("\n").filter((line) => /^\s*(?:[-*+]|\d+\.)\s+\S/.test(line))
        expect(prose.querySelectorAll("li")).toHaveLength(mdItems.length)
    })

    it("takes the heading colors from ds classes, not from the inherited h2 / h3 styles", async () => {
        const main = await renderDetailMain(id)
        for (const heading of Array.from(main.querySelectorAll("h1, h2, h3, h4, h5, h6"))) {
            expect(heading.className, heading.textContent ?? "").toMatch(/\btext-ds-fg\b/)
        }
    })

    it("keeps the BreadcrumbList and the CreativeWork JSON-LD at the new URLs", async () => {
        const data = jsonLdOf(await renderDetailDoc(id))
        const breadcrumbs = data.filter((item) => item["@type"] === "BreadcrumbList")
        expect(breadcrumbs).toHaveLength(1)
        expect(
            breadcrumbs[0].itemListElement.map((item: Record<string, unknown>) => [item.name, item.item]),
        ).toEqual([
            ["Home", absoluteUrl("/")],
            [group.name, absoluteUrl(group.url)],
            [project.title, absoluteUrl(projectHref(project))],
        ])

        const works = data.filter((item) => item["@type"] === "CreativeWork")
        expect(works).toHaveLength(1)
        expect(works[0].name).toBe(project.title)
        expect(works[0].url).toBe(absoluteUrl(`/3f/portfolios/${id}`))
        expect(works[0].description).toBe(project.longDescription || project.description)

        expect(JSON.stringify(data)).not.toMatch(/\/portfolio(\/|")/)
    })

    it("adds no decoration: no inline styles, rounded corners, shadows, translucency or images", async () => {
        const main = await renderDetailMain(id)
        expect(main.querySelector("img"), "no images").toBeNull()
        expect(main.querySelector("[style]"), "no inline styles").toBeNull()
        const banned = elementsOf(main)
            .flatMap((el) => Array.from(el.classList))
            .filter((c) => DECORATION.test(c))
        expect(banned).toEqual([])
    })
})

describe("portfolio detail architecture diagram", () => {
    it("is shown on portfolio-site only, after the body and before the pager", async () => {
        for (const id of LIST_ORDER) {
            const main = await renderDetailMain(id)
            const svgs = main.querySelectorAll('svg[role="img"]')
            expect(main.querySelectorAll("svg"), id).toHaveLength(id === "portfolio-site" ? 1 : 0)
            if (id !== "portfolio-site") continue
            const elements = elementsOf(main)
            const prose = proseOf(main)
            const nav = main.querySelector('nav[aria-label="前後のページ"]')!
            expect(elements.indexOf(svgs[0])).toBeGreaterThan(elements.indexOf(prose))
            expect(prose.contains(svgs[0])).toBe(false)
            expect(elements.indexOf(svgs[0])).toBeLessThan(elements.indexOf(nav))
            const heading = Array.from(main.querySelectorAll("h2")).find(
                (h2) => h2.textContent === "# インフラ構成図",
            )
            expect(heading, "diagram heading").toBeDefined()
            expect(prose.contains(heading!)).toBe(false)
            expect(elements.indexOf(heading!)).toBeLessThan(elements.indexOf(svgs[0]))
        }
    })
})

describe("portfolio detail pager", () => {
    it.each([
        {
            id: "noboru-note",
            expected: [
                ["ポートフォリオの一覧へ戻る", "/3f/portfolios"],
                ["次: ClimbInsight →", "/3f/portfolios/climbinsight"],
            ],
        },
        {
            id: "climbinsight",
            expected: [
                ["← 前: のぼるノート", "/3f/portfolios/noboru-note"],
                ["ポートフォリオの一覧へ戻る", "/3f/portfolios"],
                ["次: iron-legion →", "/3f/portfolios/iron-legion"],
            ],
        },
        {
            id: "portfolio-site",
            expected: [
                ["← 前: onclimb-industries", "/3f/portfolios/onclimb-industries"],
                ["ポートフォリオの一覧へ戻る", "/3f/portfolios"],
            ],
        },
    ])("$id shows the doors in list order", async ({ id, expected }) => {
        const main = await renderDetailMain(id)
        expect(doors(main)).toEqual(expected)
    })

    it("puts the pager at the end of the page", async () => {
        const main = await renderDetailMain("portfolio-site")
        const nav = main.querySelector('nav[aria-label="前後のページ"]')!
        const elements = elementsOf(main)
        const afterNav = elements.slice(elements.indexOf(nav) + 1).filter((el) => !nav.contains(el))
        expect(afterNav.map((el) => `${el.tagName}: ${el.textContent}`)).toEqual([])
    })

    it("following the next doors from the first row of the list visits the list links in order", async () => {
        const listMain = await renderListMain()
        const listed = Array.from(listMain.querySelectorAll("ul > li > a")).map((a) => a.getAttribute("href"))
        expect(listed.length).toBeGreaterThan(0)

        const prefix = `${group.url}/`
        const visited: string[] = []
        let href: string | undefined = listed[0] ?? undefined
        while (href !== undefined) {
            expect(visited, `loop at ${href}`).not.toContain(href)
            visited.push(href)
            expect(href.startsWith(prefix), href).toBe(true)
            const main = await renderDetailMain(href.slice(prefix.length))
            const next = doors(main).find(([text]) => text.startsWith("次: "))
            href = next?.[1] ?? undefined
        }
        expect(visited).toEqual(listed)
    })
})

describe("portfolio sources", () => {
    const sourceFiles = (dir: string) =>
        fs
            .readdirSync(path.join(SERVICE_ROOT, dir), { recursive: true, encoding: "utf-8" })
            .filter((file) => /\.(ts|tsx)$/.test(file))
            .map((file) => path.join(dir, file))

    it("app/3f/portfolios and components/portfolio do not import components/animations", () => {
        const files = [...sourceFiles("app/3f/portfolios"), ...sourceFiles("components/portfolio")]
        expect(files.filter((file) => file.startsWith(path.join("app", "3f", "portfolios"))).length).toBeGreaterThan(0)
        expect(files.filter((file) => file.startsWith(path.join("components", "portfolio"))).length).toBeGreaterThan(0)
        for (const file of files) {
            expect(fs.readFileSync(path.join(SERVICE_ROOT, file), "utf-8"), file).not.toMatch(/components\/animations/)
        }
    })

    it.each(["app/3f/portfolios/page.tsx", "app/3f/portfolios/[id]/page.tsx"])(
        "%s takes the group from FLOORS instead of writing the URL, name or command",
        (file) => {
            const source = fs.readFileSync(path.join(SERVICE_ROOT, file), "utf-8")
            expect(source).not.toContain(`"${group.url}`)
            expect(source).not.toContain(`\`${group.url}`)
            expect(source).not.toContain(`"${group.name}"`)
            expect(source).not.toContain("~/")
            expect(source).not.toMatch(/["'`]\/portfolio/)
        },
    )

    it("resolves the project and calls notFound in the route, not in the components", () => {
        const route = fs.readFileSync(path.join(SERVICE_ROOT, "app/3f/portfolios/[id]/page.tsx"), "utf-8")
        expect(route).toMatch(/\bnotFound\(\)/)
        expect(route).toMatch(/\bresolveProjectPage\(/)
        for (const file of sourceFiles("components/portfolio").filter((f) => !/\.test\.(ts|tsx)$/.test(f))) {
            const source = fs.readFileSync(path.join(SERVICE_ROOT, file), "utf-8")
            expect(source, file).not.toMatch(/\bgetProjects\(|\bnotFound\(|\bpermanentRedirect\(/)
        }
    })

    it("components/portfolio does not write the URL, name or virtual path of the group", () => {
        for (const file of sourceFiles("components/portfolio").filter((f) => !/\.test\.(ts|tsx)$/.test(f))) {
            const source = fs.readFileSync(path.join(SERVICE_ROOT, file), "utf-8")
            expect(source, file).not.toContain(`"${group.url}`)
            expect(source, file).not.toContain(`\`${group.url}`)
            expect(source, file).not.toContain(`"${group.name}"`)
            expect(source, file).not.toMatch(/["'`]\/portfolio/)
            expect(source, file).not.toContain("~/3f")
        }
    })
})
