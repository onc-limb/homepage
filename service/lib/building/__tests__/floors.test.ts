import fs from "node:fs"
import path from "node:path"
import { describe, it, expect } from "vitest"
import {
    FLOORS,
    findFloor,
    findGroup,
    floorOfUrl,
    toPromptPath,
    toUrl,
    toVirtualPath,
} from "@/lib/building/floors"

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
        href: "/b1/studies",
    },
    {
        floor: "1f",
        slug: "profile",
        name: "プロフィール",
        command: "man onclimb",
        url: "/1f/profile",
        href: "/1f/profile",
    },
    {
        floor: "1f",
        slug: "contact",
        name: "連絡先",
        command: "finger onclimb",
        url: "/1f/contact",
        href: "/1f/contact",
    },
    {
        floor: "2f",
        slug: "histories",
        name: "経歴",
        command: "ls -tr ~/2f/histories",
        url: "/2f/histories",
        href: "/2f/histories",
    },
    {
        floor: "2f",
        slug: "skills",
        name: "スキル",
        command: "ls -l ~/2f/skills | sort -k level",
        url: "/2f/skills",
        href: "/2f/skills",
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

describe("FLOORS nav names and group notes", () => {
    it("gives each floor the short name shown in the navigation", () => {
        // Given the nav reads 案内 / B1 自己学習 / 1F プロフィール / 2F 経歴・技術 / 3F 作品・考え / 屋上 リンク
        // When navName is read for each floor
        // Then it is the short name that follows the label
        expect(FLOORS.map((floor) => [floor.id, floor.navName])).toEqual([
            ["b1", "自己学習"],
            ["1f", "プロフィール"],
            ["2f", "経歴・技術"],
            ["3f", "作品・考え"],
            ["rf", "リンク"],
        ])
    })

    it("gives a one-line note only to the single-page groups profile and contact", () => {
        // Given profile and contact hold a single page, the others are counted
        // When note is read for each group
        // Then only those two have a note and every other group has null
        expect(allGroups().map(({ group }) => [group.slug, group.note])).toEqual([
            ["studies", null],
            ["profile", "自己紹介・関心・資格"],
            ["contact", "フォーム・メール"],
            ["histories", null],
            ["skills", null],
            ["portfolios", null],
        ])
    })
})

describe("FLOORS guide descriptions", () => {
    // order.md やること 1（案内人の文面）: 階の説明と部屋の説明は定義に持たせ、組み立てはそこから引く
    it("gives each floor the description the guide reads out", () => {
        expect(FLOORS.map((floor) => [floor.id, floor.description])).toEqual([
            ["b1", "関心を持って、個人開発や勉強で身につけた技術の階です。"],
            ["1f", "入口のある階です。自己紹介と、連絡先があります。"],
            ["2f", "実際に仕事で行ってきたことと、そこで使ってきた技術の階です。"],
            ["3f", "事実というより、考え方や思想に近いものを置いた階です。"],
            ["rf", "屋上です。ここから外のサイトへ出られます。"],
        ])
    })

    it("gives a room description to the groups that are one room, and none to the groups split by category", () => {
        expect(allGroups().map(({ group }) => [group.slug, group.roomDescription])).toEqual([
            ["studies", null],
            ["profile", "自己紹介と、変わらず持ち続けている関心、取得した資格です。"],
            [
                "contact",
                "お仕事のご相談、技術的なご相談・壁打ちを受け付けています。帰る前に、ここで用件を伝えられます。",
            ],
            ["histories", "組み込みから Web、機械学習、AI まで。関わってきた仕事を古い順に置いてあります。"],
            ["skills", null],
            ["portfolios", "個人で設計・開発・運用しているプロダクトです。"],
        ])
        // A room description belongs exactly to the groups that have a single room on the map
        for (const { group } of allGroups()) {
            expect(group.roomDescription === null, group.slug).toBe(group.roomName === null)
        }
    })
})

describe("floorOfUrl()", () => {
    it.each(FLOORS.map((floor) => [floor.url, floor.id]))("places the floor url %s on %s", (url, id) => {
        expect(floorOfUrl(url)).toBe(id)
    })

    it.each([
        ["/2f/skills", "2f"],
        ["/2f/skills/typescript", "2f"],
        ["/b1/studies", "b1"],
        ["/1f/contact", "1f"],
        ["/1f/profile", "1f"],
        ["/2f/histories", "2f"],
    ])("places %s under its floor url on %s", (url, id) => {
        // Given a URL under a floor url (the final group URLs)
        // Then it belongs to that floor
        expect(floorOfUrl(url)).toBe(id)
    })

    it.each([
        ["/portfolio", "3f"],
        ["/portfolio/onc-limb", "3f"],
    ])("places the transitional URL %s on %s", (url, id) => {
        // Given the group pages still live at their old URLs (FLOORS href)
        // When the URL is the href of a group, or under it
        // Then it belongs to the floor of that group
        expect(floorOfUrl(url)).toBe(id)
    })

    it("gives the skills and studies groups their final URLs as href", () => {
        // Given the skills list moved to /2f/skills and the studies list to /b1/studies
        // Then the doors, the navigation and the prompt link to the final URLs
        expect(findGroup("skills").href).toBe(findGroup("skills").url)
        expect(findGroup("skills").href).toBe("/2f/skills")
        expect(findGroup("studies").href).toBe(findGroup("studies").url)
        expect(findGroup("studies").href).toBe("/b1/studies")
    })

    it.each([
        "/skills",
        "/skills/typescript",
        "/profile",
        "/skillset",
        "/profiles",
        "/portfolios",
        "/2fx",
        "/b10",
        "/books",
        "/blog",
        "/",
    ])(
        "places %s on no floor",
        (url) => {
            // Given a URL that only shares leading characters with a floor url or a group href,
            //   or that belongs to no floor at all
            // Then it is on no floor (the boundary is "/")
            expect(floorOfUrl(url)).toBeNull()
        },
    )

    it("resolves every group href without failing", () => {
        for (const { group } of allGroups()) {
            expect(floorOfUrl(group.href), group.href).not.toBeNull()
        }
    })

    it("rejects a value that does not start with /", () => {
        expect(() => floorOfUrl("skills")).toThrow()
    })
})

describe("toPromptPath()", () => {
    it("shows the site root as the bare home directory", () => {
        expect(toPromptPath("/")).toBe("~")
    })

    it.each([
        ["/2f/skills", "~/2f/skills"],
        ["/2f/skills/typescript", "~/2f/skills/typescript"],
        ["/b1/studies", "~/b1/studies"],
        ["/2f", "~/2f"],
        ["/rf", "~/rf"],
        ["/1f/profile", "~/1f/profile"],
        ["/2f/histories", "~/2f/histories"],
        ["/1f/contact", "~/1f/contact"],
        ["/portfolio", "~/3f/portfolios"],
        ["/portfolio/onc-limb", "~/3f/portfolios/onc-limb"],
    ])("turns %s into the virtual path %s", (url, expected) => {
        // Given a floor URL, a final group URL, or a transitional group href (or a page under it)
        // When it is turned into a prompt path
        // Then it is the virtual path of the floor / group it belongs to
        expect(toPromptPath(url)).toBe(expected)
    })

    it.each([
        ["/skills", "~/skills"],
        ["/books", "~/books"],
        ["/profile", "~/profile"],
        ["/skillset", "~/skillset"],
        ["/2fx", "~/2fx"],
    ])("keeps %s, which belongs to no floor, as is under ~", (url, expected) => {
        expect(toPromptPath(url)).toBe(expected)
    })

    it("rejects a value that does not start with /", () => {
        expect(() => toPromptPath("skills")).toThrow()
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
