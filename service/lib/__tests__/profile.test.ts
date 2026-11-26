import { describe, it, expect } from "vitest"
import { listHistories, parseProfile } from "@/lib/profile"

/**
 * parseProfile contract tests.
 *
 * Plan: lib/profile.ts に parseProfile(rawMarkdown: string): ParsedProfile を追加し、
 *   docs/design/profile.html の以下の構造をサポートする:
 *     - story 01 自己紹介 (paragraphs)
 *     - story 02 経歴 (career timeline: role + bullets)
 *     - story 03 関心 (interest grid: title + description)
 *     - story 04 資格 (certs grid: title + year)
 *
 * Reference: docs/design/profile.html:329-451, docs/profile.md
 */

const FIXTURE_MARKDOWN = `---
name: Test User
title: Test Engineer
avatar: /avatar.png
github: https://github.com/example
---

## 自己紹介

「なぜ動くのか」を理解することにこだわるエンジニア。

ライブラリもフレームワークも、ブラックボックスのまま使うのは落ち着かない。

最も大切にしているのは「作ったものがユーザーに届くこと」。

## 経歴

### MLOps（推薦系）

- 学習パイプライン作成
- モデル評価機構作成

### Web開発（人材系）

- サービス統合におけるアーキテクチャ提案
- 自社社内システム新規開発
- 自社サービス機能開発
- 自社サービス運用保守

### 組み込み開発（車載ソフトウェア）

- AUTOSARプラットフォームの製品向けカスタマイズ
- C言語による機能開発

## エンジニアとしての今

### 関心

- **低レイヤーの理解** - 表面的な使い方だけでなく、その下で何が起きているのかを知りたい
- **プロトコル・仕様** - Web標準、HTTP、RFCなど、ソフトウェアの根本にある取り決め
- **アーキテクチャ** - システム全体の設計思想と、スケーラブルで破綻しない構造

### 学習

- **技術書** - 月1万円ほど投資。体系的な知識を得るための読書習慣

### 資格

- AWS Certified Solutions Architect - Associate (2025)
- AWS Certified Cloud Practitioner (2024)
- 情報処理安全確保支援士試験 合格 (2022) ※登録資格保有、未登録
- 基本情報技術者試験 (2021)
`

