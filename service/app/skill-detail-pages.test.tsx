// @vitest-environment jsdom
import fs from "node:fs"
import path from "node:path"
import * as React from "react"
import type { Metadata } from "next"
import type { ReactElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, describe, expect, it, vi } from "vitest"

import { floorTitle } from "@/components/building/FloorFrame"
import { findFloor, findGroup, type FloorGroup } from "@/lib/building/floors"
import type { SkillSource } from "@/lib/skills"
import { categoryLabels, hasSkillDetail, levelLabels, listSkillsOnFloor, skillHref, type SkillCategory, type SkillLevel } from "@/lib/skills-meta"

/**
 * Skill detail pages (/2f/skills/[name] and /b1/studies/[name]) contract tests.
 *
 * From the top: the `$ cat ~/<floor>/<group>/<category>/<name>.md` command, the
 * h1 with the skill name, then (no description) a KeyValue with 分野 / レベル /
 * 置いてある階, the md body as HashHeading sections (# 経験 with ## subsections,
 * # 知識, # 関連技術, # 関連書籍; empty sections are not shown) and at the end
 * the PagerDoors (previous, back to the list, next) in the order of the list
 * page, without crossing floors.
 * [name] is the md file name. Unpublished and unknown names are 404; a skill
 * opened under the other floor moves permanently (308) to its own URL.
 *
 * vitest stubs require.context, so getSkills() is replaced by a function that
 * passes md sources to the real parseSkillSources (publish filter included):
 * either the fixtures below or the real docs/skills md.
 */

const sourcesOverride = vi.hoisted(() => ({ value: null as SkillSource[] | null }))

vi.mock("@/lib/skills", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@/lib/skills")>()
    const nodeFs = await import("node:fs")
    const nodePath = await import("node:path")
    const root = nodePath.resolve(__dirname, "../docs/skills")
    const realSources = nodeFs
        .readdirSync(root, { recursive: true, encoding: "utf-8" })
        .filter((file) => file.endsWith(".md"))
        .map((file) => ({
            key: `./${file.split(nodePath.sep).join("/")}`,
            raw: nodeFs.readFileSync(nodePath.join(root, file), "utf-8"),
        }))
    return { ...actual, getSkills: () => actual.parseSkillSources(sourcesOverride.value ?? realSources) }
})

vi.mock("next/link", () => ({
    default: ({ children, ...props }: any) => (
        <a data-next-link="" {...props}>
            {children}
        </a>
    ),
}))

import SkillsListPage from "@/app/2f/skills/page"
import StudiesListPage from "@/app/b1/studies/page"
import SkillDetailRoute, * as skillDetailModule from "@/app/2f/skills/[name]/page"
import StudyDetailRoute, * as studyDetailModule from "@/app/b1/studies/[name]/page"

afterEach(() => {
    sourcesOverride.value = null
})

type Params = { params: Promise<{ name: string }> }

type DetailModule = {
    generateStaticParams: () => Array<{ name: string }> | Promise<Array<{ name: string }>>
    generateMetadata: (props: Params) => Metadata | Promise<Metadata>
    dynamicParams?: boolean
}

const ROUTES = [
    {
        slug: "skills",
        render: SkillDetailRoute as unknown as (props: Params) => ReactElement | Promise<ReactElement>,
        module: skillDetailModule as unknown as DetailModule,
        file: "2f/skills/[name]/page.tsx",
        list: SkillsListPage as () => ReactElement | Promise<ReactElement>,
    },
    {
        slug: "studies",
        render: StudyDetailRoute as unknown as (props: Params) => ReactElement | Promise<ReactElement>,
        module: studyDetailModule as unknown as DetailModule,
        file: "b1/studies/[name]/page.tsx",
        list: StudiesListPage as () => ReactElement | Promise<ReactElement>,
    },
] as const

type RouteCase = (typeof ROUTES)[number]

const [SKILLS_ROUTE, STUDIES_ROUTE] = ROUTES

const groupOf = (route: RouteCase): FloorGroup => findGroup(route.slug)

const params = (name: string): Params => ({ params: Promise.resolve({ name }) })

