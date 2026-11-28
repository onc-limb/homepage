import fs from "node:fs"
import path from "node:path"
import { describe, it, expect } from "vitest"
import { FLOORS } from "@/lib/building/floors"
import { NAV_ITEMS, SOCIAL_LINKS } from "@/lib/constants"

/**
 * NAV_ITEMS contract tests for the site shell.
 *
 * The header nav, the mobile nav and the footer page list use NAV_ITEMS.
 * The navigation is 案内 (the site root) and the five floors from FLOORS,
 * each shown as "<label> <navName>".
 * Books and Blog stay out of the navigation (their pages stay reachable by URL).
 */
describe("NAV_ITEMS", () => {
    it("has 6 entries: 案内 and the five floors", () => {
        expect(NAV_ITEMS).toHaveLength(6)
    })

    it("starts with 案内 pointing at the site root", () => {
        expect(NAV_ITEMS[0]).toMatchObject({
            href: "/",
            label: "案内",
        })
    })

    it("lists 案内 / B1 自己学習 / 1F プロフィール / 2F 経歴・技術 / 3F 作品・考え / 屋上 リンク in order", () => {
        expect(NAV_ITEMS.map((item) => [item.href, item.label])).toEqual([
            ["/", "案内"],
            ["/b1", "B1 自己学習"],
            ["/1f", "1F プロフィール"],
            ["/2f", "2F 経歴・技術"],
            ["/3f", "3F 作品・考え"],
            ["/rf", "屋上 リンク"],
        ])
    })

    it("builds the floor entries from FLOORS (floor url, label and navName)", () => {
        expect(NAV_ITEMS.slice(1).map((item) => [item.href, item.label])).toEqual(
            FLOORS.map((floor) => [floor.url, `${floor.label} ${floor.navName}`])
        )
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

    it("gives every entry a one-line note of what is found there", () => {
        // Given the rooftop doors show the site name and a one-line note
        // When note is read for each entry
        // Then GitHub = ソースコード, Zenn = 技術記事, X = 近況
        expect(SOCIAL_LINKS.map((link) => [link.url, link.note])).toEqual([
            ["https://github.com/onc-limb", "ソースコード"],
            ["https://zenn.dev/onclimb", "技術記事"],
            ["https://twitter.com/onc_limb", "近況"],
        ])
    })

    it("gives every entry the description the guide reads out on the rooftop", () => {
        // order.md やること 1: GitHub / Zenn / X の説明は定義に持たせる（↗ は DoorButton が付けるので書かない）
        expect(SOCIAL_LINKS.map((link) => [link.url, link.description])).toEqual([
            ["https://github.com/onc-limb", "ソースコードを置いている GitHub へ出ます。"],
            ["https://zenn.dev/onclimb", "技術記事を書いている Zenn へ出ます。"],
            ["https://twitter.com/onc_limb", "X（@onc_limb）へ出ます。"],
        ])
        for (const link of SOCIAL_LINKS) expect(link.description, link.name).not.toContain("↗")
    })

    it("builds the X description from its username so the handle is written once", () => {
        const source = fs.readFileSync(path.resolve(__dirname, "../constants.ts"), "utf-8")
        const x = SOCIAL_LINKS.find((link) => link.url === "https://twitter.com/onc_limb")!
        expect(x.description).toContain(x.username)
        expect(source.split("@onc_limb").length - 1, "@onc_limb written once in constants.ts").toBe(1)
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
