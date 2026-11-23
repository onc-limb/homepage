import { describe, expect, it } from "vitest"
import * as navUtils from "@/components/header/nav-utils"
import { isNavItemActive } from "@/components/header/nav-utils"

/**
 * isNavItemActive contract tests.
 *
 * Family tag: dry-violation (ARCH-NEW-isActive-dup) re-prevention.
 *  SiteNav と MobileNav に重複していた `isActive` ロジックをここに集約したため、
 *  両ナビが共通の active 判定ルールに従い続けるよう契約を固定する。
 *
 * The nav items are 案内 (`/`) and the five floors. A floor item is current when
 * the page belongs to that floor: its URL is the floor URL or under it, or it is
 * the transitional href of one of the floor's groups (or under it).
 */

describe("isNavItemActive()", () => {
    it("treats '/' as active only on the exact root pathname", () => {
        // Given the root nav item href "/"
        // When pathname is "/"
        // Then it is active; otherwise inactive
        expect(isNavItemActive("/", "/")).toBe(true)
        expect(isNavItemActive("/2f", "/")).toBe(false)
        expect(isNavItemActive("/skills", "/")).toBe(false)
        expect(isNavItemActive("/books", "/")).toBe(false)
    })

    it.each([
        ["/2f", "/2f"],
        ["/2f/skills", "/2f"],
        ["/skills", "/2f"],
        ["/skills/typescript", "/2f"],
        ["/portfolio/onc-limb", "/3f"],
        ["/profile", "/1f"],
        ["/contact", "/1f"],
        ["/rf", "/rf"],
    ])("marks the floor item on %s as active for %s", (pathname, href) => {
        // Given a page that belongs to a floor (including transitional URLs)
        // When the item of that floor is checked
        // Then it is active
        expect(isNavItemActive(pathname, href)).toBe(true)
    })

    it.each([
        ["/skills", "/b1"],
        ["/profile", "/2f"],
        ["/2f/skills", "/1f"],
        ["/2fx", "/2f"],
        ["/skillset", "/2f"],
        ["/books", "/2f"],
        ["/", "/2f"],
    ])("does not mark the floor item on %s as active for %s", (pathname, href) => {
        // Given a page on another floor, a URL that only shares leading characters,
        //   or a page on no floor
        // When a floor item is checked
        // Then it is not active
        expect(isNavItemActive(pathname, href)).toBe(false)
    })
})

describe("prompt path conversion", () => {
    it("is not kept in nav-utils (the only conversion lives in lib/building/floors)", () => {
        expect("toPromptPath" in navUtils).toBe(false)
    })
})
