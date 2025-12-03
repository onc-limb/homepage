import { MetadataRoute } from 'next';
import { getProjectIds } from '@/lib/portfolio';
import { getAllNewsDates } from '@/lib/news';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://onclimb.net';
    // 静的ページ
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/profile`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/skills`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/portfolio`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/news`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/social`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
    ];
    // ポートフォリオ詳細ページ
    const projectIds = getProjectIds();
    const portfolioPages: MetadataRoute.Sitemap = projectIds.map((id) => ({
        url: `${baseUrl}/portfolio/${id}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
    }));
    // ニュース日付別ページ
    const newsDates = getAllNewsDates();
    const newsPages: MetadataRoute.Sitemap = newsDates.map((date) => ({
        url: `${baseUrl}/news/${date}`,
        lastModified: new Date(date),
        changeFrequency: 'never' as const,
        priority: 0.6,
    }));
    return [...staticPages, ...portfolioPages, ...newsPages];
}