const fixture = (
    key: string,
    frontmatter: { name: string; category: SkillCategory; level: SkillLevel; publish: boolean; context?: string },
    body: string[] = ["## 経験", "", "- fixture", ""],
): SkillSource => {
    const lines = [
        "---",
        `name: ${frontmatter.name}`,
        `category: ${frontmatter.category}`,
        `level: ${frontmatter.level}`,
        `publish: ${frontmatter.publish}`,
        ...(frontmatter.context === undefined ? [] : [`context: ${frontmatter.context}`]),
        "---",
        "",
        ...body,
    ]
    return { key, raw: lines.join("\n") }
}

/** Body with ### subsections, a nested item, #### / * lines, related tech and books. */
const FULL_BODY = [
    "## 経験",
    "",
    "### 業務",
    "",
    "- API サーバー実装",
    "- 型定義",
    "",
    "### 個人",
    "",
    "- フロントエンド実装",
    "",
    "## 知識",
    "",
    "- 基本文法",
    "- JavaScript へのトランスパイル",
    "    - tsc による型チェック",
    "#### ignored-heading",
    "* ignored-star",
    "- 型ガード",
    "",
    "## 関連技術",
    "",
    "- Express",
    "- Ruby",
    "",
    "## 関連書籍",
    "",
    "- プログラミング TypeScript",
    "",
]

/**
 * 2F list order: language Go 5 / Alpha 3 / Ruby 3, framework Express 4.
 * B1 list order: language Rust 2, ml Torch 3 (context: study).
 * Unpublished: Hidden Work (2F) and Hidden Study (B1).
 * The input order is neither the list order nor the name order, and slugs differ from names.
 */
const FIXTURES: SkillSource[] = [
    fixture("./framework/express.md", { name: "Express", category: "framework", level: 4, publish: true }),
    fixture("./ml/torch.md", { name: "Torch", category: "ml", level: 3, publish: true, context: "study" }),
    fixture("./language/ruby.md", { name: "Ruby", category: "language", level: 3, publish: true }),
    fixture("./language/rust-lang.md", { name: "Rust", category: "language", level: 2, publish: true }),
    fixture("./language/golang.md", { name: "Go", category: "language", level: 5, publish: true }, FULL_BODY),
    fixture("./language/alpha.md", { name: "Alpha", category: "language", level: 3, publish: true }),
    fixture("./language/hidden-work.md", { name: "Hidden Work", category: "language", level: 5, publish: false }),
    fixture("./ml/hidden-study.md", { name: "Hidden Study", category: "ml", level: 2, publish: false, context: "study" }),
]

async function renderMain(route: RouteCase, name: string): Promise<HTMLElement> {
    const html = renderToStaticMarkup(await route.render(params(name)))
    const doc = new DOMParser().parseFromString(html, "text/html")
    const mains = doc.querySelectorAll("main")
    expect(mains).toHaveLength(1)
    return mains[0] as HTMLElement
}

/** Renders the route and returns what it threw (notFound / permanentRedirect throw while rendering). */
async function thrownBy(route: RouteCase, name: string): Promise<{ digest?: unknown }> {
    try {
        renderToStaticMarkup(await route.render(params(name)))
    } catch (error) {
        return error as { digest?: unknown }
    }
    throw new Error(`${route.file} with ${name} rendered instead of throwing`)
}

const NOT_FOUND_DIGEST = "NEXT_HTTP_ERROR_FALLBACK;404"

/** Next 16 redirect digest: NEXT_REDIRECT;<type>;<url>;<status>; */
function redirectOf(error: { digest?: unknown }): { url: string; status: number } {
    expect(typeof error.digest, String(error)).toBe("string")
    const parts = (error.digest as string).split(";")
    expect(parts[0]).toBe("NEXT_REDIRECT")
    return { url: parts.slice(2, -2).join(";"), status: Number(parts.at(-2)) }
}

function elementsOf(main: HTMLElement): Element[] {
    return Array.from(main.querySelectorAll("*"))
}

/** [visible text, href] of each door inside the pager nav, in order. */
function doors(main: HTMLElement): Array<[string, string | null]> {
    const nav = main.querySelector('nav[aria-label="前後のページ"]')
    expect(nav, "pager nav").not.toBeNull()
    return Array.from(nav!.querySelectorAll("a")).map((a) => [(a.textContent ?? "").trim(), a.getAttribute("href")])
}

const squash = (text: string | null | undefined) => (text ?? "").replace(/\s+/g, "")

