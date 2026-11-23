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

    it("holds only these two redirects, each permanent without a status code override", () => {
        expect(PERMANENT_REDIRECTS.map((entry) => entry.source)).toEqual(["/contact", "/social"])
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

    it("keeps the contact page, form and server action under app/1f/contact", () => {
        for (const file of ["page.tsx", "ContactForm.tsx", "actions.ts"]) {
            expect(fs.existsSync(path.join(SERVICE_ROOT, "app/1f/contact", file)), file).toBe(true)
        }
    })
})