describe("parseProfile", () => {
    describe("自己紹介 section", () => {
        it("extracts the prose body of the 自己紹介 section as paragraph blocks", () => {
            // Given a profile markdown with a 自己紹介 section
            // When parseProfile is invoked
            // Then selfIntroduction contains paragraph blocks for each prose paragraph
            const result = parseProfile(FIXTURE_MARKDOWN)
            const allText = result.selfIntroduction.map((b) => b.text).join("\n")
            expect(allText).toContain(
                "「なぜ動くのか」を理解することにこだわるエンジニア。",
            )
            expect(allText).toContain(
                "最も大切にしているのは「作ったものがユーザーに届くこと」。",
            )
            expect(
                result.selfIntroduction.every((b) => b.type === "paragraph"),
            ).toBe(true)
        })

        it("classifies blockquote paragraphs as pullQuote blocks", () => {
            // Given a profile markdown with a `>` blockquote paragraph
            // When parseProfile is invoked
            // Then the corresponding block is marked as pullQuote
            const md = `## 自己紹介\n\nfirst paragraph.\n\n> highlighted statement.\n\nlast paragraph.\n`
            const result = parseProfile(md)
            const pullQuotes = result.selfIntroduction.filter(
                (b) => b.type === "pullQuote",
            )
            expect(pullQuotes).toHaveLength(1)
            expect(pullQuotes[0].text).toBe("highlighted statement.")
        })

        it("returns an empty array when the 自己紹介 section is missing", () => {
            // Given a profile markdown without a 自己紹介 section
            // When parseProfile is invoked
            // Then selfIntroduction is empty
            const noIntro =
                "---\nname: x\ntitle: y\navatar: a\ngithub: g\n---\n\n## 経歴\n\n### Role\n\n- bullet"
            const result = parseProfile(noIntro)
            expect(result.selfIntroduction).toEqual([])
        })
    })

    describe("経歴 section", () => {
        it("extracts each ### subsection as a career item", () => {
            // Given 3 ### subsections under 経歴
            // When parseProfile is invoked
            // Then career has 3 entries with the matching role labels
            const result = parseProfile(FIXTURE_MARKDOWN)
            expect(result.career).toHaveLength(3)
            expect(result.career.map((c) => c.role)).toEqual([
                "MLOps（推薦系）",
                "Web開発（人材系）",
                "組み込み開発（車載ソフトウェア）",
            ])
        })

        it("collects bullet items under each ### subsection", () => {
            // Given a career subsection with bullet items
            // When parseProfile is invoked
            // Then bullets contains every bullet line in document order
            const result = parseProfile(FIXTURE_MARKDOWN)
            expect(result.career[0].bullets).toEqual([
                "学習パイプライン作成",
                "モデル評価機構作成",
            ])
            expect(result.career[1].bullets).toEqual([
                "サービス統合におけるアーキテクチャ提案",
                "自社社内システム新規開発",
                "自社サービス機能開発",
                "自社サービス運用保守",
            ])
        })

        it("keeps the single career item when only one is defined", () => {
            // Given only one career item is defined
            // When parseProfile is invoked
            // Then career holds that one item with its role and bullets
            const md = `---\nname: x\ntitle: y\navatar: a\ngithub: g\n---\n\n## 経歴\n\n### Solo Role\n\n- only bullet\n`
            const result = parseProfile(md)
            expect(result.career).toEqual([{ role: "Solo Role", bullets: ["only bullet"] }])
        })

        it("does not attach a period label to career items", () => {
            // Given the CURRENT / PRIOR / START labels belonged to the retired profile design
            // When parseProfile is invoked
            // Then each career item has only role and bullets
            const result = parseProfile(FIXTURE_MARKDOWN)
            for (const item of result.career) {
                expect(Object.keys(item).sort()).toEqual(["bullets", "role"])
            }
        })
    })

    describe("学習 subsection", () => {
        it("extracts the `**title** - description` lines under `### 学習`", () => {
            // Given the markdown has one line under 学習
            // When parseProfile is invoked
            // Then learning holds that line split into title and description
            const result = parseProfile(FIXTURE_MARKDOWN)
            expect(result.learning).toEqual([
                { title: "技術書", description: "月1万円ほど投資。体系的な知識を得るための読書習慣" },
            ])
        })

        it("does not take lines of the same form from 関心 or 資格", () => {
            // Given 関心 and 資格 have lines next to 学習
            // When parseProfile is invoked
            // Then only the 学習 line is in learning
            const result = parseProfile(FIXTURE_MARKDOWN)
            expect(result.learning).toHaveLength(1)
            const titles = result.learning.map((item) => item.title)
            expect(titles).not.toContain("アーキテクチャ")
            expect(titles.join(" ")).not.toContain("AWS Certified Cloud Practitioner")
        })

        it("returns an empty array when 学習 is missing", () => {
            const md = `---\nname: x\ntitle: y\navatar: a\ngithub: g\n---\n\n## エンジニアとしての今\n\n### 関心\n\n- **a** - b\n`
            const result = parseProfile(md)
            expect(result.learning).toEqual([])
            expect(result.interests).toHaveLength(1)
        })
    })

    describe("関心 subsection", () => {
        it("extracts interests from `### 関心` regardless of parent section", () => {
            // Given the markdown places 関心 under エンジニアとしての今
            // When parseProfile is invoked
            // Then 関心 items are surfaced at top level
            const result = parseProfile(FIXTURE_MARKDOWN)
            expect(result.interests).toHaveLength(3)
        })

        it("splits each `**title** - description` bullet into structured fields", () => {
            // Given each interest line uses bold-title + dash + description
            // When parseProfile is invoked
            // Then title and description are split
            const result = parseProfile(FIXTURE_MARKDOWN)
            expect(result.interests[0]).toEqual({
                title: "低レイヤーの理解",
                description:
                    "表面的な使い方だけでなく、その下で何が起きているのかを知りたい",
            })
            expect(result.interests[1].title).toBe("プロトコル・仕様")
            expect(result.interests[2].title).toBe("アーキテクチャ")
        })

        it("returns an empty array when 関心 is missing", () => {
            // Given a markdown without a 関心 subsection
            // When parseProfile is invoked
            // Then interests is empty
            const md = `---\nname: x\ntitle: y\navatar: a\ngithub: g\n---\n\n## 自己紹介\n\nbody\n`
            const result = parseProfile(md)
            expect(result.interests).toEqual([])
        })
    })

    describe("資格 subsection", () => {
        it("extracts each cert bullet into title and year", () => {
            // Given each cert line has a `(YYYY...)` parenthesized year fragment
            // When parseProfile is invoked
            // Then title strips the parenthesized year
            const result = parseProfile(FIXTURE_MARKDOWN)
            expect(result.certs).toHaveLength(4)
            expect(result.certs[0]).toEqual({
                title: "AWS Certified Solutions Architect - Associate",
                year: "2025",
            })
            expect(result.certs[1]).toEqual({
                title: "AWS Certified Cloud Practitioner",
                year: "2024",
            })
        })

        it("keeps a trailing note after the year out of the year", () => {
            // Given the third cert includes a registration note after the year
            // When parseProfile is invoked
            // Then the year is only what is inside the parentheses and the note is kept apart
            const result = parseProfile(FIXTURE_MARKDOWN)
            expect(result.certs[2]).toEqual({
                title: "情報処理安全確保支援士試験 合格",
                year: "2022",
                note: "※登録資格保有、未登録",
            })
        })

        it("returns an empty array when 資格 is missing", () => {
            // Given a markdown without a 資格 subsection
            // When parseProfile is invoked
            // Then certs is empty
            const md = `---\nname: x\ntitle: y\navatar: a\ngithub: g\n---\n\n## 自己紹介\n\nhi\n`
            const result = parseProfile(md)
            expect(result.certs).toEqual([])
        })
    })

    describe("input boundaries", () => {
        it("parses markdown with no front-matter but valid sections", () => {
            // Given markdown without YAML front-matter
            // When parseProfile is invoked
            // Then section parsing still works
            const md = `## 経歴\n\n### Role A\n\n- bullet a\n`
            const result = parseProfile(md)
            expect(result.career).toHaveLength(1)
            expect(result.career[0].role).toBe("Role A")
        })

        it("returns empty fields for an empty input", () => {
            // Given an empty markdown string
            // When parseProfile is invoked
            // Then every collection is empty and selfIntroduction is empty
            const result = parseProfile("")
            expect(result.selfIntroduction).toEqual([])
            expect(result.career).toEqual([])
            expect(result.interests).toEqual([])
            expect(result.learning).toEqual([])
            expect(result.certs).toEqual([])
        })
    })
})