describe.each(ROUTES)("$file static params", (route) => {
    it("generates only the published skills of this floor, by file name, and keeps dynamicParams on", async () => {
        sourcesOverride.value = FIXTURES
        const generated = (await route.module.generateStaticParams()).map(({ name }) => name).sort()
        const expected = route.slug === "skills" ? ["alpha", "express", "golang", "ruby"] : ["rust-lang", "torch"]
        expect(generated).toEqual(expected)
        // dynamicParams = false would turn the URL of the other floor into a 404 instead of a redirect
        expect(route.module.dynamicParams).not.toBe(false)
    })

    it("with the real docs/skills, generates exactly the published skills of this floor that have a body", async () => {
        const { getSkills } = await import("@/lib/skills")
        const onFloor = listSkillsOnFloor(getSkills(), groupOf(route).floor).filter(hasSkillDetail)
        expect(onFloor.length).toBeGreaterThan(0)
        const generated = (await route.module.generateStaticParams()).map(({ name }) => name).sort()
        expect(generated).toEqual(onFloor.map((skill) => skill.slug).sort())
    })
})

describe("skill detail head", () => {
    it("shows the cat command with the virtual path of the md, then the skill name as the only h1", async () => {
        sourcesOverride.value = FIXTURES
        const cases = [
            { route: SKILLS_ROUTE, name: "golang", command: "$ cat ~/2f/skills/language/golang.md", title: "Go" },
            { route: STUDIES_ROUTE, name: "torch", command: "$ cat ~/b1/studies/ml/torch.md", title: "Torch" },
        ]
        for (const { route, name, command, title } of cases) {
            const main = await renderMain(route, name)
            const found = elementsOf(main).filter((el) => el.tagName === "P" && el.textContent === command)
            expect(found, command).toHaveLength(1)
            const headings = main.querySelectorAll("h1")
            expect(headings).toHaveLength(1)
            expect(headings[0].textContent).toBe(title)
            expect(found[0].nextElementSibling).toBe(headings[0])
        }
    })

    it("puts nothing before the command (no peek window yet)", async () => {
        sourcesOverride.value = FIXTURES
        const main = await renderMain(SKILLS_ROUTE, "golang")
        const command = elementsOf(main).find((el) => el.tagName === "P" && el.textContent?.startsWith("$ cat "))!
        const elements = elementsOf(main)
        for (const el of elements.slice(0, elements.indexOf(command))) {
            expect(el.contains(command), `${el.tagName}.${el.className}`).toBe(true)
        }
    })

    it("starts the body with the KeyValue, with no description between the h1 and it", async () => {
        sourcesOverride.value = FIXTURES
        const main = await renderMain(SKILLS_ROUTE, "golang")
        const elements = elementsOf(main)
        const h1 = main.querySelector("h1")!
        const dl = main.querySelector("dl")
        expect(dl, "KeyValue").not.toBeNull()
        for (const el of elements.slice(elements.indexOf(h1) + 1, elements.indexOf(dl!))) {
            expect(el.contains(dl), `${el.tagName}.${el.className}: ${el.textContent}`).toBe(true)
        }
    })
})

