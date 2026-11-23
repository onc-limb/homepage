// @vitest-environment jsdom
import React, { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { NARROW_SCREEN_ONLY } from "@/components/ds/screen-styles"
import { elementWithText, precedes } from "@/components/ds/__tests__/render"
import { NAV_ITEMS } from "@/lib/constants"
import { toPromptPath } from "@/lib/building/floors"
import { MobileNav } from "../MobileNav"

vi.mock("next/link", () => ({
    default: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}))

let container: HTMLDivElement
let root: Root

function toggle(): HTMLButtonElement {
    const buttons = container.querySelectorAll("button")
    expect(buttons).toHaveLength(1)
    return buttons[0]
}
const links = () => Array.from(container.querySelectorAll("a"))

async function click(element: HTMLElement) {
    await act(async () => element.click())
}
async function key(element: HTMLElement, value: string) {
    await act(async () => {
        element.dispatchEvent(new KeyboardEvent("keydown", { key: value, bubbles: true }))
    })
}
async function renderAt(pathname: string) {
    await act(async () => root.render(<MobileNav pathname={pathname} />))
}

/** Self-and-descendant class names under `el`. */
function allClasses(el: Element): string[] {
    return [el, ...Array.from(el.querySelectorAll("*"))].flatMap((e) => Array.from(e.classList))
}

beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true)
    container = document.createElement("div")
    document.body.append(container)
    root = createRoot(container)
})
afterEach(async () => {
    await act(async () => root.unmount())
    container.remove()
    vi.unstubAllGlobals()
})

describe("MobileNav closed", () => {
    it("shows only the small 「メニュー」 door with no items", async () => {
        await renderAt("/")
        const button = toggle()
        expect(button.textContent).toBe("メニュー")
        expect(button.getAttribute("type")).toBe("button")
        expect(button.getAttribute("aria-expanded")).toBe("false")
        // The visible text is the accessible name; no separate label.
        expect(button.hasAttribute("aria-label")).toBe(false)
        expect(allClasses(button).filter((c) => c === "border-ds-door"), "small door frame").toHaveLength(1)
        expect(allClasses(button), "not the large door").not.toContain("border-ds-door-lg")
        expect(button.querySelector("svg")).toBeNull()
        expect(links()).toHaveLength(0)
        expect(container.querySelector("nav")).toBeNull()
    })

    it("is hidden on wide screens together with its panel", async () => {
        await renderAt("/")
        let wrapper: Element | null = toggle()
        const narrow: Element[] = []
        for (; wrapper && wrapper !== container; wrapper = wrapper.parentElement) {
            if (wrapper.classList.contains(NARROW_SCREEN_ONLY)) narrow.push(wrapper)
        }
        expect(narrow).toHaveLength(1)
        await click(toggle())
        expect(narrow[0].contains(container.querySelector("nav"))).toBe(true)
    })
})

describe("MobileNav disclosure", () => {
    it("opens and closes with the door, associating the open panel", async () => {
        await renderAt("/")
        await click(toggle())
        expect(toggle().getAttribute("aria-expanded")).toBe("true")
        expect(toggle().textContent).toBe("メニュー")
        const panel = document.getElementById(toggle().getAttribute("aria-controls")!)!
        expect(panel.tagName).toBe("NAV")
        expect(panel.getAttribute("aria-label")).toBe("サイト")
        expect(links().length).toBeGreaterThan(0)
        expect(links().every((a) => panel.contains(a))).toBe(true)
        await click(toggle())
        expect(toggle().getAttribute("aria-expanded")).toBe("false")
        expect(toggle().hasAttribute("aria-controls")).toBe(false)
        expect(links()).toHaveLength(0)
    })

    it("closes from a focused link on Escape and restores focus on every opening", async () => {
        await renderAt("/")
        for (let attempt = 0; attempt < 2; attempt++) {
            await click(toggle())
            const link = links()[0]
            link.focus()
            await key(link, "ArrowDown")
            expect(links().length).toBeGreaterThan(0)
            await key(link, "Escape")
            expect(links()).toHaveLength(0)
            expect(document.activeElement).toBe(toggle())
            expect(toggle().getAttribute("aria-expanded")).toBe("false")
        }
    })

    it("supports Escape on the trigger and still closes when a link is selected", async () => {
        await renderAt("/")
        await click(toggle())
        toggle().focus()
        await key(toggle(), "Escape")
        expect(links()).toHaveLength(0)
        expect(document.activeElement).toBe(toggle())
        await click(toggle())
        const link = links()[0]
        link.addEventListener("click", (event) => event.preventDefault())
        await click(link)
        expect(links()).toHaveLength(0)
    })
})

