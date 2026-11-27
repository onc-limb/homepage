import { describe, it, expect } from "vitest"
import { existsSync, readdirSync, readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join, relative, sep } from "node:path"
import tailwindConfig from "../../tailwind.config"

/**
 * Shared breakpoints (docs/adr/0001-responsive-breakpoints.md).
 *
 * The app switches layouts only at Tailwind's default `md` (768px), `lg`
 * (1024px) and `xl` (1280px). Components and pages do not write their own
 * widths: no arbitrary media variants (`[@media(...)]:`, `min-[...]:`,
 * `max-[...]:`) in the source, no width media queries in CSS other than the
 * three shared values, and no custom `screens` in the Tailwind config.
 *
 * LEGACY lists old-design files that still use their own widths. They are
 * removed by the renewal jobs named next to them; a listed file that no longer
 * exists is simply skipped, so deleting it needs no change here. Do not add new
 * entries.
 */

const here = dirname(fileURLToPath(import.meta.url))
// service/lib/__tests__ -> service
const serviceRoot = join(here, "..", "..")

const SCAN_DIRS = ["app", "components", "lib"] as const
const SCAN_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".css"] as const
const SKIP_DIRS = new Set(["__tests__", "node_modules", ".next", ".open-next"])
const isTestFile = (name: string) => /\.test\.[jt]sx?$/.test(name)

/** Shared breakpoint widths in px (Tailwind's defaults for md / lg / xl). */
const SHARED_WIDTHS = new Set([768, 1024, 1280])

/** Old-design files with their own widths, and the job that removes each. */
const LEGACY = new Set([
    "app/portfolio/[id]/page.tsx", // job 13 (3F portfolios)
    "components/portfolio/Pager.tsx", // job 13
    "components/portfolio/ProjectCard.tsx", // job 13
    "components/books/BookListView.tsx", // job 22 (remove books)
    "components/blog/BlogListContent.tsx", // job 23 (remove blog)
])

const ARBITRARY_VARIANT = /\[@media|(?:^|[\s"'`:])(?:min|max)-\[/

function collectFiles(dir: string): string[] {
    const out: string[] = []
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) {
            if (SKIP_DIRS.has(entry.name)) continue
            out.push(...collectFiles(join(dir, entry.name)))
            continue
        }
        if (!entry.isFile() || isTestFile(entry.name)) continue
        if (SCAN_EXTENSIONS.some((ext) => entry.name.endsWith(ext))) {
            out.push(join(dir, entry.name))
        }
    }
    return out
}

const toKey = (file: string) => relative(serviceRoot, file).split(sep).join("/")

const files = SCAN_DIRS.flatMap((d) => collectFiles(join(serviceRoot, d))).filter(
    (file) => !LEGACY.has(toKey(file))
)

describe("shared breakpoints (ADR-0001)", () => {
    it("scans a non-trivial number of source files (guards against an empty walk)", () => {
        expect(files.length).toBeGreaterThan(20)
    })

    it("writes no arbitrary media variants in the source", () => {
        const offenders = files
            .filter((file) => !file.endsWith(".css"))
            .flatMap((file) =>
                readFileSync(file, "utf8")
                    .split("\n")
                    .map((line, i) => ({ line, at: `${toKey(file)}:${i + 1}` }))
                    .filter(({ line }) => ARBITRARY_VARIANT.test(line))
                    .map(({ at, line }) => `${at}: ${line.trim()}`)
            )
        expect(offenders).toEqual([])
    })

    it("uses only the shared widths in CSS width media queries", () => {
        const offenders = files
            .filter((file) => file.endsWith(".css"))
            .flatMap((file) =>
                [...readFileSync(file, "utf8").matchAll(/\((?:min|max)-width:\s*(\d+)px\)/g)]
                    .filter((match) => !SHARED_WIDTHS.has(Number(match[1])))
                    .map((match) => `${toKey(file)}: ${match[0]}`)
            )
        expect(offenders).toEqual([])
    })

    it("keeps Tailwind's default screens (no custom breakpoints in the config)", () => {
        const theme = tailwindConfig.theme ?? {}
        expect(theme.screens).toBeUndefined()
        expect(theme.extend?.screens).toBeUndefined()
    })

    it("lists only legacy files that the walk would otherwise flag", () => {
        // A listed file that still exists must still need the exemption, so the
        // list cannot quietly hide new code once the old widths are gone.
        const unneeded = [...LEGACY].filter((key) => {
            const file = join(serviceRoot, key)
            return existsSync(file) && !ARBITRARY_VARIANT.test(readFileSync(file, "utf8"))
        })
        expect(unneeded).toEqual([])
    })
})
