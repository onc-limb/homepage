import { describe, expect, it } from "vitest"

import type { SocialLink } from "../constants"
import { findSocialLink, SocialLinkNotFoundError, toHomeStatItems } from "../home"

describe("toHomeStatItems", () => {
    it("maps each count to its label in the fixed display order", () => {
        expect(
            toHomeStatItems({
                readBooksCount: 8,
                publishedArticlesCount: 5,
                usedTagCount: 7,
                totalBooksCount: 12,
            })
        ).toEqual([
            { value: "8", sup: "", label: "books read" },
            { value: "5", sup: "", label: "articles published" },
            { value: "7", sup: "", label: "topics covered" },
            { value: "12", sup: "", label: "books logged" },
        ])
    })

    it("renders zero counts as \"0\"", () => {
        expect(
            toHomeStatItems({
                readBooksCount: 0,
                publishedArticlesCount: 0,
                usedTagCount: 0,
                totalBooksCount: 0,
            })
        ).toEqual([
            { value: "0", sup: "", label: "books read" },
            { value: "0", sup: "", label: "articles published" },
            { value: "0", sup: "", label: "topics covered" },
            { value: "0", sup: "", label: "books logged" },
        ])
    })
})

describe("findSocialLink", () => {
    const links: SocialLink[] = [
        { name: "Zenn", url: "https://zenn.dev/example", username: "@example" },
        { name: "GitHub", url: "https://github.com/example", username: "@example" },
    ]

    it("returns the entry whose name matches", () => {
        expect(findSocialLink(links, "GitHub")).toEqual({
            name: "GitHub",
            url: "https://github.com/example",
            username: "@example",
        })
    })

    it("throws SocialLinkNotFoundError carrying the missing link name", () => {
        let thrown: unknown
        try {
            findSocialLink([], "GitHub")
        } catch (error) {
            thrown = error
        }

        expect(thrown).toBeInstanceOf(SocialLinkNotFoundError)
        expect(thrown).toBeInstanceOf(Error)
        const notFound = thrown as SocialLinkNotFoundError
        expect(notFound.linkName).toBe("GitHub")
        expect(notFound.name).toBe("SocialLinkNotFoundError")
        // The page used to throw this exact message; keep it unchanged.
        expect(notFound.message).toBe("SOCIAL_LINKS must include a GitHub entry")
    })

    it("does not match by a different name", () => {
        expect(() => findSocialLink(links, "X (Twitter)")).toThrow(SocialLinkNotFoundError)
    })
})
