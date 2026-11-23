import { describe, it, expect } from "vitest"
import { NAV_ITEMS, SOCIAL_LINKS } from "@/lib/constants"

/**
 * NAV_ITEMS contract tests for the site shell.
 *
 * The header nav, the mobile nav, the footer page list and the top page Explore
 * cards are all built from NAV_ITEMS. The renewal (#294) keeps the five places
 * Home / Profile / Skills / Portfolio / Contact with Japanese labels and drops
 * Books and Blog from the navigation (their pages stay reachable by URL).
 */
describe("NAV_ITEMS", () => {
    it("has the 5 entries left after Books and Blog are removed", () => {
        // Given the renewal keeps Home / Profile / Skills / Portfolio / Contact
        // When NAV_ITEMS is loaded
        // Then it provides exactly 5 entries
        expect(NAV_ITEMS).toHaveLength(5)
    })

    it("starts with the Home entry pointing at the site root", () => {
        // Given Home is the first nav link
        // When the first entry is read
        // Then it is the Home entry with href "/" and the Japanese label
        expect(NAV_ITEMS[0]).toMatchObject({
            href: "/",
            label: "ホーム",
        })
    })

    it("orders the Japanese labels Home, Profile, Skills, Portfolio, Contact", () => {
        // Given the labels are shown in Japanese in this order
        // When labels are extracted
        // Then they appear in that exact order
        const labels = NAV_ITEMS.map((item) => item.label)
        expect(labels).toEqual(["ホーム", "プロフィール", "スキル", "ポートフォリオ", "連絡先"])
    })

    it("maps each label to the existing service route", () => {
        // Given only the labels change, not the routes
        // When NAV_ITEMS is read
        // Then each entry keeps its href in order
        expect(NAV_ITEMS.map((item) => [item.href, item.label])).toEqual([
            ["/", "ホーム"],
            ["/profile", "プロフィール"],
            ["/skills", "スキル"],
            ["/portfolio", "ポートフォリオ"],
            ["/contact", "連絡先"],
        ])
    })

    it.each(["/books", "/blog"])("does not include the %s entry", (href) => {
        // Given Books and Blog are dropped from the navigation (the pages stay)
        // When NAV_ITEMS is searched by href and by label
        // Then neither form of the entry is present
        expect(NAV_ITEMS.find((item) => item.href === href)).toBeUndefined()
        const name = href.slice(1)
        expect(
            NAV_ITEMS.find((item) => item.label.trim().toLowerCase() === name)
        ).toBeUndefined()
    })

    it("does not include the News entry (news navigation removed)", () => {
        // Given the news navigation is removed ahead of the feature retirement (#141)
        // When NAV_ITEMS is searched for /news
        // Then no entry is found
        expect(NAV_ITEMS.find((item) => item.href === "/news")).toBeUndefined()
        expect(NAV_ITEMS.find((item) => item.label === "News")).toBeUndefined()
    })

    it("does not include the Social entry (moved to footer Find me)", () => {
        // Given Social is demoted from header to footer per draft
        // When NAV_ITEMS is searched for /social
        // Then no entry is found
        expect(NAV_ITEMS.find((item) => item.href === "/social")).toBeUndefined()
        expect(NAV_ITEMS.find((item) => item.label === "Social")).toBeUndefined()
    })

    it("provides href, label, and description for every entry", () => {
        // Given every nav entry must be renderable in mobile/desktop variants
        // When each item is inspected
        // Then it has non-empty href, label, and description
        for (const item of NAV_ITEMS) {
            expect(item.href).toMatch(/^\//)
            expect(item.label.length).toBeGreaterThan(0)
            expect(item.description.length).toBeGreaterThan(0)
        }
    })

    it("uses unique href values across entries", () => {
        // Given duplicate hrefs would break active-state detection
        // When hrefs are collected
        // Then they are all unique
        const hrefs = NAV_ITEMS.map((item) => item.href)
        expect(new Set(hrefs).size).toBe(hrefs.length)
    })
})

/**
 * SOCIAL_LINKS contract tests.
 *
 * Family tag: dry-violation (ARCH-NEW-social-urls-dup) re-prevention.
 *  Footer / Top page / Social page で重複していた SNS URL を 1 箇所に集約したため、
 *  契約 (3 件 / GitHub・Zenn・X / 必須フィールド / URL の絶対 URL 性) を固定する。
 */
describe("SOCIAL_LINKS", () => {
    it("contains GitHub, Zenn, and X (Twitter) entries", () => {
        // Given the design draft Footer "Find me" carries 3 SNS links
        // When SOCIAL_LINKS is read
        // Then all 3 names are present
        const names = SOCIAL_LINKS.map((s) => s.name)
        expect(names).toEqual(expect.arrayContaining(["GitHub", "Zenn", "X (Twitter)"]))
    })

    it("provides a non-empty name, url, and username for every entry", () => {
        // Given every SNS link must render a label and a username
        // When each entry is inspected
        // Then it has non-empty values for required fields
        for (const link of SOCIAL_LINKS) {
            expect(link.name.length).toBeGreaterThan(0)
            expect(link.username.length).toBeGreaterThan(0)
            expect(link.url.length).toBeGreaterThan(0)
        }
    })

    it("uses absolute https URLs for every entry", () => {
        // Given outbound links open in a new tab
        // When the URL scheme is inspected
        // Then every URL is an https URL
        for (const link of SOCIAL_LINKS) {
            expect(link.url.startsWith("https://")).toBe(true)
        }
    })

    it("uses unique names so the social page can build a presentation map keyed by name", () => {
        // Given the social page maps presentation by link.name
        // When names are collected
        // Then they are all unique
        const names = SOCIAL_LINKS.map((s) => s.name)
        expect(new Set(names).size).toBe(names.length)
    })
})
