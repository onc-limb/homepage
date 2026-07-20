import * as React from "react"
import { describe, expect, it, vi } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"

import { SiteBrand } from "../SiteBrand"

// next/link -> plain anchor so aria-label / href assertions work under a static render.
vi.mock("next/link", () => ({
    default: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}))

// next/image -> plain img, forwarding only the attributes we assert on.
vi.mock("next/image", () => ({
    default: ({ src, alt, width, height, className }: any) => (
        <img
            src={typeof src === "string" ? src : src?.src}
            alt={alt}
            width={width}
            height={height}
            className={className}
        />
    ),
}))

describe("SiteBrand", () => {
    it("renders the brand logo image as a home link", () => {
        const html = renderToStaticMarkup(<SiteBrand pathname="/" />)

        expect(html).toContain('aria-label="onclimb home"')
        expect(html).toContain('href="/"')
        expect(html).toContain("/MainLogo.png")
        // alt must be non-empty and mention onclimb.
        expect(html).toMatch(/alt="[^"]*onclimb[^"]*"/)
        // brand text + page label are preserved.
        expect(html).toContain("onclimb")
        expect(html).toContain("home")
    })

    it("no longer renders the gradient placeholder icon", () => {
        const html = renderToStaticMarkup(<SiteBrand pathname="/profile" />)

        expect(html).not.toContain("linear-gradient")
        expect(html).not.toContain("radial-gradient")
        expect(html).toContain("profile")
    })

    it("falls back to the top-level label for dynamic sub-routes", () => {
        const html = renderToStaticMarkup(<SiteBrand pathname="/portfolio/onc-limb" />)

        expect(html).toContain("portfolio")
    })
})
