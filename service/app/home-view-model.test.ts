import { describe, expect, it } from "vitest"

import type { NavItem, SocialLink } from "@/lib/constants"

import {
    findSocialLinkUrl,
    selectExploreItems,
    SocialLinkNotFoundError,
    toHomeStatItems,
} from "./home-view-model"

describe("findSocialLinkUrl", () => {
    const links = [
        { name: "X", url: "https://example.com/x" },
        { name: "GitHub", url: "https://example.com/gh" },
    ] as SocialLink[]

    it("returns the url of the link with the given name", () => {
        expect(findSocialLinkUrl(links, "GitHub")).toBe("https://example.com/gh")
    })

    it("throws SocialLinkNotFoundError carrying the missing name", () => {
        let thrown: unknown
        try {
            findSocialLinkUrl([], "GitHub")
        } catch (e) {
            thrown = e
        }
        expect(thrown).toBeInstanceOf(SocialLinkNotFoundError)
        expect((thrown as SocialLinkNotFoundError).linkName).toBe("GitHub")
        expect((thrown as Error).message).toBe("SOCIAL_LINKS must include a GitHub entry")
    })
})

describe("selectExploreItems", () => {
    const item = (href: string): NavItem => ({ href, label: href, description: href })

    it("drops Home and Contact and keeps the order of the rest", () => {
        const items = ["/", "/profile", "/contact", "/blog"].map(item)
        expect(selectExploreItems(items).map((n) => n.href)).toEqual(["/profile", "/blog"])
    })
})

describe("toHomeStatItems", () => {
    it("returns the four stats as strings in the fixed label order", () => {
        expect(
            toHomeStatItems({
                readBooksCount: 8,
                publishedArticlesCount: 5,
                usedTagCount: 7,
                totalBooksCount: 12,
            })
        ).toEqual([
            { value: "8", label: "books read" },
            { value: "5", label: "articles published" },
            { value: "7", label: "topics covered" },
            { value: "12", label: "books logged" },
        ])
    })

    it("keeps zero values", () => {
        expect(
            toHomeStatItems({
                readBooksCount: 0,
                publishedArticlesCount: 0,
                usedTagCount: 0,
                totalBooksCount: 0,
            }).map((s) => s.value)
        ).toEqual(["0", "0", "0", "0"])
    })
})
