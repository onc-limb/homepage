import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
let seo: typeof import("@/lib/seo")
beforeEach(async () => {
    vi.resetModules()
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", undefined)
    seo = await import("@/lib/seo")
})
afterEach(() => vi.unstubAllEnvs())

describe("SEO metadata", () => {
    it("creates canonical, Open Graph, and Twitter metadata for a page", () => {
        const metadata = seo.createPageMetadata({
            title: "Profile",
            description: "Profile description",
            path: "/profile",
        })

        expect(metadata.title).toBe("Profile")
        expect(metadata.description).toBe("Profile description")
        expect(metadata.alternates?.canonical).toBe("https://onc-limb.com/profile")
        expect(metadata.openGraph).toMatchObject({
            title: "Profile | onclimb",
            description: "Profile description",
            url: "https://onc-limb.com/profile",
            images: [
                expect.objectContaining({
                    url: "/og-default.png",
                    width: 1200,
                    height: 630,
                }),
            ],
        })
        expect(metadata.twitter).toMatchObject({
            card: "summary_large_image",
            title: "Profile | onclimb",
            description: "Profile description",
            images: ["/og-default.png"],
        })
    })

    it("creates absolute URLs and ordered breadcrumb JSON-LD", () => {
        expect(seo.SITE_URL.toString()).toBe("https://onc-limb.com/")
        expect(seo.absoluteUrl("/blog/example")).toBe("https://onc-limb.com/blog/example")
        expect(
            seo.breadcrumbJsonLd([
                { name: "Home", path: "/" },
                { name: "Blog", path: "/blog" },
            ])
        ).toMatchObject({
            "@type": "BreadcrumbList",
            itemListElement: [
                { position: 1, name: "Home", item: "https://onc-limb.com/" },
                { position: 2, name: "Blog", item: "https://onc-limb.com/blog" },
            ],
        })
    })
})

describe("site URL configuration", () => {
    it("uses the official origin for homepage canonical and Open Graph URLs", () => {
        const metadata = seo.createPageMetadata({
            title: "Home",
            description: "Home",
            path: "/",
        })
        expect(metadata.alternates?.canonical).toBe("https://onc-limb.com/")
        expect(metadata.openGraph).toMatchObject({ url: "https://onc-limb.com/" })
    })

    it("preserves an explicit deployment URL override", async () => {
        vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://preview.example.com/")
        vi.resetModules()
        const configured = await import("@/lib/seo")
        const metadata = configured.createPageMetadata({
            title: "Profile",
            description: "Profile",
            path: "/profile",
        })
        expect(configured.SITE_URL.origin).toBe("https://preview.example.com")
        expect(metadata.alternates?.canonical).toBe("https://preview.example.com/profile")
        expect(metadata.openGraph).toMatchObject({
            url: "https://preview.example.com/profile",
        })
        const { default: robots } = await import("@/app/robots")
        expect(robots().sitemap).toBe("https://preview.example.com/sitemap.xml")
    })
})
