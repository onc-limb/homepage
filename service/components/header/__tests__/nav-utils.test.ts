import { describe, expect, it } from "vitest"
import { isNavItemActive } from "@/components/header/nav-utils"

/**
 * isNavItemActive contract tests.
 *
 * Family tag: dry-violation (ARCH-NEW-isActive-dup) re-prevention.
 *  SiteNav と MobileNav に重複していた `isActive` ロジックをここに集約したため、
 *  両ナビが共通の active 判定ルールに従い続けるよう契約を固定する。
 */

describe("isNavItemActive()", () => {
    it("treats '/' as active only on the exact root pathname", () => {
        // Given the root nav item href "/"
        // When pathname is "/"
        // Then it is active; otherwise inactive
        expect(isNavItemActive("/", "/")).toBe(true)
        expect(isNavItemActive("/profile", "/")).toBe(false)
        expect(isNavItemActive("/news/2026-04-26", "/")).toBe(false)
    })

    it("matches by exact pathname for non-root nav items", () => {
        // Given a nav item href "/profile"
        // When pathname equals it
        // Then it is active
        expect(isNavItemActive("/profile", "/profile")).toBe(true)
    })

    it("matches when pathname starts with href + '/' (nested route)", () => {
        // Given a nav item href "/news"
        // When pathname is a nested route under it
        // Then it is active
        expect(isNavItemActive("/news/2026-04-26", "/news")).toBe(true)
    })

    it("does not match a partial prefix that is not a path boundary", () => {
        // Given a nav item href "/skills" and pathname "/skillset"
        // When the active check runs
        // Then it is not active (boundary is "/")
        expect(isNavItemActive("/skillset", "/skills")).toBe(false)
    })

    it("returns false for an unrelated route", () => {
        // Given a nav item href "/portfolio"
        // When pathname is "/profile"
        // Then it is not active
        expect(isNavItemActive("/profile", "/portfolio")).toBe(false)
    })
})
