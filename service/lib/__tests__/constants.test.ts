import { describe, it, expect } from "vitest"
import { NAV_ITEMS, SOCIAL_LINKS } from "@/lib/constants"

/**
 * NAV_ITEMS contract tests for the docs/design site shell.
 *
 * Plan: design 素案 `shared/shell.js` の `NAV` 配列順序に合わせ、
 *   [Home, Profile, Skills, Portfolio, News, Books] とする。
 *   Social はヘッダーから外し、フッター "Find me" カラムへ降格する。
 *   #124: Blog を末尾に加え、他項目と同じく NAV_ITEMS 経由で
 *   SiteNav / MobileNav から一貫描画する（SiteShell の別建てナビは撤去）。
 *   ニュース機能撤去に伴い、まず導線として News エントリを NAV_ITEMS から削除。
 *   これによりヘッダー / トップ 02 カード / フッター Sitemap の 3 箇所すべてから
 *   News リンクが一括で消える（機能本体の撤去は #141）。
 *
 * Reference: docs/design/shared/shell.js:34-41
 */
describe("NAV_ITEMS", () => {
    it("has the 6 entries remaining after News removal (Blog added in #124)", () => {
        // Given the design draft NAV plus Blog (#124), minus the removed News entry
        // When NAV_ITEMS is loaded
        // Then it provides exactly 6 entries
        expect(NAV_ITEMS).toHaveLength(6)
    })

    it("starts with the Home entry pointing at the site root", () => {
        // Given the draft places Home as the first nav link
        // When the first entry is read
        // Then it is the Home entry with href "/"
        expect(NAV_ITEMS[0]).toMatchObject({
            href: "/",
            label: "Home",
        })
    })

    it("orders entries to match the design draft sequence without News", () => {
        // Given the draft NAV order minus News: Home / Profile / Skills / Portfolio / Books / Blog
        // When labels are extracted
        // Then they appear in that exact order
        const labels = NAV_ITEMS.map((item) => item.label)
        expect(labels).toEqual([
            "Home",
            "Profile",
            "Skills",
            "Portfolio",
            "Books",
            "Blog",
        ])
    })

    it("maps each label to the existing service route", () => {
        // Given the route map between draft labels and existing service routes
        // When NAV_ITEMS is read
        // Then each label resolves to the expected href
        const hrefByLabel = Object.fromEntries(
            NAV_ITEMS.map((item) => [item.label, item.href])
        )
        expect(hrefByLabel).toEqual({
            Home: "/",
            Profile: "/profile",
            Skills: "/skills",
            Portfolio: "/portfolio",
            Books: "/books",
            Blog: "/blog",
        })
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
