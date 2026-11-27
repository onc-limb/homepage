import fs from "node:fs"
import path from "node:path"
import { describe, it, expect } from "vitest"

import { findGroup, toVirtualPath } from "@/lib/building/floors"
import * as portfolio from "@/lib/portfolio"
import {
    getProjects,
    listProjects,
    projectDate,
    projectHref,
    projectVirtualPath,
    resolveProjectPage,
    type Project,
} from "@/lib/portfolio"

/**
 * lib/portfolio contract tests.
 *
 * The list page, the detail pages (static params and pager doors) and the
 * sitemap all take their set and order from listProjects(): newest updatedAt
 * first, keeping the md order for equal timestamps. resolveProjectPage() finds
 * the project of a detail URL and its neighbours in that order. The md body is
 * kept whole (no section parsing) so the page can render it as is.
 */

const DOCS_ROOT = path.resolve(__dirname, "../../docs/portfolio")

function project(id: string, updatedAt: string): Project {
    return {
        id,
        updatedAt,
        title: `title ${id}`,
        description: `description ${id}`,
        technologies: [],
        role: "role",
        period: "period",
        highlights: [],
        body: "",
    }
}

/** Input order is neither the date order nor the id order; b and d share a timestamp. */
const PROJECTS = [
    project("c-old", "2025-01-01T00:00:00+09:00"),
    project("b-tie", "2026-07-14T19:55:38+09:00"),
    project("a-new", "2026-09-01T00:00:00+09:00"),
    project("d-tie", "2026-07-14T19:55:38+09:00"),
]

describe("getProjects()", () => {
    it("has a valid updatedAt timestamp for every project", () => {
        for (const project of getProjects()) {
            expect(Number.isFinite(Date.parse(project.updatedAt))).toBe(true)
        }
    })

    it("loads every md under docs/portfolio, each with its own id", () => {
        const files = fs.readdirSync(DOCS_ROOT).filter((file) => file.endsWith(".md"))
        const ids = getProjects().map((project) => project.id)
        expect(ids).toHaveLength(files.length)
        expect([...ids].sort()).toEqual(files.map((file) => file.replace(/\.md$/, "")).sort())
    })

    it("keeps the md body after the frontmatter as is", () => {
        for (const project of getProjects()) {
            const raw = fs.readFileSync(path.join(DOCS_ROOT, `${project.id}.md`), "utf-8")
            const afterFrontmatter = raw.replace(/^---\n[\s\S]*?\n---\n/, "")
            expect(project.body.trim(), project.id).toBe(afterFrontmatter.trim())
            // the frontmatter is not part of the body
            expect(project.body, project.id).not.toMatch(/^title:/m)
            expect(project.body, project.id).not.toMatch(/^highlights:/m)
        }
    })

    it("no longer parses the body into sections", () => {
        for (const project of getProjects()) {
            expect(project, project.id).not.toHaveProperty("detail")
        }
    })
})

describe("listProjects()", () => {
    it("orders the projects newest first and keeps the input order for equal timestamps", () => {
        expect(listProjects(PROJECTS).map((p) => p.id)).toEqual(["a-new", "b-tie", "d-tie", "c-old"])
    })

    it("does not reorder its input", () => {
        const input = [...PROJECTS]
        listProjects(input)
        expect(input.map((p) => p.id)).toEqual(PROJECTS.map((p) => p.id))
    })

    it("with the real md, lists every project once", () => {
        const projects = getProjects()
        const listed = listProjects(projects)
        expect(listed).toHaveLength(projects.length)
        expect(new Set(listed.map((p) => p.id)).size).toBe(projects.length)
        const dates = listed.map((p) => Date.parse(p.updatedAt))
        expect(dates).toEqual([...dates].sort((a, b) => b - a))
    })
})

describe("project URL, virtual path and date", () => {
    it("puts the detail page under the portfolios group URL", () => {
        expect(projectHref(project("climbinsight", "2026-01-01"))).toBe(`${findGroup("portfolios").url}/climbinsight`)
        expect(projectHref(project("climbinsight", "2026-01-01"))).toBe("/3f/portfolios/climbinsight")
    })

    it("names the md under the virtual path of the group", () => {
        expect(projectVirtualPath(project("climbinsight", "2026-01-01"))).toBe(
            `${toVirtualPath(findGroup("portfolios").url)}/climbinsight.md`,
        )
        expect(projectVirtualPath(project("climbinsight", "2026-01-01"))).toBe("~/3f/portfolios/climbinsight.md")
    })

    it("shows the date of updatedAt as YYYY-MM-DD", () => {
        expect(projectDate(project("x", "2026-07-14T19:55:38+09:00"))).toBe("2026-07-14")
        for (const p of getProjects()) {
            expect(projectDate(p), p.id).toMatch(/^\d{4}-\d{2}-\d{2}$/)
        }
    })
})

describe("resolveProjectPage()", () => {
    it("finds a project with its neighbours in list order", () => {
        const resolved = resolveProjectPage(PROJECTS, "b-tie")
        expect(resolved.kind).toBe("found")
        if (resolved.kind !== "found") return
        expect(resolved.project.id).toBe("b-tie")
        expect(resolved.prev?.id).toBe("a-new")
        expect(resolved.next?.id).toBe("d-tie")
    })

    it("has no previous project for the first and no next project for the last", () => {
        const first = resolveProjectPage(PROJECTS, "a-new")
        const last = resolveProjectPage(PROJECTS, "c-old")
        expect(first.kind === "found" && first.prev).toBeUndefined()
        expect(first.kind === "found" && first.next?.id).toBe("b-tie")
        expect(last.kind === "found" && last.prev?.id).toBe("d-tie")
        expect(last.kind === "found" && last.next).toBeUndefined()
    })

    it.each(["unknown", "", "A-NEW", "title a-new"])("is missing for %j", (id) => {
        expect(resolveProjectPage(PROJECTS, id)).toEqual({ kind: "missing" })
    })
})

describe("removed helpers", () => {
    it.each(["getProjectById", "getProjectIds", "findAdjacentProjectIds", "formatProjectNumber"])(
        "no longer exports %s",
        (name) => {
            expect(name in portfolio).toBe(false)
        },
    )
})
