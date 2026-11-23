// @vitest-environment jsdom
import * as React from "react"
import { act } from "react"
import { createRoot } from "react-dom/client"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { DoorButton } from "../DoorButton"
import { elementWithText, precedes, render } from "./render"

vi.mock("next/link", () => ({
    default: ({ children, ...props }: any) => (
        <a data-next-link="" {...props}>
            {children}
        </a>
    ),
}))

/** The single interactive element (button or a) of a rendered door. */
function control(root: HTMLElement): HTMLElement {
    const found = root.querySelectorAll<HTMLElement>("button, a")
    expect(found).toHaveLength(1)
    return found[0]
}

/** Self-or-descendant elements of `el` carrying `cls`. */
function withClass(el: HTMLElement, cls: string): HTMLElement[] {
    const all = [el, ...Array.from(el.querySelectorAll<HTMLElement>("*"))]
    return all.filter((e) => e.classList.contains(cls))
}

/** The door frame: the element carrying the door border width for the size. */
function frame(root: HTMLElement, size: "small" | "large"): HTMLElement {
    const frames = withClass(control(root), size === "small" ? "border-ds-door" : "border-ds-door-lg")
    expect(frames, `${size} frame`).toHaveLength(1)
    return frames[0]
}

const SIZES = ["small", "large"] as const