describe("MobileNav items", () => {
    it("lists every nav item in order with its Japanese label and the virtual path on the right", async () => {
        await renderAt("/skills")
        await click(toggle())
        const rendered = links()
        expect(rendered.map((a) => a.getAttribute("href"))).toEqual(NAV_ITEMS.map((item) => item.href))
        rendered.forEach((link, i) => {
            const { label, href } = NAV_ITEMS[i]
            const path = toPromptPath(href)
            expect(link.textContent).toBe(label + path)
            const labelEl = elementWithText(link, label)
            const pathEl = elementWithText(link, path)
            expect(labelEl, `${href} label`).toBeDefined()
            expect(pathEl, `${href} path`).toBeDefined()
            expect(labelEl!.contains(pathEl!) || pathEl!.contains(labelEl!), "separate elements").toBe(false)
            expect(precedes(labelEl!, pathEl!), `${href} path after label`).toBe(true)
        })
    })

    it("shows the home path as ~ and each floor under ~/", async () => {
        await renderAt("/")
        await click(toggle())
        const byHref = (href: string) => links().find((a) => a.getAttribute("href") === href)!
        expect(elementWithText(byHref("/"), "~")).toBeDefined()
        expect(byHref("/").textContent).toBe("案内~")
        expect(byHref("/2f").textContent).toBe("2F 経歴・技術~/2f")
        expect(byHref("/rf").textContent).toBe("屋上 リンク~/rf")
    })

    it("lists 案内 and the five floors", async () => {
        await renderAt("/")
        await click(toggle())
        expect(links().map((a) => a.getAttribute("href"))).toEqual(["/", "/b1", "/1f", "/2f", "/3f", "/rf"])
    })

    it.each([
        ["/skills", ["/2f"]],
        ["/2f/skills", ["/2f"]],
        ["/portfolio/onc-limb", ["/3f"]],
        ["/1f/contact", ["/1f"]],
        ["/", ["/"]],
        ["/books", []],
    ])("marks only the floor the page belongs to as current on %s", async (pathname, expected) => {
        await renderAt(pathname)
        await click(toggle())
        const current = links().filter((a) => a.getAttribute("aria-current") === "page")
        expect(current.map((a) => a.getAttribute("href"))).toEqual(expected)
        const accented = links().filter((link) => link.querySelector(".underline.decoration-ds-accent"))
        expect(accented.map((link) => link.getAttribute("href"))).toEqual(expected)
    })
})

describe("MobileNav surface", () => {
    it("uses only ds tokens on an opaque panel without decoration", async () => {
        await renderAt("/")
        await click(toggle())
        const panel = container.querySelector("nav")!
        expect(panel.classList.contains("bg-ds-bg"), "opaque ds background").toBe(true)
        const classes = allClasses(container)
        const banned = classes.filter((c) =>
            /hairline|bg-elev|rounded|backdrop|shadow|gradient|transition|^text-accent$|^text-fg|^bg-fg$|\/\d+$/.test(c)
        )
        expect(banned).toEqual([])
        expect(container.querySelector("[style]"), "no inline styles").toBeNull()
        expect(container.querySelector("svg")).toBeNull()
    })
})
