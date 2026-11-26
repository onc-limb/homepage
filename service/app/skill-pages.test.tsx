// @vitest-environment jsdom
import fs from "node:fs"
import path from "node:path"
import * as React from "react"
import type { Metadata } from "next"
import type { ReactElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, describe, expect, it, vi } from "vitest"

import { findGroup, type FloorGroup } from "@/lib/building/floors"
import type { SkillSource } from "@/lib/skills"
import { categoryLabels, getSkillFloor, levelLabels, type SkillCategory, type SkillLevel } from "@/lib/skills-meta"

/**
 * Skills list (/2f/skills) and studies list (/b1/studies) contract tests.
 *
 * From the top: the `$ ls -l ~/<floor>/<slug> | sort -k level` command, the h1,
 * then one block per category: an h2 with the category name, the path
 * ~/<floor>/<slug>/<category>/ and a table with the columns 名前 / level /
 * レベルの名前. Categories follow categoryOrder, rows go from the highest level
 * down, and a category without skills is not shown. The skills list shows only
 * the work skills (getSkillFloor = 2f), the studies list only the study skills
 * (b1), both only publish: true. Each skill name links to its detail page
 * (/<floor>/<slug>/<md file name>).
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

import SkillsPage, * as skillsModule from "@/app/2f/skills/page"
import StudiesPage, * as studiesModule from "@/app/b1/studies/page"

afterEach(() => {
    sourcesOverride.value = null
})

type PageModule = {
    metadata?: Metadata
    generateMetadata?: () => Metadata | Promise<Metadata>
}

const PAGES = [
    {
        slug: "skills",
        render: SkillsPage as () => ReactElement | Promise<ReactElement>,
        module: skillsModule as PageModule,
        file: "2f/skills/page.tsx",
        name: "スキル",
        command: "ls -l ~/2f/skills | sort -k level",
    },
    {
        slug: "studies",
        render: StudiesPage as () => ReactElement | Promise<ReactElement>,
        module: studiesModule as PageModule,
        file: "b1/studies/page.tsx",
        name: "自己学習",
        command: "ls -l ~/b1/studies | sort -k level",
    },
] as const

type PageCase = (typeof PAGES)[number]

const groupOf = (page: PageCase): FloorGroup => findGroup(page.slug)

const fixture = (
    key: string,
    frontmatter: { name: string; category: SkillCategory; level: SkillLevel; publish: boolean; context?: string },
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
        "## 経験",
        "",
        "- fixture",
        "",
    ]
    return { key, raw: lines.join("\n") }
}

/**
 * Work skills (2F): language 5 / 3 / 3, framework 4 without context, tools 1 with context: work.
 * Study skills (B1): language 2 without context, framework 4 with context: study, ml 3 (only on B1).
 * Unpublished: one work and one study skill.
 * The input order is not the expected order.
 */
const FIXTURES: SkillSource[] = [
    fixture("./tools/work-low.md", { name: "Work Low", category: "tools", level: 1, publish: true, context: "work" }),
    fixture("./framework/express.md", { name: "Express", category: "framework", level: 4, publish: true }),
    fixture("./ml/torch.md", { name: "Torch", category: "ml", level: 3, publish: true, context: "study" }),
    fixture("./language/ruby.md", { name: "Ruby", category: "language", level: 3, publish: true }),
    fixture("./language/rust.md", { name: "Rust", category: "language", level: 2, publish: true }),
    fixture("./language/go.md", { name: "Go", category: "language", level: 5, publish: true }),
    fixture("./framework/study-high.md", {
        name: "Study High",
        category: "framework",
        level: 4,
        publish: true,
        context: "study",
    }),
    fixture("./language/alpha.md", { name: "Alpha", category: "language", level: 3, publish: true }),
    fixture("./language/hidden-work.md", { name: "Hidden Work", category: "language", level: 5, publish: false }),
    fixture("./ml/hidden-study.md", {
        name: "Hidden Study",
        category: "ml",
        level: 2,
        publish: false,
        context: "study",
    }),
]

