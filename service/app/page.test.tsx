/** @vitest-environment jsdom */
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { absoluteUrl, createPageMetadata, SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo"

// The page aggregates STATS from the DB through `@/lib/stats`. Replace it so the
// test never touches a real database.
const mocks = vi.hoisted(() => ({
    getHomeStats: vi.fn(),
}))
vi.mock("@/lib/stats", () => ({
    getHomeStats: mocks.getHomeStats,
}))
vi.mock("@/components/animations", () => ({
    Reveal: ({
        as: Tag = "div",
        children,
        delay: _delay,
        ...props
    }: React.HTMLAttributes<HTMLElement> & {
        as?: React.ElementType
        delay?: number
    }) => <Tag {...props}>{children}</Tag>,
    FloatingShapes: () => null,
    HeroSpotlight: () => null,
    HeroParticleTitle: () => null,
}))

import TopPage, { dynamic, metadata } from "@/app/page"

async function renderTopPage(): Promise<Document> {
    const html = renderToStaticMarkup(await TopPage())
    return new DOMParser().parseFromString(html, "text/html")
}

function statCells(doc: Document): Array<{ value: string; label: string; hasSup: boolean }> {
    return Array.from(doc.querySelectorAll("div.bg-bg-elev.p-8.text-left")).map((cell) => ({
        value: cell.querySelector("span")?.textContent ?? "",
        label: cell.querySelector("div")?.textContent ?? "",
        hasSup: cell.querySelector("sup") !== null,
    }))
}

function linkSummary(anchor: Element): { href: string | null; text: string } {
    return { href: anchor.getAttribute("href"), text: (anchor.textContent ?? "").trim() }
}

beforeEach(() => {
    mocks.getHomeStats.mockReset()
    mocks.getHomeStats.mockResolvedValue({
        readBooksCount: 8,
        publishedArticlesCount: 5,
        usedTagCount: 7,
        totalBooksCount: 12,
    })
})

describe("top page", () => {
    it("renders the four STATS cells with the aggregated values and labels in order", async () => {
        const doc = await renderTopPage()

        expect(mocks.getHomeStats).toHaveBeenCalledTimes(1)
        expect(statCells(doc)).toEqual([
            { value: "8", label: "books read", hasSup: false },
            { value: "5", label: "articles published", hasSup: false },
            { value: "7", label: "topics covered", hasSup: false },
            { value: "12", label: "books logged", hasSup: false },
        ])
    })

    it("renders 0 in every STATS cell when nothing is counted", async () => {
        mocks.getHomeStats.mockResolvedValue({
            readBooksCount: 0,
            publishedArticlesCount: 0,
            usedTagCount: 0,
            totalBooksCount: 0,
        })

        const doc = await renderTopPage()

        expect(statCells(doc)).toEqual([
            { value: "0", label: "books read", hasSup: false },
            { value: "0", label: "articles published", hasSup: false },
            { value: "0", label: "topics covered", hasSup: false },
            { value: "0", label: "books logged", hasSup: false },
        ])
    })

    it("renders Explore links from NAV_ITEMS without Home and Contact, in order", async () => {
        const doc = await renderTopPage()

        // Each card is: <span>→ href</span><div>label<span>↗</span></div><div>description</div>
        const items = Array.from(doc.querySelectorAll("a.explore")).map((a) => {
            const [hrefLine, labelLine, descriptionLine] = Array.from(a.children)
            return {
                href: a.getAttribute("href"),
                hrefLine: hrefLine?.textContent,
                label: labelLine?.firstChild?.textContent,
                description: descriptionLine?.textContent,
            }
        })

        expect(items).toEqual([
            {
                href: "/profile",
                hrefLine: "→ /profile",
                label: "Profile",
                description: "経歴と価値観、エンジニアとしての今",
            },
            {
                href: "/skills",
                hrefLine: "→ /skills",
                label: "Skills",
                description: "技術スタックと習熟度を可視化",
            },
            {
                href: "/portfolio",
                hrefLine: "→ /portfolio",
                label: "Portfolio",
                description: "制作したアプリケーションとプロジェクト",
            },
            {
                href: "/books",
                hrefLine: "→ /books",
                label: "Books",
                description: "読書記録、知識を線でつなぐ",
            },
            {
                href: "/blog",
                hrefLine: "→ /blog",
                label: "Blog",
                description: "技術記事、学んだことを言葉にして残す",
            },
        ])
    })

    it("renders the hero call-to-action links", async () => {
        const doc = await renderTopPage()

        const hero = doc.querySelector("main > section")
        expect(hero).not.toBeNull()
        expect(Array.from(hero!.querySelectorAll("a")).map(linkSummary)).toEqual([
            { href: "/contact", text: "仕事のお問い合わせはこちら" },
            { href: "/profile", text: "Profileを見る" },
            { href: "/portfolio", text: "作ったものを見る" },
        ])
    })

    it("renders the CTA band with the contact link and an external GitHub link", async () => {
        const doc = await renderTopPage()

        const sections = doc.querySelectorAll("main > section")
        const ctaBand = sections[sections.length - 1]
        const anchors = Array.from(ctaBand.querySelectorAll("a"))
        expect(anchors.map(linkSummary)).toEqual([
            { href: "/contact", text: "お問い合わせ / ご相談" },
            { href: "https://github.com/onc-limb", text: "GitHub ↗" },
        ])

        const contact = anchors[0]
        expect(contact.hasAttribute("target")).toBe(false)
        expect(contact.hasAttribute("rel")).toBe(false)

        const github = anchors[1]
        expect(github.getAttribute("target")).toBe("_blank")
        expect(github.getAttribute("rel")).toBe("noopener noreferrer")

        // GitHub is the only link on the page that opens in a new tab.
        expect(
            Array.from(doc.querySelectorAll('a[target="_blank"]')).map((a) => a.getAttribute("href"))
        ).toEqual(["https://github.com/onc-limb"])
    })

    it("embeds the WebSite JSON-LD", async () => {
        const doc = await renderTopPage()

        const scripts = doc.querySelectorAll('script[type="application/ld+json"]')
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

    it("exports metadata for the Home page at path /", () => {
        expect(metadata).toEqual(
            createPageMetadata({ title: "Home", description: SITE_DESCRIPTION, path: "/" })
        )
        expect(metadata.title).toBe("Home")
        expect(metadata.description).toBe(SITE_DESCRIPTION)
        expect(metadata.alternates?.canonical).toBe(absoluteUrl("/"))
    })

    it("renders dynamically on every request", () => {
        expect(dynamic).toBe("force-dynamic")
    })
})
