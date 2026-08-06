import { MetadataRoute } from "next"
import { listPublishedArticles } from "@/lib/articles"
import { getProjects } from "@/lib/portfolio"

export const dynamic = "force-dynamic"

function latestDate(values: string[]): Date | undefined {
    const timestamps = values.map(Date.parse).filter(Number.isFinite)
    if (timestamps.length === 0) return undefined
    return new Date(Math.max(...timestamps))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://onclimb.net").replace(/\/$/, "")
    const projects = getProjects()
    const publishedArticles = await listPublishedArticles()
    const portfolioLastModified = latestDate(projects.map((project) => project.updatedAt))
    const blogLastModified = latestDate(publishedArticles.map((article) => article.updatedAt))

    // 静的ページ
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            changeFrequency: "weekly",
            priority: 1.0,
        },
        {
            url: `${baseUrl}/profile`,
            changeFrequency: "monthly",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/skills`,
            changeFrequency: "monthly",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/portfolio`,
            ...(portfolioLastModified ? { lastModified: portfolioLastModified } : {}),
            changeFrequency: "monthly",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/social`,
            changeFrequency: "monthly",
            priority: 0.7,
        },
        {
            url: `${baseUrl}/contact`,
            changeFrequency: "yearly",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/books`,
            changeFrequency: "weekly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/blog`,
            ...(blogLastModified ? { lastModified: blogLastModified } : {}),
            changeFrequency: "weekly",
            priority: 0.9,
        },
    ]

    // ポートフォリオ詳細ページ
    const portfolioPages: MetadataRoute.Sitemap = projects.map((project) => ({
        url: `${baseUrl}/portfolio/${project.id}`,
        lastModified: new Date(project.updatedAt),
        changeFrequency: "monthly" as const,
        priority: 0.8,
    }))

    const articlePages: MetadataRoute.Sitemap = publishedArticles.map((article) => ({
        url: `${baseUrl}/blog/${article.slug}`,
        lastModified: new Date(article.updatedAt),
        changeFrequency: "monthly" as const,
        priority: 0.8,
    }))

    return [...staticPages, ...portfolioPages, ...articlePages]
}
