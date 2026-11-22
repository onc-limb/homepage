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
