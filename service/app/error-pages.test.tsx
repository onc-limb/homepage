// @vitest-environment jsdom
import fs from "node:fs"
import path from "node:path"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import ErrorBoundary from "./error"
import GlobalError from "./global-error"

/**
 * Error screen contract tests (404, segment error, global error) that the
 * per-screen tests do not cover: the screens are built from the ds parts
 * (no Reveal, no shadcn Button, no inline hex colours) and keep their
 * destinations and digest display.
 */

const ERROR_SCREENS = ["not-found.tsx", "error.tsx", "global-error.tsx"]

function source(file: string): string {
    return fs.readFileSync(path.resolve(__dirname, file), "utf-8")
}

describe("error screens source", () => {
    it.each(ERROR_SCREENS)("%s uses neither Reveal nor the shadcn Button", (file) => {
        const text = source(file)

        expect(text).not.toContain("@/components/animations")
        expect(text).not.toContain("@/components/ui/button")
    })

    it.each(ERROR_SCREENS)("%s has no inline style or hex colour", (file) => {
        const text = source(file)

        expect(text).not.toMatch(/style=\{/)
        // A colour literal sits in a string or an arbitrary Tailwind value; issue refs like "(#311)" do not.
        expect(text).not.toMatch(/["'`[]#[0-9a-fA-F]{3,8}\b/)
    })
})

describe("app/error.tsx digest", () => {
    it("shows the error ID when a digest is given", () => {
        const html = renderToStaticMarkup(
            <ErrorBoundary error={Object.assign(new Error("boom"), { digest: "abc123" })} reset={() => {}} />,
        )

        const container = document.createElement("div")
        container.innerHTML = html

        expect(container.textContent).toContain("エラー ID: abc123")
    })
})

describe("app/global-error.tsx", () => {
    it("keeps the alert region and a plain anchor back to the home page", () => {
        const html = renderToStaticMarkup(<GlobalError error={new Error("boom")} reset={() => {}} />)
        const doc = new DOMParser().parseFromString(html, "text/html")
        const home = Array.from(doc.querySelectorAll("a")).filter((a) => a.textContent === "ホームへ戻る")

        expect(doc.querySelector('[role="alert"][aria-live="assertive"]')).not.toBeNull()
        expect(home).toHaveLength(1)
        expect(home[0].getAttribute("href")).toBe("/")
    })

    it("still uses a raw anchor rather than next/link for the home link", () => {
        expect(source("global-error.tsx")).not.toMatch(/from ["']next\/link["']/)
    })
})
