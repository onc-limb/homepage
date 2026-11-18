// @vitest-environment jsdom
import type { ReactNode } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { NAV_ITEMS, SOCIAL_LINKS } from "@/lib/constants"
import { absoluteUrl, createPageMetadata, SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo"

const { getHomeStats } = vi.hoisted(() => ({ getHomeStats: vi.fn() }))

vi.mock("@/lib/stats", () => ({ getHomeStats }))

vi.mock("@/components/animations", () => ({
    Reveal: ({
        children,
        as: Tag = "div",
        className,
    }: {
        children: ReactNode
        as?: "div" | "header" | "article"
        className?: string
    }) => <Tag className={className}>{children}</Tag>,
    FloatingShapes: () => null,
    HeroSpotlight: () => null,
    HeroParticleTitle: () => null,
}))

import TopPage, * as pageModule from "./page"

async function renderTopPage() {
    const container = document.createElement("div")
    container.innerHTML = renderToStaticMarkup(await TopPage())
    return { container }
}

function findLinkByText(root: HTMLElement, text: string): HTMLAnchorElement {
    const link = Array.from(root.querySelectorAll("a")).find((a) =>
        a.textContent?.includes(text)
    )
    if (!link) throw new Error(`link not found: ${text}`)
    return link
}

function findSection(container: HTMLElement, marker: string): HTMLElement {
    const section = Array.from(container.querySelectorAll("section")).find((s) =>
        s.textContent?.includes(marker)
    )
    if (!section) throw new Error(`section not found: ${marker}`)
    return section
}

describe("TopPage", () => {
    beforeEach(() => {
        getHomeStats.mockResolvedValue({
            readBooksCount: 12,
            publishedArticlesCount: 34,
            usedTagCount: 5,
            totalBooksCount: 67,
        })
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    describe("rendering mode", () => {
        it("is rendered dynamically on every request", () => {
            expect(pageModule.dynamic).toBe("force-dynamic")
        })
    })

    describe("metadata", () => {
        it("uses the Home title, site description and root path", () => {
            expect(pageModule.metadata).toEqual(
                createPageMetadata({
                    title: "Home",
                    description: SITE_DESCRIPTION,
                    path: "/",
                })
            )
            expect(pageModule.metadata.title).toBe("Home")
            expect(pageModule.metadata.description).toBe(SITE_DESCRIPTION)
            expect(pageModule.metadata.alternates?.canonical).toBe(absoluteUrl("/"))
        })
    })

    describe("JSON-LD", () => {
        it("embeds a WebSite structured data block", async () => {
            const { container } = await renderTopPage()

            const scripts = container.querySelectorAll('script[type="application/ld+json"]')
            expect(scripts).toHaveLength(1)
            expect(JSON.parse(scripts[0].textContent ?? "")).toEqual({
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: SITE_NAME,
                url: absoluteUrl("/"),
                description: SITE_DESCRIPTION,
                inLanguage: "ja-JP",
            })
        })
    })

    describe("STATS", () => {
        it("shows the four values and labels in order", async () => {
            const { container } = await renderTopPage()

            const cells = findSection(container, "What I do").querySelectorAll(
                "div.bg-bg-elev.p-8"
            )
            expect(Array.from(cells).map((c) => c.textContent)).toEqual([
                "12books read",
                "34articles published",
                "5topics covered",
                "67books logged",
            ])
        })

        it("shows zeros when there is nothing to count", async () => {
            getHomeStats.mockResolvedValue({
                readBooksCount: 0,
                publishedArticlesCount: 0,
                usedTagCount: 0,
                totalBooksCount: 0,
            })
            const { container } = await renderTopPage()

            const cells = findSection(container, "What I do").querySelectorAll(
                "div.bg-bg-elev.p-8"
            )
            expect(Array.from(cells).map((c) => c.textContent)).toEqual([
                "0books read",
                "0articles published",
                "0topics covered",
                "0books logged",
            ])
        })

        it("maps each stat to its own label", async () => {
            getHomeStats.mockResolvedValue({
                readBooksCount: 1,
                publishedArticlesCount: 2,
                usedTagCount: 3,
                totalBooksCount: 4,
            })
            const { container } = await renderTopPage()

            const cells = findSection(container, "What I do").querySelectorAll(
                "div.bg-bg-elev.p-8"
            )
            expect(Array.from(cells).map((c) => c.textContent)).toEqual([
                "1books read",
                "2articles published",
                "3topics covered",
                "4books logged",
            ])
        })

        it("reads the stats once per render", async () => {
            await renderTopPage()
            expect(getHomeStats).toHaveBeenCalledTimes(1)
        })
    })

    describe("Explore", () => {
        it("links NAV_ITEMS without Home and Contact, in order", async () => {
            const { container } = await renderTopPage()
            const explore = findSection(container, "02 / Explore")

            const links = Array.from(explore.querySelectorAll("a"))
            const expected = NAV_ITEMS.filter((n) => n.href !== "/" && n.href !== "/contact")

            expect(expected.length).toBeGreaterThan(0)
            expect(links.map((a) => a.getAttribute("href"))).toEqual(expected.map((n) => n.href))
            links.forEach((a, i) => {
                expect(a.textContent).toContain(`→ ${expected[i].href}`)
                expect(a.textContent).toContain(expected[i].label)
                expect(a.textContent).toContain(expected[i].description)
            })
        })

        it("does not link Home or Contact from Explore", async () => {
            const { container } = await renderTopPage()
            const hrefs = Array.from(
                findSection(container, "02 / Explore").querySelectorAll("a")
            ).map((a) => a.getAttribute("href"))

            expect(hrefs).not.toContain("/")
            expect(hrefs).not.toContain("/contact")
        })
    })

    describe("call-to-action links", () => {
        it("hero links to contact, profile and portfolio", async () => {
            const { container } = await renderTopPage()
            const hero = container.querySelectorAll("section")[0]

            const links = Array.from(hero.querySelectorAll("a")).map((a) => [
                a.getAttribute("href"),
                a.textContent?.trim(),
            ])
            expect(links).toEqual([
                ["/contact", "仕事のお問い合わせはこちら"],
                ["/profile", "Profileを見る"],
                ["/portfolio", "作ったものを見る"],
            ])
        })

        it("CTA band links to contact and to GitHub as an external link", async () => {
            const { container } = await renderTopPage()
            const band = findSection(container, "仕事の話、しませんか。")

            const contact = findLinkByText(band, "お問い合わせ / ご相談")
            expect(contact?.getAttribute("href")).toBe("/contact")
            expect(contact?.hasAttribute("target")).toBe(false)

            const github = findLinkByText(band, "GitHub ↗")
            const githubUrl = SOCIAL_LINKS.find((s) => s.name === "GitHub")?.url
            expect(githubUrl).toBeTruthy()
            expect(github?.getAttribute("href")).toBe(githubUrl)
            expect(github?.getAttribute("target")).toBe("_blank")
            expect(github?.getAttribute("rel")).toBe("noopener noreferrer")
        })
    })

    describe("capabilities", () => {
        it("shows the three capability cards in order", async () => {
            const { container } = await renderTopPage()
            const cards = Array.from(findSection(container, "What I do").querySelectorAll("article"))

            expect(cards.map((c) => c.querySelector("h3")?.textContent)).toEqual([
                "Backend / Software Architecture",
                "Frontend & UX",
                "Infra / DevOps",
            ])
            expect(cards.map((c) => c.querySelector("div")?.textContent)).toEqual([
                "/01",
                "/02",
                "/03",
            ])
        })
    })
})
