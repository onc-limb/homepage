import fs from "node:fs"
import path from "node:path"
import { describe, it, expect } from "vitest"
import { FLOORS, findFloor, findGroup, toUrl, toVirtualPath } from "@/lib/building/floors"

/**
 * FLOORS contract tests.
 *
 * Plan: lib/building/floors.ts に 5 つの階と 6 つの分類を定義し、
 *   URL (`/2f/skills`) と仮想パス (`~/2f/skills`) を相互に変換する関数を置く。
 *   notes / books はこの job では定義しない。
 *
 * Reference: order.md やること1, Issue #336, design-system.md 「階と URL」「コマンド」の表
 */

const EXPECTED_GROUPS = [
    {
        floor: "b1",
        slug: "studies",
        name: "自己学習",
        command: "ls -l ~/b1/studies | sort -k level",
        url: "/b1/studies",
        href: "/skills",
    },
    {
        floor: "1f",
        slug: "profile",
        name: "プロフィール",
        command: "man onclimb",
        url: "/1f/profile",
        href: "/profile",
    },
    {
        floor: "1f",
        slug: "contact",
        name: "連絡先",
        command: "finger onclimb",
        url: "/1f/contact",
        href: "/contact",
    },
    {
        floor: "2f",
        slug: "histories",
        name: "経歴",
        command: "ls -tr ~/2f/histories",
        url: "/2f/histories",
        href: "/profile",
    },
    {
        floor: "2f",
        slug: "skills",
        name: "スキル",
        command: "ls -l ~/2f/skills | sort -k level",
        url: "/2f/skills",
        href: "/skills",
    },
    {
        floor: "3f",
        slug: "portfolios",
        name: "ポートフォリオ",
        command: "git log --oneline ~/3f/portfolios",
        url: "/3f/portfolios",
        href: "/portfolio",
    },
] as const

const allGroups = () =>
    FLOORS.flatMap((floor) => floor.groups.map((group) => ({ floor: floor.id, group })))

describe("FLOORS", () => {
    it("defines exactly 5 floors in the order b1, 1f, 2f, 3f, rf", () => {
        expect(FLOORS.map((floor) => floor.id)).toEqual(["b1", "1f", "2f", "3f", "rf"])
    })

    it("gives each floor its label, name and url", () => {
        expect(
            FLOORS.map((floor) => ({ id: floor.id, label: floor.label, name: floor.name, url: floor.url })),
        ).toEqual([
            { id: "b1", label: "B1", name: "自己学習", url: "/b1" },
            { id: "1f", label: "1F", name: "プロフィール・連絡先", url: "/1f" },
            { id: "2f", label: "2F", name: "経歴・業務の技術", url: "/2f" },
            { id: "3f", label: "3F", name: "作ったもの・考え", url: "/3f" },
            { id: "rf", label: "屋上", name: "屋上テラス・外部リンク", url: "/rf" },
        ])
    })

    // 地図の素材（order.md: 1F〜3F = 木、B1 = 石、屋上 = 板張りのテラス）
    it("gives each floor the material its map is drawn in", () => {
        expect(FLOORS.map((floor) => ({ id: floor.id, material: floor.material }))).toEqual([
            { id: "b1", material: "stone" },
            { id: "1f", material: "wood" },
            { id: "2f", material: "wood" },
            { id: "3f", material: "wood" },
            { id: "rf", material: "deck" },
        ])
    })

    it("defines exactly 6 groups with unique slugs and no notes / books", () => {
        const slugs = allGroups().map(({ group }) => group.slug)

        expect(slugs).toHaveLength(6)
        expect(new Set(slugs).size).toBe(6)
        expect(slugs).not.toContain("notes")
        expect(slugs).not.toContain("books")
    })

    it("has no groups on the rooftop", () => {
        const rooftop = FLOORS.find((floor) => floor.id === "rf")
        expect(rooftop?.groups).toEqual([])
    })

    it.each(EXPECTED_GROUPS)(
        "places $slug on $floor with its name, command, final url and transitional href",
        (expected) => {
            const found = allGroups().find(({ group }) => group.slug === expected.slug)

            expect(found?.floor).toBe(expected.floor)
            expect({
                slug: found?.group.slug,
                name: found?.group.name,
                command: found?.group.command,
                url: found?.group.url,
                href: found?.group.href,
            }).toEqual({
                slug: expected.slug,
                name: expected.name,
                command: expected.command,
                url: expected.url,
                href: expected.href,
            })
        },
    )

    it("gives every group the id of the floor that contains it", () => {
        for (const floor of FLOORS) {
            for (const group of floor.groups) {
                expect(group.floor).toBe(floor.id)
            }
        }
        expect(findGroup("skills").floor).toBe("2f")
        expect(findFloor("rf").url).toBe("/rf")
    })

    it("builds every group url from its floor id and slug", () => {
        for (const { floor, group } of allGroups()) {
            expect(group.url).toBe(`/${floor}/${group.slug}`)
        }
    })
})

describe("findGroup()", () => {
    it("returns the group definition for a slug", () => {
        const group = findGroup("skills")
        expect(group.slug).toBe("skills")
        expect(group.url).toBe("/2f/skills")
    })
})

describe("toVirtualPath() / toUrl()", () => {
    it("converts a url to a virtual path", () => {
        expect(toVirtualPath("/2f/skills")).toBe("~/2f/skills")
    })

    it("converts a virtual path to a url", () => {
        expect(toUrl("~/2f/skills")).toBe("/2f/skills")
    })

    it("round-trips every floor and group url", () => {
        const urls = [...FLOORS.map((floor) => floor.url), ...allGroups().map(({ group }) => group.url)]

        for (const url of urls) {
            expect(toUrl(toVirtualPath(url))).toBe(url)
        }
    })

    it("round-trips every floor and group virtual path", () => {
        const paths = [
            ...FLOORS.map((floor) => `~/${floor.id}`),
            ...allGroups().map(({ floor, group }) => `~/${floor}/${group.slug}`),
        ]

        for (const virtualPath of paths) {
            expect(toVirtualPath(toUrl(virtualPath))).toBe(virtualPath)
        }
    })

    it("rejects inputs in the wrong form", () => {
        // Given: 仮想パスを toVirtualPath に、URL を toUrl に渡す（向きを取り違えた入力）
        // Then: 黙って変な文字列を返さず Error を投げる
        expect(() => toVirtualPath("~/2f/skills")).toThrow()
        expect(() => toUrl("/2f/skills")).toThrow()
    })
})

describe("client safety", () => {
    // lib/building/floors.ts は Client Component から import されうるため、
    // md を読み込むモジュール（skills / profile / portfolio / entries）や .md を import してはならない。
    it("floors.ts does not import modules that load markdown", () => {
        const source = fs.readFileSync(path.resolve(__dirname, "../floors.ts"), "utf-8")
        const specifiers = [...source.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1])

        for (const specifier of specifiers) {
            expect(specifier).not.toMatch(/(^|\/)(skills|profile|portfolio|entries)$|\.md$/)
        }
    })
})