describe("DoorButton", () => {
    describe("as a button", () => {
        it("renders a button with type=button by default", () => {
            const el = control(render(<DoorButton>開く</DoorButton>))
            expect(el.tagName).toBe("BUTTON")
            expect(el.getAttribute("type")).toBe("button")
            expect(el.textContent).toContain("開く")
        })

        it("passes type=submit through", () => {
            const el = control(render(<DoorButton type="submit">送信</DoorButton>))
            expect(el.tagName).toBe("BUTTON")
            expect(el.getAttribute("type")).toBe("submit")
        })

        it.each([true, false])("passes aria-expanded=%s and aria-controls through", (expanded) => {
            const el = control(
                render(
                    <DoorButton aria-expanded={expanded} aria-controls="menu-panel">
                        メニュー
                    </DoorButton>
                )
            )
            expect(el.getAttribute("aria-expanded")).toBe(String(expanded))
            expect(el.getAttribute("aria-controls")).toBe("menu-panel")
        })

        it("omits aria-expanded and aria-controls when not given", () => {
            const el = control(render(<DoorButton>開く</DoorButton>))
            expect(el.hasAttribute("aria-expanded")).toBe(false)
            expect(el.hasAttribute("aria-controls")).toBe(false)
        })

        it("forwards ref to the button element", async () => {
            vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true)
            const container = document.createElement("div")
            document.body.append(container)
            const root = createRoot(container)
            const ref = React.createRef<HTMLButtonElement>()
            try {
                await act(async () => root.render(<DoorButton ref={ref}>メニュー</DoorButton>))
                expect(ref.current).toBeInstanceOf(HTMLButtonElement)
                expect(ref.current).toBe(container.querySelector("button"))
            } finally {
                await act(async () => root.unmount())
                container.remove()
                vi.unstubAllGlobals()
            }
        })

        it("does not accept the disclosure props on a link", () => {
            // @ts-expect-error aria-expanded is only for the button form
            const el = <DoorButton href="/contact" aria-expanded={true}>Contact</DoorButton>
            expect(el).toBeDefined()
        })
    })

    describe("as a link", () => {
        it("renders an internal href through next/link in the same tab", () => {
            const el = control(render(<DoorButton href="/contact">Contact</DoorButton>))
            expect(el.tagName).toBe("A")
            expect(el.hasAttribute("data-next-link"), "next/link").toBe(true)
            expect(el.getAttribute("href")).toBe("/contact")
            expect(el.hasAttribute("target")).toBe(false)
            expect(el.textContent).not.toContain("↗")
            expect(el.hasAttribute("aria-pressed")).toBe(false)
        })

        it.each(SIZES)("opens an external href in a new tab with the ↗ mark (%s)", (size) => {
            const el = control(
                render(
                    <DoorButton size={size} href="https://github.com/onc-limb">
                        GitHub
                    </DoorButton>
                )
            )
            expect(el.tagName).toBe("A")
            expect(el.hasAttribute("data-next-link"), "next/link").toBe(false)
            expect(el.getAttribute("href")).toBe("https://github.com/onc-limb")
            expect(el.getAttribute("target")).toBe("_blank")
            expect(el.getAttribute("rel")).toBe("noopener noreferrer")
            expect(el.textContent).toContain("↗")
        })
    })

    describe("small door", () => {
        it("is the default size: a planked wood face, wood-wall frame, outer line and a square handle", () => {
            const root = render(<DoorButton href="/2f/skills">Skills</DoorButton>)
            const el = control(root)
            expect(withClass(el, "border-ds-door"), "small frame").toHaveLength(1)
            expect(withClass(el, "border-ds-door-lg"), "no large frame").toHaveLength(0)

            const f = frame(root, "small")
            expect(f.classList.contains("bg-ds-map-wood"), "bg-ds-map-wood").toBe(true)
            expect(f.classList.contains("text-ds-fg"), "text-ds-fg").toBe(true)
            expect(f.classList.contains("border-ds-map-wood-wall"), "wood-wall frame").toBe(true)
            expect(f.classList.contains("outline-ds-fg"), "outer line").toBe(true)

            expect(withClass(el, "border-ds-map-wood-joint").length, "plank joints").toBeGreaterThan(1)
            const handles = withClass(el, "bg-ds-accent")
            expect(handles, "handle").toHaveLength(1)
            expect(handles[0].getAttribute("aria-hidden")).toBe("true")
            expect(handles[0].textContent).toBe("")
            expect(precedes(elementWithText(el, "Skills")!, handles[0]), "handle on the right").toBe(true)
        })

        it("draws the planks without CSS gradients", () => {
            const html = renderToStaticMarkup(<DoorButton>開く</DoorButton>)
            expect(html).not.toMatch(/gradient/i)
        })
    })

    describe("large door", () => {
        it("shows a nameplate with name and count, a panel, a handle and the URL below", () => {
            const root = render(
                <DoorButton size="large" href="/3f/portfolios" count="12 件">
                    Portfolio
                </DoorButton>
            )
            const el = control(root)
            const f = frame(root, "large")
            expect(f.classList.contains("bg-ds-map-wood"), "bg-ds-map-wood").toBe(true)
            expect(f.classList.contains("border-ds-map-wood-wall"), "wood-wall frame").toBe(true)
            expect(f.classList.contains("outline-ds-fg"), "outer line").toBe(true)
            expect(withClass(el, "border-ds-map-wood-joint").length, "plank joints").toBeGreaterThan(1)

            const name = elementWithText(el, "Portfolio")
            const count = elementWithText(el, "12 件")
            expect(name, "name").toBeDefined()
            expect(count, "count").toBeDefined()
            const plate = withClass(el, "bg-ds-surface")
            expect(plate, "nameplate").toHaveLength(1)
            expect(plate[0].contains(name!) && plate[0].contains(count!), "name and count on the plate").toBe(true)

            const panels = withClass(f, "border-ds-map-wood-wall").filter((p) => p !== f)
            expect(panels.length, "panel frame").toBeGreaterThanOrEqual(1)
            expect(precedes(plate[0], panels[0]), "plate above the panel").toBe(true)
            expect(withClass(el, "bg-ds-accent"), "handle").toHaveLength(1)

            const url = elementWithText(el, "/3f/portfolios")
            expect(url, "URL under the door").toBeDefined()
            expect(f.contains(url!), "URL is outside the door face").toBe(false)
            expect(precedes(f, url!), "URL below the door").toBe(true)
        })

        it("uses the 104x150 door on narrow screens and 150x210 from md up", () => {
            const el = control(
                render(
                    <DoorButton size="large" href="/3f/portfolios">
                        Portfolio
                    </DoorButton>
                )
            )
            for (const cls of ["w-ds-door-narrow", "md:w-ds-door", "h-ds-door-narrow", "md:h-ds-door"]) {
                expect(withClass(el, cls).length, cls).toBeGreaterThan(0)
            }
        })

        it("shows no URL when used as a button", () => {
            const root = render(
                <DoorButton size="large" count="3">
                    Search
                </DoorButton>
            )
            expect(control(root).tagName).toBe("BUTTON")
            expect(root.textContent?.replace(/\s/g, "")).toBe("Search3")
        })
    })

    describe.each(SIZES)("%s door states", (size) => {
        it("normal: wood-wall frame, no primary or pressed marker", () => {
            const root = render(
                <DoorButton size={size} href="/2f/skills">
                    Skills
                </DoorButton>
            )
            const f = frame(root, size)
            expect(f.classList.contains("border-ds-map-wood-wall")).toBe(true)
            expect(f.classList.contains("border-ds-accent")).toBe(false)
            expect(root.querySelector("[data-primary]")).toBeNull()
            expect(root.querySelector("[aria-pressed]")).toBeNull()
        })

        it("primary: accent frame and data-primary=true", () => {
            const root = render(
                <DoorButton size={size} href="/contact" primary>
                    Contact
                </DoorButton>
            )
            const f = frame(root, size)
            expect(f.classList.contains("border-ds-accent")).toBe(true)
            expect(f.classList.contains("border-ds-map-wood-wall")).toBe(false)
            expect(root.querySelectorAll('[data-primary="true"]')).toHaveLength(1)
            expect(root.querySelector("[aria-pressed]"), "links never carry aria-pressed").toBeNull()
        })

        it("pressed: accent frame and aria-pressed=true on the button", () => {
            const root = render(
                <DoorButton size={size} pressed>
                    すべて
                </DoorButton>
            )
            const el = control(root)
            expect(el.tagName).toBe("BUTTON")
            expect(el.getAttribute("aria-pressed")).toBe("true")
            const f = frame(root, size)
            expect(f.classList.contains("border-ds-accent")).toBe(true)
            expect(f.classList.contains("border-ds-map-wood-wall")).toBe(false)
            expect(root.querySelector("[data-primary]")).toBeNull()
        })

        it("not pressed: wood-wall frame and aria-pressed=false", () => {
            const root = render(
                <DoorButton size={size} pressed={false}>
                    すべて
                </DoorButton>
            )
            expect(control(root).getAttribute("aria-pressed")).toBe("false")
            const f = frame(root, size)
            expect(f.classList.contains("border-ds-map-wood-wall")).toBe(true)
            expect(f.classList.contains("border-ds-accent")).toBe(false)
        })
    })

    it.each(SIZES)("shows a focus outline for keyboard users (%s)", (size) => {
        for (const door of [
            <DoorButton key="b" size={size}>
                開く
            </DoorButton>,
            <DoorButton key="a" size={size} href="/2f/skills">
                Skills
            </DoorButton>,
        ]) {
            const el = control(render(door))
            const focus = Array.from(el.classList).filter((c) => c.startsWith("focus-visible:outline"))
            expect(focus.length).toBeGreaterThan(0)
        }
    })
})