const EXPECTED: Record<PageCase["slug"], Array<{ category: SkillCategory; rows: Array<[string, SkillLevel]> }>> = {
    skills: [
        {
            category: "language",
            rows: [
                ["Go", 5],
                ["Alpha", 3],
                ["Ruby", 3],
            ],
        },
        { category: "framework", rows: [["Express", 4]] },
        { category: "tools", rows: [["Work Low", 1]] },
    ],
    studies: [
        { category: "language", rows: [["Rust", 2]] },
        { category: "framework", rows: [["Study High", 4]] },
        { category: "ml", rows: [["Torch", 3]] },
    ],
}

async function renderMain(page: PageCase): Promise<HTMLElement> {
    const html = renderToStaticMarkup(await page.render())
    const doc = new DOMParser().parseFromString(html, "text/html")
    const mains = doc.querySelectorAll("main")
    expect(mains).toHaveLength(1)
    return mains[0] as HTMLElement
}

function elementsOf(main: HTMLElement): Element[] {
    return Array.from(main.querySelectorAll("*"))
}

function commandLine(main: HTMLElement, group: FloorGroup): Element {
    const found = elementsOf(main).filter((el) => el.tagName === "P" && el.textContent === `$ ${group.command}`)
    expect(found).toHaveLength(1)
    return found[0]
}

const squash = (text: string | null | undefined) => (text ?? "").replace(/\s+/g, "")

type CategoryBlock = { heading: Element; between: Element[]; table: HTMLTableElement }

/** Each h2 with the elements after it up to its table (the first table after the h2). */
function categoryBlocks(main: HTMLElement): CategoryBlock[] {
    const elements = elementsOf(main)
    const headings = Array.from(main.querySelectorAll("h2"))
    return headings.map((heading, index) => {
        const start = elements.indexOf(heading)
        const next = headings[index + 1]
        const end = next ? elements.indexOf(next) : elements.length
        const inBlock = elements.slice(start + 1, end)
        const table = inBlock.find((el) => el.tagName === "TABLE") as HTMLTableElement | undefined
        expect(table, `table after ${heading.textContent}`).toBeDefined()
        expect(inBlock.filter((el) => el.tagName === "TABLE"), `${heading.textContent}`).toHaveLength(1)
        return { heading, between: inBlock.slice(0, inBlock.indexOf(table!)), table: table! }
    })
}

function headerTexts(table: HTMLTableElement): string[] {
    return Array.from(table.querySelectorAll("thead th")).map((th) => th.textContent?.trim() ?? "")
}

function bodyRows(table: HTMLTableElement): Element[][] {
    return Array.from(table.querySelectorAll("tbody tr")).map((tr) => Array.from(tr.querySelectorAll("td")))
}

function namesOn(main: HTMLElement): string[] {
    return categoryBlocks(main).flatMap(({ table }) => bodyRows(table).map((cells) => cells[0].textContent?.trim() ?? ""))
}

