import { describe, expect, it } from "vitest"
import { absoluteUrl, breadcrumbJsonLd, createPageMetadata, SITE_URL } from "@/lib/seo"

describe("SEO metadata", () => {
    it("creates canonical, Open Graph, and Twitter metadata for a page", () => {
        const metadata = createPageMetadata({
            title: "Profile",
            description: "Profile description",
            path: "/profile",
        })

        expect(metadata.title).toBe("Profile")
        expect(metadata.description).toBe("Profile description")
        expect(metadata.alternates?.canonical).toBe("https://onclimb.net/profile")
        expect(metadata.openGraph).toMatchObject({
            title: "Profile | onclimb",
            description: "Profile description",
            url: "https://onclimb.net/profile",
            images: [expect.objectContaining({ width: 1200, height: 630 })],
        })
        expect(metadata.twitter).toMatchObject({
            card: "summary_large_image",
            title: "Profile | onclimb",
            description: "Profile description",
        })
    })

    it("creates absolute URLs and ordered breadcrumb JSON-LD", () => {
        expect(SITE_URL.toString()).toBe("https://onclimb.net/")
        expect(absoluteUrl("/blog/example")).toBe("https://onclimb.net/blog/example")
        expect(
            breadcrumbJsonLd([
                { name: "Home", path: "/" },
                { name: "Blog", path: "/blog" },
            ])
        ).toMatchObject({
            "@type": "BreadcrumbList",
            itemListElement: [
                { position: 1, name: "Home", item: "https://onclimb.net/" },
                { position: 2, name: "Blog", item: "https://onclimb.net/blog" },
            ],
        })
    })
})
