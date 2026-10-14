import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    getProfile: vi.fn(),
    getParsedProfile: vi.fn(),
}))
vi.mock("@/lib/profile", () => mocks)
vi.mock("@/components/animations", () => ({
    Reveal: ({
        as: Tag = "div",
        children,
        delay: _delay,
        ...props
    }: React.HTMLAttributes<HTMLElement> & {
        as?: React.ElementType
        delay?: number
    }) => <Tag {...props}>{children}</Tag>,
}))

import ProfilePage from "@/app/profile/page"

beforeEach(() => {
    mocks.getProfile.mockResolvedValue({
        data: { name: "Fixture name", title: "Fixture role", avatar: "/MainLogo.png" },
        content: "",
    })
    mocks.getParsedProfile.mockResolvedValue({
        selfIntroduction: [{ type: "paragraph", text: "Fixture introduction" }],
        career: [
            { period: "CURRENT", role: "Fixture career", bullets: ["Fixture work"] },
        ],
        interests: [{ title: "Fixture interest", description: "Fixture description" }],
        certs: [{ title: "Fixture certification", year: "2025" }],
    })
})

describe("profile page", () => {
    it("renders profile data without inventing availability, location, or experience", async () => {
        const html = renderToStaticMarkup(await ProfilePage())
        for (const value of [
            "Fixture name",
            "Fixture role",
            "Fixture introduction",
            "Fixture career",
            "Fixture work",
            "Fixture interest",
            "Fixture certification",
        ]) {
            expect(html).toContain(value)
        }
        for (const claim of [
            "available for new projects",
            "Tokyo",
            "5+ years",
            "Backend / Software Architecture",
            "open to work",
        ]) {
            expect(html).not.toContain(claim)
        }
        expect(html).toContain('href="/skills"')
        expect(html).toContain("使ってきた技術スタックを見る")
    })

    it("omits empty sections instead of leaving decorative numbers or placeholder facts", async () => {
        mocks.getParsedProfile.mockResolvedValue({
            selfIntroduction: [],
            career: [],
            interests: [],
            certs: [],
        })
        const html = renderToStaticMarkup(await ProfilePage())
        expect(html).not.toContain("<h2")
        expect(html).not.toMatch(/>\s*0[1-4]\s*</)
        expect(html).not.toContain("NEXT — 02")
        expect(html).not.toContain("open to work")
        expect(html).toContain("Fixture name")
    })
})