describe.each(PAGES)("$file frame", (page) => {
    const group = groupOf(page)

    it("shows the command from FLOORS first, with no peek band before it", async () => {
        const main = await renderMain(page)
        expect(group.command).toBe(page.command)
        const command = commandLine(main, group)
        const elements = elementsOf(main)
        for (const el of elements.slice(0, elements.indexOf(command))) {
            expect(el.contains(command), `${el.tagName}.${el.className}`).toBe(true)
        }
    })

    it("has one h1 with the group name, right after the command", async () => {
        const main = await renderMain(page)
        const headings = main.querySelectorAll("h1")
        expect(headings).toHaveLength(1)
        expect(group.name).toBe(page.name)
        expect(headings[0].textContent).toBe(group.name)
        expect(commandLine(main, group).nextElementSibling).toBe(headings[0])
    })

    it("starts the body with the first category, with no description between the heading and it", async () => {
        sourcesOverride.value = FIXTURES
        const main = await renderMain(page)
        const elements = elementsOf(main)
        const h1 = main.querySelector("h1")!
        const firstH2 = main.querySelector("h2")
        expect(firstH2, "first category heading").not.toBeNull()
        for (const el of elements.slice(elements.indexOf(h1) + 1, elements.indexOf(firstH2!))) {
            expect(el.contains(firstH2), `${el.tagName}.${el.className}: ${el.textContent}`).toBe(true)
        }
    })

    it("takes the name, command and URL from FLOORS instead of writing them in the page", () => {
        const source = fs.readFileSync(path.resolve(__dirname, page.file), "utf-8")
        expect(source).toContain(`findGroup("${page.slug}")`)
        expect(source).not.toContain(group.command)
        expect(source).not.toContain(`"${group.url}"`)
        expect(source).not.toContain(`"${group.name}"`)
    })

    it("adds no decoration: no icons, inline styles, rounded corners, shadows or translucency", async () => {
        sourcesOverride.value = FIXTURES
        const main = await renderMain(page)
        expect(main.querySelector("svg"), "no icons").toBeNull()
        expect(main.querySelector("img"), "no images").toBeNull()
        expect(main.querySelector("[style]"), "no inline styles").toBeNull()
        const banned = elementsOf(main)
            .flatMap((el) => Array.from(el.classList))
            .filter((c) => /rounded|shadow|gradient|backdrop|opacity|animate|\/\d+$|\[/.test(c))
        expect(banned).toEqual([])
    })

    it("exports the group name as title, a description and the canonical URL of the group", async () => {
        const metadata = page.module.metadata ?? (await page.module.generateMetadata?.())
        expect(metadata?.title).toBe(group.name)
        expect(typeof metadata?.description).toBe("string")
        expect((metadata?.description as string).length).toBeGreaterThan(0)
        expect(String(metadata?.alternates?.canonical)).toMatch(new RegExp(`${group.url}$`))
    })
})

describe.each(PAGES)("$file category tables", (page) => {
    const group = groupOf(page)
    const expected = EXPECTED[page.slug]

    it("shows the categories with skills on this floor in categoryOrder, with the category name as h2", async () => {
        sourcesOverride.value = FIXTURES
        const main = await renderMain(page)
        expect(Array.from(main.querySelectorAll("h2")).map((h2) => h2.textContent)).toEqual(
            expected.map(({ category }) => `# ${categoryLabels[category]}`),
        )
    })

    it("shows the path ~/<floor>/<slug>/<category>/ in the link color between the h2 and the table", async () => {
        sourcesOverride.value = FIXTURES
        const main = await renderMain(page)
        const blocks = categoryBlocks(main)
        blocks.forEach(({ between }, index) => {
            const virtualPath = `~${group.url}/${expected[index].category}/`
            const found = between.filter((el) => el.textContent?.trim() === virtualPath && el.children.length === 0)
            expect(found, virtualPath).toHaveLength(1)
            expect(found[0].closest(".text-ds-link"), `${virtualPath} in the link color`).not.toBeNull()
            expect(found[0].closest("a"), `${virtualPath} is not a link`).toBeNull()
        })
    })

    it("has the columns 名前 / level / レベルの名前 in every table", async () => {
        sourcesOverride.value = FIXTURES
        const main = await renderMain(page)
        for (const { heading, table } of categoryBlocks(main)) {
            expect(headerTexts(table), heading.textContent ?? "").toEqual(["名前", "level", "レベルの名前"])
        }
    })

    it("lists the rows from the highest level down, with the gauge, the number and the level label", async () => {
        sourcesOverride.value = FIXTURES
        const main = await renderMain(page)
        const blocks = categoryBlocks(main)
        expect(blocks).toHaveLength(expected.length)
        blocks.forEach(({ table }, index) => {
            const cells = bodyRows(table).map((row) => row.map((cell) => cell.textContent))
            expect(
                cells.map(([name, level, label]) => [name?.trim(), squash(level), label?.trim()]),
                expected[index].category,
            ).toEqual(
                expected[index].rows.map(([name, level]) => [
                    name,
                    `${"●".repeat(level)}${"○".repeat(5 - level)}${level}`,
                    levelLabels[level].label,
                ]),
            )
        })
    })

    it("colors the filled marks with the accent color and the empty marks with the border color", async () => {
        sourcesOverride.value = FIXTURES
        const main = await renderMain(page)
        const cells = categoryBlocks(main).flatMap(({ table }) => bodyRows(table).map((row) => row[1]))
        const withEmpty = cells.filter((cell) => /○/.test(cell.textContent ?? ""))
        expect(withEmpty.length).toBeGreaterThan(0)
        for (const cell of withEmpty) {
            const filled = Array.from(cell.querySelectorAll("*")).find((el) => /^●+$/.test(el.textContent ?? ""))
            const empty = Array.from(cell.querySelectorAll("*")).find((el) => /^○+$/.test(el.textContent ?? ""))
            expect(filled, cell.textContent ?? "").toBeDefined()
            expect(empty, cell.textContent ?? "").toBeDefined()
            expect(filled!.closest(".text-ds-accent"), `${cell.textContent} filled`).not.toBeNull()
            expect(empty!.closest(".text-ds-border"), `${cell.textContent} empty`).not.toBeNull()
        }
    })

    it("links each skill name to its detail page /<floor>/<slug>/<file name>", async () => {
        sourcesOverride.value = FIXTURES
        const main = await renderMain(page)
        const links = categoryBlocks(main).flatMap(({ table }) =>
            bodyRows(table).map((cells) => {
                const anchors = cells[0].querySelectorAll("a")
                expect(anchors, cells[0].textContent ?? "").toHaveLength(1)
                return [anchors[0].textContent?.trim(), anchors[0].getAttribute("href")]
            }),
        )
        const slugOf = new Map(
            FIXTURES.map((source) => [
                source.raw.match(/^name: (.+)$/m)![1],
                source.key.replace(/^.*\//, "").replace(/\.md$/, ""),
            ]),
        )
        expect(links).toEqual(
            expected.flatMap(({ rows }) => rows.map(([name]) => [name, `${group.url}/${slugOf.get(name)}`])),
        )
        // only the name cells are links
        expect(main.querySelectorAll("table a")).toHaveLength(links.length)
    })
})

describe("skills and studies split between 2F and B1", () => {
    const [skillsPage, studiesPage] = PAGES

    it("shows the work skills only on /2f/skills and the study skills only on /b1/studies", async () => {
        sourcesOverride.value = FIXTURES
        const onSkills = namesOn(await renderMain(skillsPage))
        const onStudies = namesOn(await renderMain(studiesPage))

        // level 4 without context and context: work go to 2F; level 2 without context and context: study go to B1
        expect(onSkills).toEqual(expect.arrayContaining(["Express", "Work Low"]))
        expect(onSkills).not.toContain("Rust")
        expect(onSkills).not.toContain("Study High")
        expect(onSkills).not.toContain("Torch")
        expect(onStudies).toEqual(expect.arrayContaining(["Rust", "Study High", "Torch"]))
        expect(onStudies).not.toContain("Express")
        expect(onStudies).not.toContain("Work Low")
    })

    it("does not show the publish: false skills on either page", async () => {
        sourcesOverride.value = FIXTURES
        for (const page of PAGES) {
            const main = await renderMain(page)
            expect(main.textContent, page.file).not.toContain("Hidden Work")
            expect(main.textContent, page.file).not.toContain("Hidden Study")
        }
    })

    it("with the real docs/skills, shows every published skill on exactly one of the two pages", async () => {
        const { getSkills } = await import("@/lib/skills")
        const published = getSkills()
        expect(published.length).toBeGreaterThan(0)

        const onSkills = namesOn(await renderMain(skillsPage))
        const onStudies = namesOn(await renderMain(studiesPage))

        expect(onSkills.filter((name) => onStudies.includes(name))).toEqual([])
        expect([...onSkills, ...onStudies].sort()).toEqual(published.map((skill) => skill.name).sort())
        expect(onSkills.length).toBeGreaterThan(0)
        expect(onStudies.length).toBeGreaterThan(0)

        const byName = new Map(published.map((skill) => [skill.name, skill]))
        for (const name of onSkills) expect(getSkillFloor(byName.get(name)!), name).toBe(groupOf(skillsPage).floor)
        for (const name of onStudies) expect(getSkillFloor(byName.get(name)!), name).toBe(groupOf(studiesPage).floor)
    })
})
