// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server"
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => {
    // SITE_URL is evaluated when @/lib/seo is imported, so pin the default origin first.
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", undefined)
    return { getHomeStats: vi.fn() }
})
vi.mock("@/lib/stats", () => ({ getHomeStats: mocks.getHomeStats }))

import TopPage, { dynamic, metadata } from "@/app/page"
import { NAV_ITEMS } from "@/lib/constants"

const ORIGIN_ROOT = "https://onc-limb.com/"
const DESCRIPTION =
    "ソフトウェアアーキテクトの視点で、設計から実装・運用まで担うフルスタックエンジニア onclimb のポートフォリオ。"
const STAT_LABELS = ["books read", "articles published", "topics covered", "books logged"]

async function renderTopPage(): Promise<Document> {
    const html = renderToStaticMarkup(await TopPage())
    return new DOMParser().parseFromString(html, "text/html")
}

function statValues(doc: Document): Array<{ label: string; value: string }> {
    const labelElements = Array.from(doc.querySelectorAll("div")).filter(
        (el) =>
            el.children.length === 0 && STAT_LABELS.includes(el.textContent?.trim() ?? "")
    )
    return labelElements.map((el) => ({
        label: el.textContent?.trim() ?? "",
        value: el.previousElementSibling?.textContent?.trim() ?? "",
    }))
}

function linkByText(doc: Document, text: string): HTMLAnchorElement {
    const links = Array.from(doc.querySelectorAll("a")).filter(
        (a) => a.textContent?.trim() === text
    )
    expect(links).toHaveLength(1)
    return links[0]
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

afterAll(() => {
    vi.unstubAllEnvs()
})

describe("top page STATS", () => {
    it("shows the four getHomeStats values with their labels in a fixed order", async () => {
        const doc = await renderTopPage()

        expect(mocks.getHomeStats).toHaveBeenCalledTimes(1)
        expect(statValues(doc)).toEqual([
            { label: "books read", value: "8" },
            { label: "articles published", value: "5" },
            { label: "topics covered", value: "7" },
            { label: "books logged", value: "12" },
        ])
    })

    it("shows 0 in every slot when there is nothing to count", async () => {
        mocks.getHomeStats.mockResolvedValue({
            readBooksCount: 0,
            publishedArticlesCount: 0,
            usedTagCount: 0,
            totalBooksCount: 0,
        })

        const doc = await renderTopPage()

        expect(statValues(doc)).toEqual([
            { label: "books read", value: "0" },
            { label: "articles published", value: "0" },
            { label: "topics covered", value: "0" },
            { label: "books logged", value: "0" },
        ])
    })
})

describe("top page Explore", () => {
    it("links every NAV_ITEMS entry except Home and Contact, in order", async () => {
        const doc = await renderTopPage()
        const cards = Array.from(doc.querySelectorAll("a")).filter((a) =>
            a.textContent?.includes("→ /")
        )
        const expected = NAV_ITEMS.filter(
            (item) => item.label !== "Home" && item.label !== "Contact"
        )

        expect(cards.map((a) => a.getAttribute("href"))).toEqual([
            "/profile",
            "/skills",
            "/portfolio",
            "/books",
            "/blog",
        ])
        expect(cards.map((a) => a.getAttribute("href"))).toEqual(
            expected.map((item) => item.href)
        )
        cards.forEach((card, i) => {
            const item = expected[i]
            expect(card.textContent).toContain(`→ ${item.href}`)
            expect(card.textContent).toContain(item.label)
            expect(card.textContent).toContain(item.description)
        })
    })

    it("has no card for Home or Contact", async () => {
        const doc = await renderTopPage()
        const cards = Array.from(doc.querySelectorAll("a")).filter((a) =>
            a.textContent?.includes("→ /")
        )

        for (const card of cards) {
            expect(card.textContent).not.toContain("トップページ")
            expect(card.textContent).not.toContain("仕事のご相談・お問い合わせ")
        }
    })
})

describe("top page calls to action", () => {
    it("links the hero and CTA band buttons to their pages", async () => {
        const doc = await renderTopPage()

        expect(linkByText(doc, "仕事のお問い合わせはこちら").getAttribute("href")).toBe(
            "/contact"
        )
        expect(linkByText(doc, "Profileを見る").getAttribute("href")).toBe("/profile")
        expect(linkByText(doc, "作ったものを見る").getAttribute("href")).toBe("/portfolio")
        expect(linkByText(doc, "お問い合わせ / ご相談").getAttribute("href")).toBe(
            "/contact"
        )
    })

    it("opens GitHub as an external link in a new tab", async () => {
        const doc = await renderTopPage()
        const github = linkByText(doc, "GitHub ↗")

        expect(github.getAttribute("href")).toBe("https://github.com/onc-limb")
        expect(github.getAttribute("target")).toBe("_blank")
        expect(github.getAttribute("rel")).toBe("noopener noreferrer")
    })
})

describe("top page metadata and structured data", () => {
    it("exports metadata for the root path", () => {
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
        const doc = await renderTopPage()
        const scripts = doc.querySelectorAll('script[type="application/ld+json"]')

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

    it("renders dynamically on every request", () => {
        expect(dynamic).toBe("force-dynamic")
    })
})