describe("skill detail KeyValue", () => {
    function keyValues(main: HTMLElement): { keys: string[]; values: Element[] } {
        const dl = main.querySelector("dl")!
        return {
            keys: Array.from(dl.querySelectorAll("dt")).map((dt) => dt.textContent?.trim() ?? ""),
            values: Array.from(dl.querySelectorAll("dd")),
        }
    }

    it("shows 分野 / レベル / 置いてある階 with the category label, the gauge and level label, and the floor title", async () => {
        sourcesOverride.value = FIXTURES
        const cases = [
            { route: SKILLS_ROUTE, name: "alpha", category: "language" as const, level: 3 as const },
            { route: STUDIES_ROUTE, name: "torch", category: "ml" as const, level: 3 as const },
        ]
        for (const { route, name, category, level } of cases) {
            const main = await renderMain(route, name)
            const { keys, values } = keyValues(main)
            expect(keys).toEqual(["分野", "レベル", "置いてある階"])
            expect(values[0].textContent?.trim()).toBe(categoryLabels[category])
            const levelText = squash(values[1].textContent)
            expect(levelText).toContain(`${"●".repeat(level)}${"○".repeat(5 - level)}`)
            expect(levelText).toContain(squash(levelLabels[level].label))
            expect(values[2].textContent?.trim()).toBe(floorTitle(findFloor(groupOf(route).floor)))
        }
    })

    it("colors the filled marks with the accent color and the empty marks with fg-muted, like the list", async () => {
        sourcesOverride.value = FIXTURES
        const main = await renderMain(SKILLS_ROUTE, "alpha")
        const cell = keyValues(main).values[1]
        const filled = Array.from(cell.querySelectorAll("*")).find((el) => /^●+$/.test(el.textContent ?? ""))
        const empty = Array.from(cell.querySelectorAll("*")).find((el) => /^○+$/.test(el.textContent ?? ""))
        expect(filled?.closest(".text-ds-accent"), "filled").not.toBeNull()
        expect(empty?.closest(".text-ds-fg-muted"), "empty").not.toBeNull()
        // The marks are not read out: the level name next to them carries the same information.
        expect(filled?.closest('[aria-hidden="true"]'), "filled hidden").not.toBeNull()
        expect(empty?.closest('[aria-hidden="true"]'), "empty hidden").not.toBeNull()
    })

    it("keeps the KeyValue within the prose measure", async () => {
        sourcesOverride.value = FIXTURES
        const main = await renderMain(SKILLS_ROUTE, "golang")
        const dl = main.querySelector("dl")
        expect(dl?.closest(".max-w-ds-measure"), "measure").not.toBeNull()
    })
})

