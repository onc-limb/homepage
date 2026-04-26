import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

/**
 * reveal-orphan-attr re-prevention.
 *
 * Family tag: reveal-orphan-attr (FE-NEW1-NewsCard / FE-NEW2-DayHead)
 *  globals.css の `[data-reveal]{opacity:0}` は同一要素 ref で `is-revealed` を付与する
 *  `<Reveal>` の中でのみ復帰する。NewsCard / DayHead が `<Reveal>` ラッパー無しで
 *  `data-reveal=""` を直書きすると要素が永続的に不可視になるため、これらの
 *  プレゼンテーションコンポーネントは `data-reveal` 属性を持ってはならない。
 *  代わりに NewsContent 側で `<Reveal>` でラップする。
 */

const COMPONENTS_DIR = path.resolve(__dirname, "..")

function readSource(file: string): string {
    return fs.readFileSync(path.join(COMPONENTS_DIR, file), "utf-8")
}

describe("reveal-orphan-attr (NewsCard / DayHead)", () => {
    it("NewsCard.tsx does not declare a data-reveal attribute", () => {
        // Given NewsCard renders without an enclosing <Reveal> in NewsContent
        // When the source is scanned
        // Then it must not contain "data-reveal" (otherwise the card stays opacity:0)
        expect(readSource("NewsCard.tsx")).not.toMatch(/data-reveal/)
    })

    it("DayHead.tsx does not declare a data-reveal attribute", () => {
        // Given DayHead is rendered as the heading inside NewsContent
        // When the source is scanned
        // Then it must not contain "data-reveal" (NewsContent wraps it in <Reveal>)
        expect(readSource("DayHead.tsx")).not.toMatch(/data-reveal/)
    })

    it("NewsContent.tsx wraps DayHead and NewsCard with Reveal", () => {
        // Given the orphan attribute fix moves Reveal wrapping up to NewsContent
        // When NewsContent source is inspected
        // Then it imports Reveal and wraps both DayHead and NewsCard
        const source = readSource("NewsContent.tsx")
        expect(source).toMatch(/import\s+\{[^}]*Reveal[^}]*\}\s+from\s+"@\/components\/animations"/)
        expect(source).toMatch(/<Reveal[\s>][^]*?<DayHead/)
        expect(source).toMatch(/<Reveal[\s>][^]*?<NewsCard/)
    })
})
