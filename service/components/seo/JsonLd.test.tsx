import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { JsonLd } from "./JsonLd"

describe("JsonLd", () => {
    it("renders JSON-LD and escapes HTML-significant characters", () => {
        const html = renderToStaticMarkup(
            <JsonLd
                data={{
                    "@context": "https://schema.org",
                    "@type": "Thing",
                    name: "</script><script>alert(1)</script>",
                }}
            />
        )

        expect(html).toContain('type="application/ld+json"')
        expect(html).toContain("\\u003c/script>")
        expect(html).not.toContain("<script>alert(1)</script>")
    })
})