describe("skill detail body", () => {
    const h2Texts = (main: HTMLElement) => Array.from(main.querySelectorAll("h2")).map((h2) => h2.textContent)

    it("shows 経験 / 知識 / 関連技術 / 関連書籍 as # h2 headings, in that order", async () => {
        sourcesOverride.value = FIXTURES
        const main = await renderMain(SKILLS_ROUTE, "golang")
        expect(h2Texts(main)).toEqual(["# 経験", "# 知識", "# 関連技術", "# 関連書籍"])
        for (const h2 of Array.from(main.querySelectorAll("h2"))) {
            // the marker is decorative, as HashHeading renders it
            expect(h2.querySelector('[aria-hidden="true"]')?.textContent?.trim(), h2.textContent ?? "").toBe("#")
        }
    })

    it("shows each ### line as a ## h3 under # 経験, with its items in a list below it", async () => {
        sourcesOverride.value = FIXTURES
        const main = await renderMain(SKILLS_ROUTE, "golang")
        const elements = elementsOf(main)
        const h3s = Array.from(main.querySelectorAll("h3"))
        expect(h3s.map((h3) => h3.textContent)).toEqual(["## 業務", "## 個人"])

        const [experience, knowledge] = Array.from(main.querySelectorAll("h2"))
        for (const h3 of h3s) {
            expect(elements.indexOf(h3)).toBeGreaterThan(elements.indexOf(experience))
            expect(elements.indexOf(h3)).toBeLessThan(elements.indexOf(knowledge))
        }
        const [work, personal] = h3s
        const workItems = elements
            .slice(elements.indexOf(work) + 1, elements.indexOf(personal))
            .filter((el) => el.tagName === "LI")
            .map((li) => li.textContent?.trim())
        expect(workItems).toEqual(["API サーバー実装", "型定義"])
        const personalItems = elements
            .slice(elements.indexOf(personal) + 1, elements.indexOf(knowledge))
            .filter((el) => el.tagName === "LI")
            .map((li) => li.textContent?.trim())
        expect(personalItems).toEqual(["フロントエンド実装"])
    })

    it("keeps an item with children as a list item holding a nested list, not as a heading", async () => {
        sourcesOverride.value = FIXTURES
        const main = await renderMain(SKILLS_ROUTE, "golang")
        const headings = Array.from(main.querySelectorAll("h1, h2, h3, h4")).map((h) => h.textContent ?? "")
        expect(headings.some((text) => text.includes("JavaScript へのトランスパイル"))).toBe(false)

        const parent = Array.from(main.querySelectorAll("li")).find((li) =>
            li.textContent?.trim().startsWith("JavaScript へのトランスパイル"),
        )
        expect(parent, "parent item").toBeDefined()
        const nested = parent!.querySelector("ul")
        expect(nested, "nested list").not.toBeNull()
        expect(Array.from(nested!.querySelectorAll("li")).map((li) => li.textContent?.trim())).toEqual([
            "tsc による型チェック",
        ])
        // the parent's own list is a ul as well
        expect(parent!.parentElement?.tagName).toBe("UL")
    })

    it("does not show the #### and * lines, as the parser ignores them today", async () => {
        sourcesOverride.value = FIXTURES
        const main = await renderMain(SKILLS_ROUTE, "golang")
        expect(main.textContent).not.toContain("ignored-heading")
        expect(main.textContent).not.toContain("ignored-star")
    })

    it("shows the related tech and books as list items, without linking to other skills", async () => {
        sourcesOverride.value = FIXTURES
        const main = await renderMain(SKILLS_ROUTE, "golang")
        const items = Array.from(main.querySelectorAll("li")).map((li) => li.textContent?.trim())
        expect(items).toEqual(expect.arrayContaining(["Express", "Ruby", "プログラミング TypeScript"]))
        // the only links on the page are the pager doors
        for (const a of Array.from(main.querySelectorAll("a"))) {
            expect(a.closest('nav[aria-label="前後のページ"]'), `${a.textContent} -> ${a.getAttribute("href")}`).not.toBeNull()
        }
    })

    it("does not show the headings of empty sections", async () => {
        sourcesOverride.value = FIXTURES
        const main = await renderMain(SKILLS_ROUTE, "alpha")
        expect(h2Texts(main)).toEqual(["# 経験"])
        expect(main.querySelectorAll("h3")).toHaveLength(0)
    })

    it("takes its colors from ds classes on the headings and the body, not from the inherited h2 / h3 styles", async () => {
        sourcesOverride.value = FIXTURES
        const main = await renderMain(SKILLS_ROUTE, "golang")
        for (const heading of Array.from(main.querySelectorAll("h2, h3"))) {
            expect(heading.className, heading.textContent ?? "").toMatch(/\btext-ds-fg\b/)
        }
        for (const list of Array.from(main.querySelectorAll("ul"))) {
            expect(list.closest(".text-ds-fg"), "list color").not.toBeNull()
        }
    })

    it("uses the list classes shared with Prose, defined once in prose-styles", async () => {
        sourcesOverride.value = FIXTURES
        const { PROSE_LIST } = await import("@/components/ds/prose-styles")
        const main = await renderMain(SKILLS_ROUTE, "golang")
        const lists = Array.from(main.querySelectorAll("ul"))
        expect(lists.length).toBeGreaterThan(0)
        for (const list of lists) expect(list.className).toBe(PROSE_LIST)

        const serviceRoot = path.resolve(__dirname, "..")
        const sources = ["app", "components"].flatMap((dir) =>
            fs
                .readdirSync(path.join(serviceRoot, dir), { recursive: true, encoding: "utf-8" })
                .filter((file) => /\.(ts|tsx)$/.test(file) && !/\.test\.(ts|tsx)$/.test(file))
                .map((file) => path.join(dir, file)),
        )
        const withLiteral = sources.filter((file) =>
            fs.readFileSync(path.join(serviceRoot, file), "utf-8").includes(`"${PROSE_LIST}"`),
        )
        expect(withLiteral).toEqual([path.join("components", "ds", "prose-styles.ts")])
    })
})

