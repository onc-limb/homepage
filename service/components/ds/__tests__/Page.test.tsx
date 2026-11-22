// @vitest-environment jsdom
import { describe, expect, it } from "vitest"

import { Page } from "../Page"
import { closestClass, elementWithText, precedes, render } from "./render"

/** ds color utilities (text-ds-sm/base/lg/xl are font sizes, not colors). */
const TEXT_COLOR = /^text-ds-(?!(sm|base|lg|xl)$)/

describe("Page", () => {
    it("shows the command as `$ <command>` above the h1, outside the h1 text", () => {
        const root = render(
            <Page title="自己紹介" command="man onclimb">
                <p>本文</p>
            </Page>
        )
        const h1 = root.querySelector("h1")
        expect(h1).not.toBeNull()
        expect(h1!.textContent).toBe("自己紹介")

        const command = elementWithText(root, "$ man onclimb")
        expect(command, "element with `$ man onclimb`").toBeDefined()
        expect(command!.contains(h1!)).toBe(false)
        expect(h1!.contains(command!)).toBe(false)
        expect(precedes(command!, h1!), "command comes before h1").toBe(true)
    })

    it("draws the command line monospace and muted", () => {
        const root = render(<Page title="自己紹介" command="man onclimb" />)
        const command = elementWithText(root, "$ man onclimb")!
        expect(closestClass(command, /^font-ds$/, root)).toBe("font-ds")
        expect(closestClass(command, TEXT_COLOR, root)).toBe("text-ds-fg-muted")
    })

    it("does not render a command line when no command is given", () => {
        const root = render(
            <Page title="自己紹介">
                <p>本文</p>
            </Page>
        )
        expect(root.textContent).not.toContain("$")
        expect(root.textContent).toBe("自己紹介本文")
    })

    it("renders peek, command, h1 and children in this order", () => {
        const root = render(
            <Page
                title="自己紹介"
                command="man onclimb"
                peek={<div data-part="peek">のぞき窓</div>}
            >
                <p data-part="body">本文</p>
            </Page>
        )
        const peek = root.querySelector('[data-part="peek"]')!
        const command = elementWithText(root, "$ man onclimb")!
        const h1 = root.querySelector("h1")!
        const body = root.querySelector('[data-part="body"]')!
        for (const el of [peek, command, h1, body]) expect(el).not.toBeNull()

        expect(precedes(peek, command), "peek before command").toBe(true)
        expect(precedes(command, h1), "command before h1").toBe(true)
        expect(precedes(h1, body), "h1 before children").toBe(true)
        expect(h1.contains(body)).toBe(false)
    })

    it("renders exactly one h1 and no lead text besides the given parts", () => {
        const root = render(
            <Page
                title="自己紹介"
                command="man onclimb"
                peek={<div>のぞき窓</div>}
            >
                <p>本文</p>
            </Page>
        )
        expect(root.querySelectorAll("h1")).toHaveLength(1)
        expect(root.textContent).toBe("のぞき窓$ man onclimb自己紹介本文")
    })

    it("limits the width to --ds-page-max with 16px gutters widening to 40px", () => {
        const root = render(<Page title="自己紹介" />)
        const frame = root.firstElementChild!
        expect(frame).not.toBeNull()
        expect(frame.classList.contains("max-w-ds-page"), "max-w-ds-page").toBe(true)
        expect(frame.classList.contains("px-ds-3"), "px-ds-3").toBe(true)
        expect(frame.classList.contains("md:px-ds-page-gutter"), "md:px-ds-page-gutter").toBe(true)
        expect(frame.classList.contains("mx-auto"), "mx-auto").toBe(true)
    })
})
