import { afterEach, describe, expect, it, vi } from "vitest"

vi.mock("@/lib/auth", () => ({
    auth: vi.fn(),
    signOut: vi.fn(),
}))

import robots from "@/app/robots"
import { metadata as studioMetadata } from "@/app/studio/layout"
import { getGoogleSiteVerification } from "@/lib/seo"

afterEach(() => {
    vi.unstubAllEnvs()
})

describe("robots", () => {
    it("allows public pages and blocks private application routes", () => {
        expect(robots()).toEqual({
            rules: {
                userAgent: "*",
                allow: "/",
                disallow: ["/studio", "/api"],
            },
            sitemap: "https://onclimb.net/sitemap.xml",
        })
    })

    it("prevents studio pages from being indexed or followed", () => {
        expect(studioMetadata.robots).toMatchObject({
            index: false,
            follow: false,
        })
    })
})

describe("Google site verification", () => {
    it("is omitted when the environment variable is not configured", () => {
        vi.stubEnv("GOOGLE_SITE_VERIFICATION", "")
        expect(getGoogleSiteVerification()).toBeUndefined()
    })

    it("uses a trimmed environment value when configured", () => {
        vi.stubEnv("GOOGLE_SITE_VERIFICATION", " verification-token ")
        expect(getGoogleSiteVerification()).toEqual({
            google: "verification-token",
        })
    })
})