describe("skill detail pager", () => {
    it.each([
        {
            route: SKILLS_ROUTE,
            name: "golang",
            expected: [
                ["スキルの一覧へ戻る", "/2f/skills"],
                ["次: Alpha →", "/2f/skills/alpha"],
            ],
        },
        {
            route: SKILLS_ROUTE,
            name: "alpha",
            expected: [
                ["← 前: Go", "/2f/skills/golang"],
                ["スキルの一覧へ戻る", "/2f/skills"],
                ["次: Ruby →", "/2f/skills/ruby"],
            ],
        },
        {
            route: SKILLS_ROUTE,
            name: "express",
            expected: [
                ["← 前: Ruby", "/2f/skills/ruby"],
                ["スキルの一覧へ戻る", "/2f/skills"],
            ],
        },
        {
            route: STUDIES_ROUTE,
            name: "rust-lang",
            expected: [
                ["自己学習の一覧へ戻る", "/b1/studies"],
                ["次: Torch →", "/b1/studies/torch"],
            ],
        },
        {
            route: STUDIES_ROUTE,
            name: "torch",
            expected: [
                ["← 前: Rust", "/b1/studies/rust-lang"],
                ["自己学習の一覧へ戻る", "/b1/studies"],
            ],
        },
    ])("$route.file $name shows the doors in list order, without crossing floors", async ({ route, name, expected }) => {
        sourcesOverride.value = FIXTURES
        const main = await renderMain(route, name)
        expect(doors(main)).toEqual(expected)
    })

    it("puts the pager at the end of the page", async () => {
        sourcesOverride.value = FIXTURES
        const main = await renderMain(SKILLS_ROUTE, "golang")
        const nav = main.querySelector('nav[aria-label="前後のページ"]')!
        const elements = elementsOf(main)
        const afterNav = elements.slice(elements.indexOf(nav) + 1).filter((el) => !nav.contains(el))
        expect(afterNav.map((el) => `${el.tagName}: ${el.textContent}`)).toEqual([])
    })

    it.each(ROUTES)(
        "with the real docs/skills, following the next doors from the first skill of $file visits the list links in order",
        async (route) => {
            const listHtml = renderToStaticMarkup(await route.list())
            const listDoc = new DOMParser().parseFromString(listHtml, "text/html")
            const listed = Array.from(listDoc.querySelectorAll("main table a")).map((a) => a.getAttribute("href"))
            expect(listed.length).toBeGreaterThan(0)

            const prefix = `${groupOf(route).url}/`
            const visited: string[] = []
            let href: string | undefined = listed[0] ?? undefined
            while (href !== undefined) {
                expect(visited, `loop at ${href}`).not.toContain(href)
                visited.push(href)
                expect(href.startsWith(prefix), href).toBe(true)
                const main = await renderMain(route, href.slice(prefix.length))
                const next = doors(main).find(([text]) => text.startsWith("次: "))
                href = next?.[1] ?? undefined
            }
            expect(visited).toEqual(listed)
        },
    )
})

describe("skill detail 404", () => {
    it.each([
        { route: SKILLS_ROUTE, name: "hidden-work", why: "unpublished on its own floor" },
        { route: STUDIES_ROUTE, name: "hidden-study", why: "unpublished on its own floor" },
        { route: STUDIES_ROUTE, name: "hidden-work", why: "unpublished, opened under the other floor" },
        { route: SKILLS_ROUTE, name: "hidden-study", why: "unpublished, opened under the other floor" },
        { route: SKILLS_ROUTE, name: "unknown", why: "unknown" },
        { route: STUDIES_ROUTE, name: "unknown", why: "unknown" },
        { route: SKILLS_ROUTE, name: "Go", why: "the skill name instead of the file name" },
    ])("$route.file $name ($why) is not found", async ({ route, name }) => {
        sourcesOverride.value = FIXTURES
        const error = await thrownBy(route, name)
        expect(error.digest).toBe(NOT_FOUND_DIGEST)
    })

    it("is not found for a published skill whose body is empty, on either floor, and the list does not link it", async () => {
        // Empty sits on 2F language between Go (5) and Alpha (3).
        sourcesOverride.value = [
            ...FIXTURES,
            fixture("./language/empty-body.md", { name: "Empty Body", category: "language", level: 4, publish: true }, ["## 経験", ""]),
        ]
        expect((await thrownBy(SKILLS_ROUTE, "empty-body")).digest).toBe(NOT_FOUND_DIGEST)
        expect((await thrownBy(STUDIES_ROUTE, "empty-body")).digest).toBe(NOT_FOUND_DIGEST)
        expect((await SKILLS_ROUTE.module.generateStaticParams()).map(({ name }) => name)).not.toContain("empty-body")

        const alpha = await renderMain(SKILLS_ROUTE, "alpha")
        expect(doors(alpha)[0][1]).toBe("/2f/skills/golang")

        const listHtml = renderToStaticMarkup(await SKILLS_ROUTE.list())
        const list = new DOMParser().parseFromString(listHtml, "text/html")
        const cell = Array.from(list.querySelectorAll("td")).find((td) => td.textContent?.trim() === "Empty Body")
        expect(cell, "listed by name").toBeDefined()
        expect(cell?.querySelector("a"), "no link").toBeNull()
    })

    it("exports no metadata of a skill for an unknown name", async () => {
        sourcesOverride.value = FIXTURES
        for (const route of ROUTES) {
            const metadata = await route.module.generateMetadata(params("unknown"))
            expect(metadata.title, route.file).toBeUndefined()
        }
    })
})