describe("listHistories", () => {
    it("lists the career oldest first with two-digit numbers from 01", () => {
        // Given career written newest first, as in profile.md
        const career = [
            { role: "AIドキュメント検索サービス", bullets: ["a1", "a2"] },
            { role: "MLOps（推薦系）", bullets: ["m1"] },
            { role: "組み込み開発（車載ソフトウェア）", bullets: ["e1", "e2", "e3"] },
        ]

        // When the histories list is made
        // Then the oldest is 01 and every bullet is kept
        expect(listHistories(career)).toEqual([
            { number: "01", role: "組み込み開発（車載ソフトウェア）", bullets: ["e1", "e2", "e3"] },
            { number: "02", role: "MLOps（推薦系）", bullets: ["m1"] },
            { number: "03", role: "AIドキュメント検索サービス", bullets: ["a1", "a2"] },
        ])
    })

    it("gives two histories with the same heading different numbers", () => {
        const career = [
            { role: "Web開発", bullets: ["新しい方"] },
            { role: "Web開発", bullets: ["古い方"] },
        ]

        expect(listHistories(career)).toEqual([
            { number: "01", role: "Web開発", bullets: ["古い方"] },
            { number: "02", role: "Web開発", bullets: ["新しい方"] },
        ])
    })

    it("pads to two digits past nine and does not reorder the input", () => {
        const career = Array.from({ length: 10 }, (_, index) => ({ role: `role ${10 - index}`, bullets: [] }))
        const snapshot = career.map((item) => item.role)

        const histories = listHistories(career)

        expect(histories.map((item) => item.number)).toEqual([
            "01", "02", "03", "04", "05", "06", "07", "08", "09", "10",
        ])
        expect(histories[0].role).toBe("role 1")
        expect(histories[9].role).toBe("role 10")
        expect(career.map((item) => item.role)).toEqual(snapshot)
    })

    it("returns an empty list for no career", () => {
        expect(listHistories([])).toEqual([])
    })
})
