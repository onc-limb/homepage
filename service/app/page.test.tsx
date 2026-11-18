// @vitest-environment jsdom
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    getHomeStats: vi.fn(),
}))
vi.mock("@/lib/stats", () => mocks)
vi.mock("@/components/animations", () => {
    const Reveal = ({
        as: Tag = "div",
        children,
        delay: _delay,
        ...props
    }: React.HTMLAttributes<HTMLElement> & {
        as?: React.ElementType
        delay?: number
    }) => <Tag {...props}>{children}</Tag>
    return {
        Reveal,
        FloatingShapes: () => null,
        HeroSpotlight: () => null,
        HeroParticleTitle: () => null,
    }
})

import TopPage, { dynamic, metadata } from "@/app/page"

async function renderPage(): Promise<Document> {
    const html = renderToStaticMarkup(await TopPage())
    const container = document.createElement("div")
    container.innerHTML = html
    return {
        querySelector: container.querySelector.bind(container),
        querySelectorAll: container.querySelectorAll.bind(container),
    } as unknown as Document
}

function sectionContaining(root: Document, marker: string): Element {
    const section = Array.from(root.querySelectorAll("section")).find((s) =>
        s.textContent?.includes(marker)
    )
    if (!section) throw new Error(`section containing "${marker}" not found`)
    return section
}

function statSlots(root: Document): Array<{ value: string; label: string }> {
    const section = sectionContaining(root, "books read")
    return Array.from(section.querySelectorAll("span.font-mono.text-\\[36px\\]")).map(
        (valueEl) => ({
            value: valueEl.textContent ?? "",
            label: valueEl.nextElementSibling?.textContent ?? "",
        })
    )
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

describe("top page stats", () => {
    it("renders the four stats with their labels in order", async () => {
        const root = await renderPage()
        expect(statSlots(root)).toEqual([
            { value: "8", label: "books read" },
            { value: "5", label: "articles published" },
            { value: "7", label: "topics covered" },
            { value: "12", label: "books logged" },
        ])
    })

    it("renders every stat slot as 0 when nothing is counted", async () => {
        mocks.getHomeStats.mockResolvedValue({
            readBooksCount: 0,
            publishedArticlesCount: 0,
            usedTagCount: 0,
            totalBooksCount: 0,
        })
        const root = await renderPage()
        expect(statSlots(root)).toEqual([
            { value: "0", label: "books read" },
            { value: "0", label: "articles published" },
            { value: "0", label: "topics covered" },
            { value: "0", label: "books logged" },
        ])
    })
})

describe("top page explore links", () => {
    const expected = [
        { href: "/profile", label: "Profile", description: "経歴と価値観、エンジニアとしての今" },
        { href: "/skills", label: "Skills", description: "技術スタックと習熟度を可視化" },
        {
            href: "/portfolio",
            label: "Portfolio",
            description: "制作したアプリケーションとプロジェクト",
        },
        { href: "/books", label: "Books", description: "読書記録、知識を線でつなぐ" },
        {
            href: "/blog",
            label: "Blog",
            description: "技術記事、学んだことを言葉にして残す",
        },
    ]

    it("lists navigation items except Home and Contact, in order, with label and description", async () => {
        const root = await renderPage()
        const section = sectionContaining(root, "02 / Explore")
        const cards = Array.from(section.querySelectorAll("a")).map((a) => ({
            href: a.getAttribute("href"),
            hint: a.querySelector("span")?.textContent,
            label: a.querySelector("div")?.firstChild?.textContent,
            description: a.querySelectorAll("div")[1]?.textContent,
        }))
        expect(cards).toEqual(
            expected.map((e) => ({
                href: e.href,
                hint: `→ ${e.href}`,
                label: e.label,
                description: e.description,
            }))
        )
    })

    it("matches the constants-derived navigation (Home and Contact excluded)", async () => {
        const { NAV_ITEMS } = await import("@/lib/constants")
        const derived = NAV_ITEMS.filter((n) => n.href !== "/" && n.href !== "/contact")
        expect(derived.map(({ href, label, description }) => ({ href, label, description }))).toEqual(
            expected
        )
    })
})

describe("top page action links", () => {
    it("links the hero buttons to contact, profile and portfolio in order", async () => {
        const root = await renderPage()
        const hero = root.querySelectorAll("section")[0]
        expect(Array.from(hero.querySelectorAll("a")).map((a) => a.getAttribute("href"))).toEqual([
            "/contact",
            "/profile",
            "/portfolio",
        ])
    })

    it("links the CTA band to contact and an external GitHub page", async () => {
        const root = await renderPage()
        const band = sectionContaining(root, "仕事の話、しませんか。")
        const links = Array.from(band.querySelectorAll("a"))
        expect(links.map((a) => a.getAttribute("href"))).toEqual([
            "/contact",
            "https://github.com/onc-limb",
        ])
        const [contact, github] = links
        expect(contact.getAttribute("target")).toBeNull()
        expect(github.getAttribute("target")).toBe("_blank")
        expect(github.getAttribute("rel")).toBe("noopener noreferrer")
    })
})

describe("top page metadata and rendering mode", () => {
    it("declares title, description and canonical url", async () => {
        const { SITE_DESCRIPTION } = await import("@/lib/seo")
        expect(metadata.title).toBe("Home")
        expect(metadata.description).toBe(SITE_DESCRIPTION)
        expect(metadata.description).toBe(
            "ソフトウェアアーキテクトの視点で、設計から実装・運用まで担うフルスタックエンジニア onclimb のポートフォリオ。"
        )
        expect(metadata.alternates?.canonical).toBe(new URL("/", process.env.NEXT_PUBLIC_SITE_URL ?? "https://onc-limb.com").toString())
    })

    it("embeds WebSite JSON-LD", async () => {
        const root = await renderPage()
        const scripts = root.querySelectorAll('script[type="application/ld+json"]')
        expect(scripts).toHaveLength(1)
        const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://onc-limb.com"
        expect(JSON.parse(scripts[0].textContent ?? "")).toEqual({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "onclimb",
            url: new URL("/", base).toString(),
            description:
                "ソフトウェアアーキテクトの視点で、設計から実装・運用まで担うフルスタックエンジニア onclimb のポートフォリオ。",
            inLanguage: "ja-JP",
        })
    })

    it("renders dynamically on every request", () => {
        expect(dynamic).toBe("force-dynamic")
    })
})

describe("top page without a GitHub social link", () => {
    it("fails to load with a typed reason naming the missing link", async () => {
        vi.resetModules()
        vi.doMock("@/lib/constants", async (importOriginal) => {
            const actual = await importOriginal<typeof import("@/lib/constants")>()
            return {
                ...actual,
                SOCIAL_LINKS: actual.SOCIAL_LINKS.filter((s) => s.name !== "GitHub"),
            }
        })
        try {
            await expect(import("@/app/page")).rejects.toMatchObject({
                name: "MissingSocialLinkError",
                linkName: "GitHub",
            })
        } finally {
            vi.doUnmock("@/lib/constants")
            vi.resetModules()
        }
    })
})
