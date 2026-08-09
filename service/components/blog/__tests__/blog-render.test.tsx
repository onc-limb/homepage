import React from "react"
import { describe, it, expect, beforeEach, vi, type Mock } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"

// articles-data-access はこのタスクの書き込み境界外の並行実装のため、公開用関数をモックする。
vi.mock("@/lib/articles", () => ({
    listPublishedArticles: vi.fn(),
    getPublishedArticleBySlug: vi.fn(),
}))

import { listPublishedArticles, getPublishedArticleBySlug } from "@/lib/articles"
import { ArticleDetail, BlogListContent, type BlogArticle } from "@/components/blog"
import BlogPage from "@/app/blog/page"
import ArticlePage, { generateMetadata } from "@/app/blog/[slug]/page"

const listMock = listPublishedArticles as unknown as Mock
const slugMock = getPublishedArticleBySlug as unknown as Mock

function make(over: Partial<BlogArticle>): BlogArticle {
    return {
        id: 1,
        slug: "s",
        title: "t",
        body: "b",
        status: "published",
        tags: [],
        createdAt: "2026-01-01 00:00:00",
        updatedAt: "2026-01-01 00:00:00",
        ...over,
    }
}

beforeEach(() => {
    listMock.mockReset()
    slugMock.mockReset()
})

describe("ArticleDetail", () => {
    it("renders the markdown body via react-markdown + remark-gfm", () => {
        const html = renderToStaticMarkup(
            <ArticleDetail
                article={make({
                    title: "My Post",
                    body: "## Heading\n\nHello world with ~~strike~~.",
                    tags: ["ts"],
                })}
            />
        )
        expect(html).toContain("My Post")
        expect(html).toContain("Heading")
        expect(html).toContain("Hello world")
        // remark-gfm の取り消し線が <del> に変換されていること
        expect(html).toContain("<del>")
        expect(html).toContain("ts")
    })

    it("replaces ```mermaid blocks with the MermaidDiagram component", () => {
        const html = renderToStaticMarkup(
            <ArticleDetail
                article={make({
                    body: "```mermaid\nflowchart LR\n    a --> b\n```",
                })}
            />
        )
        // SSR 時点では動的 import 前のプレースホルダが出る（SVG 描画はクライアント側）
        expect(html).toContain("mermaid-loading")
        // 生のコードブロックとしては表示されないこと
        expect(html).not.toContain("language-mermaid")
    })

    it("keeps non-mermaid code blocks as plain <pre><code>", () => {
        const html = renderToStaticMarkup(
            <ArticleDetail
                article={make({
                    body: '```bash\nterraform init -backend-config="backend.hcl"\n```',
                })}
            />
        )
        expect(html).toContain("<pre>")
        expect(html).toContain("language-bash")
        expect(html).toContain("terraform init")
        expect(html).not.toContain("mermaid-loading")
    })
})

describe("BlogPage (公開一覧)", () => {
    it("passes only published articles from the data-access layer", async () => {
        listMock.mockResolvedValue([
            make({ slug: "a", status: "published", tags: ["ts"] }),
            make({ slug: "c", status: "published", tags: ["go"] }),
        ])
        const el = await BlogPage({ searchParams: Promise.resolve({}) })
        expect(el.type).toBe(BlogListContent)
        expect(el.props.articles).toHaveLength(2)
        expect(
            el.props.articles.every((a: BlogArticle) => a.status === "published")
        ).toBe(true)
        expect(el.props.selectedTag).toBeUndefined()
    })

    it("forwards the ?tag query as the selected tag (絞り込みクエリ)", async () => {
        listMock.mockResolvedValue([])
        const el = await BlogPage({
            searchParams: Promise.resolve({ tag: "go" }),
        })
        expect(el.props.selectedTag).toBe("go")
    })
})

describe("ArticlePage (slug 詳細)", () => {
    it("uses the original Zenn URL as canonical for a republished article", async () => {
        slugMock.mockResolvedValue({
            ...make({ slug: "republished-post", title: "Republished" }),
            canonicalUrl: "https://zenn.dev/onclimb/articles/republished-post",
        })

        const metadata = await generateMetadata({
            params: Promise.resolve({ slug: "republished-post" }),
        })

        expect(metadata.alternates?.canonical).toBe(
            "https://zenn.dev/onclimb/articles/republished-post"
        )
    })

    it("uses the homepage article URL as canonical for an original article", async () => {
        slugMock.mockResolvedValue({
            ...make({ slug: "original-post", title: "Original" }),
            canonicalUrl: null,
        })

        const metadata = await generateMetadata({
            params: Promise.resolve({ slug: "original-post" }),
        })

        expect(metadata.alternates?.canonical).toBe(
            "https://onclimb.net/blog/original-post"
        )
        expect(metadata.description).toBe("b")
        expect(metadata.openGraph).toMatchObject({
            type: "article",
            title: "Original | onclimb",
            url: "https://onclimb.net/blog/original-post",
        })
        expect(metadata.twitter).toMatchObject({
            card: "summary_large_image",
            title: "Original | onclimb",
        })
    })

    it("renders the article body on direct URL access", async () => {
        slugMock.mockResolvedValue(
            make({
                slug: "my-post",
                title: "Direct Title",
                body: "# Direct Body\n\nAccessible via URL.",
            })
        )
        const el = await ArticlePage({
            params: Promise.resolve({ slug: "my-post" }),
        })
        const html = renderToStaticMarkup(el)
        expect(html).toContain("Direct Title")
        expect(html).toContain("Direct Body")
        expect(html).toContain("Accessible via URL.")
        expect(html).toContain('type="application/ld+json"')
        expect(html).toContain('"@type":"BlogPosting"')
        expect(html).toContain('"@type":"BreadcrumbList"')
        expect(slugMock).toHaveBeenCalledWith("my-post")
    })

    it("calls notFound() when no published article matches the slug", async () => {
        slugMock.mockResolvedValue(null)
        await expect(
            ArticlePage({ params: Promise.resolve({ slug: "missing" }) })
        ).rejects.toThrow()
    })
})
