import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

import { findFloor, findGroup } from "@/lib/building/floors"
import { PERMANENT_REDIRECTS } from "@/lib/redirects.mjs"
import nextConfig from "@/next.config.mjs"

/**
 * Redirect contract tests.
 *
 * Retired URLs are mapped to their new URLs in one module (lib/redirects.mjs),
 * and next.config.mjs only returns that table from redirects(). Each entry is
 * permanent (Next answers 308), and the destinations match the FLOORS values.
 */

const SERVICE_ROOT = path.resolve(__dirname, "../..")

const byOldUrl = (source: string) => PERMANENT_REDIRECTS.filter((entry) => entry.source === source)

describe("PERMANENT_REDIRECTS", () => {
    it("sends /contact permanently to the contact page on 1F", () => {
        expect(byOldUrl("/contact")).toEqual([
            { source: "/contact", destination: findGroup("contact").url, permanent: true },
        ])
        expect(findGroup("contact").url).toBe("/1f/contact")
    })

    it("sends /social permanently to the rooftop", () => {
        expect(byOldUrl("/social")).toEqual([{ source: "/social", destination: findFloor("rf").url, permanent: true }])
        expect(findFloor("rf").url).toBe("/rf")
    })

    it("sends /profile permanently to the profile page on 1F", () => {
        expect(byOldUrl("/profile")).toEqual([
            { source: "/profile", destination: findGroup("profile").url, permanent: true },
        ])
        expect(findGroup("profile").url).toBe("/1f/profile")
    })

    it("sends /skills permanently to the skills page on 2F", () => {
        expect(byOldUrl("/skills")).toEqual([
            { source: "/skills", destination: findGroup("skills").url, permanent: true },
        ])
        expect(findGroup("skills").url).toBe("/2f/skills")
    })

    it("holds only these four redirects, each permanent without a status code override", () => {
        expect(PERMANENT_REDIRECTS.map((entry) => entry.source)).toEqual(["/contact", "/social", "/profile", "/skills"])
        for (const entry of PERMANENT_REDIRECTS) {
            expect(entry.permanent, entry.source).toBe(true)
            expect(entry, entry.source).not.toHaveProperty("statusCode")
        }
    })
})

describe("next.config.mjs redirects()", () => {
    it("returns the table from lib/redirects.mjs as is", async () => {
        expect(typeof nextConfig.redirects).toBe("function")
        expect(await nextConfig.redirects!()).toEqual(PERMANENT_REDIRECTS)
    })

    it("does not write the table in the config file itself", () => {
        const source = fs.readFileSync(path.join(SERVICE_ROOT, "next.config.mjs"), "utf-8")
        expect(source).toMatch(/from\s+["']\.\/lib\/redirects\.mjs["']/)
        expect(source).not.toMatch(/destination\s*:/)
    })
})

describe("retired pages", () => {
    it("no longer has the app/contact and app/social routes", () => {
        expect(fs.existsSync(path.join(SERVICE_ROOT, "app/contact")), "app/contact").toBe(false)
        expect(fs.existsSync(path.join(SERVICE_ROOT, "app/social")), "app/social").toBe(false)
    })

    it("no longer has the app/profile route", () => {
        expect(fs.existsSync(path.join(SERVICE_ROOT, "app/profile")), "app/profile").toBe(false)
    })

    it("no longer has the app/skills route", () => {
        expect(fs.existsSync(path.join(SERVICE_ROOT, "app/skills")), "app/skills").toBe(false)
    })

    it("keeps the skills page under app/2f/skills and the studies page under app/b1/studies", () => {
        expect(fs.existsSync(path.join(SERVICE_ROOT, "app/2f/skills/page.tsx")), "app/2f/skills/page.tsx").toBe(true)
        expect(fs.existsSync(path.join(SERVICE_ROOT, "app/b1/studies/page.tsx")), "app/b1/studies/page.tsx").toBe(true)
    })

    it("keeps the profile page under app/1f/profile and the histories page under app/2f/histories", () => {
        expect(fs.existsSync(path.join(SERVICE_ROOT, "app/1f/profile/page.tsx")), "app/1f/profile/page.tsx").toBe(true)
        expect(fs.existsSync(path.join(SERVICE_ROOT, "app/2f/histories/page.tsx")), "app/2f/histories/page.tsx").toBe(
            true,
        )
    })

    it("keeps the contact page, form and server action under app/1f/contact", () => {
        for (const file of ["page.tsx", "ContactForm.tsx", "actions.ts"]) {
            expect(fs.existsSync(path.join(SERVICE_ROOT, "app/1f/contact", file)), file).toBe(true)
        }
    })
})
