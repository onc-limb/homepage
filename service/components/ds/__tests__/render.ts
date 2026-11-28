import type { ReactElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"

/** Renders a server component to static HTML and returns it inside a detached container. */
export function render(element: ReactElement): HTMLElement {
    const container = document.createElement("div")
    container.innerHTML = renderToStaticMarkup(element)
    return container
}

/** The nearest element (self first, up to `stop`) carrying a class that matches `pattern`. */
export function closestClass(el: Element, pattern: RegExp, stop: Element): string | undefined {
    for (let cur: Element | null = el; cur && cur !== stop; cur = cur.parentElement) {
        const found = Array.from(cur.classList).find((cls) => pattern.test(cls))
        if (found) return found
    }
    return undefined
}

/** The deepest element under `root` whose whole text equals `text`. */
export function elementWithText(root: Element, text: string): HTMLElement | undefined {
    return Array.from(root.querySelectorAll<HTMLElement>("*"))
        .filter((el) => el.textContent === text)
        .pop()
}

/** True when `a` comes before `b` in document order. */
export function precedes(a: Node, b: Node): boolean {
    return (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0
}

/** The guide PCs under `root`: GuidePc's section, found by its 「案内人」 heading. */
export function guidePcs(root: Element): HTMLElement[] {
    return Array.from(root.querySelectorAll<HTMLElement>("section")).filter((section) =>
        section.querySelector("h2")?.textContent?.includes("案内人")
    )
}

/** A copy of `root` without the guide PCs and the floor maps, for checks of what lies outside them. */
export function withoutGuidePcAndMaps(root: Element): HTMLElement {
    const copy = root.cloneNode(true) as HTMLElement
    guidePcs(copy).forEach((pc) => pc.remove())
    copy.querySelectorAll("[data-floor][data-material]").forEach((map) => map.remove())
    return copy
}