describe("skill detail on the other floor", () => {
    it("moves a work skill opened under /b1/studies permanently (308) to /2f/skills/<name>", async () => {
        sourcesOverride.value = FIXTURES
        expect(redirectOf(await thrownBy(STUDIES_ROUTE, "golang"))).toEqual({ url: "/2f/skills/golang", status: 308 })
    })

    it("moves a study skill opened under /2f/skills permanently (308) to /b1/studies/<name>", async () => {
        sourcesOverride.value = FIXTURES
        expect(redirectOf(await thrownBy(SKILLS_ROUTE, "torch"))).toEqual({ url: "/b1/studies/torch", status: 308 })
    })

    it("with the real TypeScript md, shows it on /2f/skills/typescript and moves /b1/studies/typescript there", async () => {
        const main = await renderMain(SKILLS_ROUTE, "typescript")
        expect(main.querySelector("h1")?.textContent).toBe("TypeScript")
        expect(redirectOf(await thrownBy(STUDIES_ROUTE, "typescript"))).toEqual({
            url: "/2f/skills/typescript",
            status: 308,
        })
    })
})

describe("skill detail metadata and sources", () => {
    it.each([
        { route: SKILLS_ROUTE, name: "golang", title: "Go", href: "/2f/skills/golang" },
        { route: STUDIES_ROUTE, name: "torch", title: "Torch", href: "/b1/studies/torch" },
    ])("$route.file exports the skill name as title, a description and the canonical URL", async ({ route, name, title, href }) => {
        sourcesOverride.value = FIXTURES
        const metadata = await route.module.generateMetadata(params(name))
        expect(metadata.title).toBe(title)
        expect(typeof metadata.description).toBe("string")
        expect((metadata.description as string).length).toBeGreaterThan(0)
        expect(String(metadata.alternates?.canonical)).toMatch(new RegExp(`${href}$`))
    })

    it.each(ROUTES)("$file takes the group from FLOORS instead of writing the URL, name or command", (route) => {
        const group = groupOf(route)
        const source = fs.readFileSync(path.resolve(__dirname, route.file), "utf-8")
        expect(source).toContain(`findGroup("${route.slug}")`)
        expect(source).not.toContain(`"${group.url}`)
        expect(source).not.toContain(`\`${group.url}`)
        expect(source).not.toContain(`"${group.name}"`)
        expect(source).not.toContain("~/")
    })

    it.each(ROUTES)("$file adds no decoration: no icons, inline styles, rounded corners, shadows or translucency", async (route) => {
        sourcesOverride.value = FIXTURES
        const main = await renderMain(route, route.slug === "skills" ? "golang" : "torch")
        expect(main.querySelector("svg"), "no icons").toBeNull()
        expect(main.querySelector("img"), "no images").toBeNull()
        expect(main.querySelector("[style]"), "no inline styles").toBeNull()
        const banned = elementsOf(main)
            .flatMap((el) => Array.from(el.classList))
            .filter((c) => /rounded|shadow|gradient|backdrop|opacity|animate|\/\d+$|\[/.test(c))
        expect(banned).toEqual([])
    })
})

describe("skill md file names", () => {
    const root = path.resolve(__dirname, "../docs/skills")
    const files = fs
        .readdirSync(root, { recursive: true, encoding: "utf-8" })
        .filter((file) => file.endsWith(".md"))
        .map((file) => file.split(path.sep).join("/"))

    it("are unique across categories, so each name is one detail URL", () => {
        expect(files.length).toBeGreaterThan(0)
        const byName = new Map<string, string[]>()
        for (const file of files) {
            const name = path.posix.basename(file, ".md")
            byName.set(name, [...(byName.get(name) ?? []), file])
        }
        const duplicated = Array.from(byName.entries()).filter(([, paths]) => paths.length > 1)
        expect(duplicated).toEqual([])
    })

    it("give each published skill its own detail URL", async () => {
        const { getSkills } = await import("@/lib/skills")
        const hrefs = getSkills().map(skillHref)
        expect(hrefs.length).toBeGreaterThan(0)
        expect(new Set(hrefs).size).toBe(hrefs.length)
    })
})
