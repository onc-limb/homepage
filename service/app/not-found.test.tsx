import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import NotFound from "./not-found"

describe("NotFound", () => {
    it("renders the 404 page with a heading", () => {
        const html = renderToStaticMarkup(<NotFound />)

        expect(html).toContain("ページが見つかりません")
        expect(html).toContain("404")
    })

    it("includes a link back to the home page", () => {
        const html = renderToStaticMarkup(<NotFound />)

        expect(html).toContain('href="/"')
        expect(html).toContain("ホームへ戻る")
    })
})
