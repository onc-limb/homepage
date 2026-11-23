// @vitest-environment jsdom
import * as React from "react"
import type { Metadata } from "next"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { findFloor, findGroup } from "@/lib/building/floors"
import { CONTACT_EMAIL, SOCIAL_LINKS } from "@/lib/constants"
import { SITE_NAME } from "@/lib/seo"

/**
 * Contact page contract tests (/1f/contact).
 *
 * From the top: the `$ finger onclimb` command, the h1 「連絡先」, then the body.
 * No description under the heading and no peek band. The body starts with a
 * KeyValue (name and mail), has one link to the rooftop instead of listing the
 * external links, and holds the contact form.
 */

vi.mock("next/link", () => ({
    default: ({ children, ...props }: any) => (
        <a data-next-link="" {...props}>
            {children}
        </a>
    ),
}))
vi.mock("@/app/1f/contact/actions", () => ({ submitContactAction: vi.fn() }))

import * as contactModule from "@/app/1f/contact/page"
import ContactPage from "@/app/1f/contact/page"

const group = findGroup("contact")
const rooftop = findFloor("rf")

async function renderContact(): Promise<HTMLElement> {
    const html = renderToStaticMarkup(await ContactPage())
    const doc = new DOMParser().parseFromString(html, "text/html")
    const mains = doc.querySelectorAll("main")
    expect(mains).toHaveLength(1)
    return mains[0] as HTMLElement
}

function elementsOf(main: HTMLElement): Element[] {
    return Array.from(main.querySelectorAll("*"))
}

function commandLine(main: HTMLElement): Element {
    const found = elementsOf(main).filter((el) => el.tagName === "P" && el.textContent === `$ ${group.command}`)
    expect(found).toHaveLength(1)
    return found[0]
}

/** The dd that follows the dt whose text is `key`. */
function valueOf(dl: Element, key: string): Element {
    const dts = Array.from(dl.querySelectorAll("dt")).filter((dt) => dt.textContent === key)
    expect(dts, key).toHaveLength(1)
    const dd = dts[0].nextElementSibling
    expect(dd?.tagName, key).toBe("DD")
    return dd!
}

describe("contact page /1f/contact frame", () => {
    it("shows the finger onclimb command from FLOORS", async () => {
        const main = await renderContact()
        expect(group.command).toBe("finger onclimb")
        expect(commandLine(main)).toBeDefined()
    })

    it("puts the command first, with no peek band before it", async () => {
        const main = await renderContact()
        const command = commandLine(main)
        const elements = elementsOf(main)
        const before = elements.slice(0, elements.indexOf(command))
        for (const el of before) {
            expect(el.contains(command), `${el.tagName}.${el.className}`).toBe(true)
        }
    })

    it("has one h1 with the group name, right after the command", async () => {
        const main = await renderContact()
        const headings = main.querySelectorAll("h1")
        expect(headings).toHaveLength(1)
        expect(headings[0].textContent).toBe(group.name)
        expect(group.name).toBe("連絡先")
        expect(commandLine(main).nextElementSibling).toBe(headings[0])
    })

    it("starts the body with the KeyValue, with no description between the heading and it", async () => {
        const main = await renderContact()
        const elements = elementsOf(main)
        const h1 = main.querySelector("h1")!
        const dl = main.querySelector("dl")
        expect(dl, "KeyValue").not.toBeNull()
        const between = elements.slice(elements.indexOf(h1) + 1, elements.indexOf(dl!))
        for (const el of between) {
            expect(el.tagName, el.textContent ?? "").toBe("DIV")
            expect(el.contains(dl), `${el.tagName}.${el.className}`).toBe(true)
        }
    })
})

describe("contact page /1f/contact body", () => {
    it("shows the name and the mail address in the KeyValue", async () => {
        const main = await renderContact()
        const dl = main.querySelector("dl")!
        expect(valueOf(dl, "名前").textContent).toBe(`${SITE_NAME}（おんりむ）`)
        expect(valueOf(dl, "名前").textContent).toBe("onclimb（おんりむ）")

        const mail = valueOf(dl, "メール").querySelectorAll("a")
        expect(mail).toHaveLength(1)
        expect(mail[0].getAttribute("href")).toBe(`mailto:${CONTACT_EMAIL}`)
        expect(mail[0].textContent).toBe(CONTACT_EMAIL)
    })

    it("has exactly one link to the rooftop and lists no external links", async () => {
        const main = await renderContact()
        const links = Array.from(main.querySelectorAll("a"))
        expect(links.filter((a) => a.getAttribute("href") === rooftop.url)).toHaveLength(1)
        expect(rooftop.url).toBe("/rf")
        for (const link of SOCIAL_LINKS) {
            expect(main.innerHTML, link.name).not.toContain(link.url)
        }
        expect(links.filter((a) => /^https?:/.test(a.getAttribute("href") ?? ""))).toEqual([])
        expect(links.map((a) => a.getAttribute("href"))).not.toContain("/social")
        expect(links.map((a) => a.getAttribute("href"))).not.toContain("/contact")
    })

    it("has the contact form with its fields and a submit button", async () => {
        const main = await renderContact()
        const forms = main.querySelectorAll("form")
        expect(forms).toHaveLength(1)
        for (const name of ["name", "email", "company", "category", "message"]) {
            expect(forms[0].querySelector(`[name="${name}"]`), name).not.toBeNull()
        }
        expect(forms[0].querySelector('button[type="submit"]')).not.toBeNull()
    })

    it("adds no decoration: no icons, inline styles, rounded corners, shadows or translucency", async () => {
        const main = await renderContact()
        expect(main.querySelector("svg"), "no icons").toBeNull()
        expect(main.querySelector("[style]"), "no inline styles").toBeNull()
        const banned = elementsOf(main)
            .flatMap((el) => Array.from(el.classList))
            .filter((c) => /rounded|shadow|gradient|backdrop|opacity|hairline|\/\d+$|\[/.test(c))
        expect(banned).toEqual([])
    })
})

describe("contact page /1f/contact metadata", () => {
    it("exports a title, a description and the 1F canonical URL", async () => {
        const page = contactModule as { metadata?: Metadata; generateMetadata?: () => Metadata | Promise<Metadata> }
        const metadata = page.metadata ?? (await page.generateMetadata?.())
        expect(metadata?.title).toBe(group.name)
        expect(typeof metadata?.description).toBe("string")
        expect((metadata?.description as string).length).toBeGreaterThan(0)
        expect(String(metadata?.alternates?.canonical)).toMatch(/\/1f\/contact$/)
    })
})
