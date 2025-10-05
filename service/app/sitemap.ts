import { MetadataRoute } from 'next';
import { getArticles } from '@/lib/article';
import { getKnowledgeMetadata } from '@/lib/knowledge';
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
            priority: 0.8,
        },
        {
            url: `${baseUrl}/articles`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/knowledges`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/portfolio`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/portfolio/climbing-shoes-library`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
    ];
    // 動的な記事ページ
    let articlePages: MetadataRoute.Sitemap = [];
    try {
        const articles = await getArticles();
        articlePages = articles.map((article) => ({
            url: `${baseUrl}/articles/${article.slug}`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.7,
        }));
    } catch (error) {
        console.error('Failed to fetch articles for sitemap:', error);
    }
    // 動的なナレッジページ
    let knowledgePages: MetadataRoute.Sitemap = [];
    try {
        const metadata = await getKnowledgeMetadata();
        const knowledgeSlugs: string[] = [];
        metadata.categories.forEach((category) => {
            if (category.names) {
                knowledgeSlugs.push(...category.names);
            }
            if (category.subCategories) {
                category.subCategories.forEach((subCategory) => {
                    knowledgeSlugs.push(...subCategory.names);
                });
            }
        });
        knowledgePages = knowledgeSlugs.map((slug) => ({
            url: `${baseUrl}/knowledges/${slug}`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.7,
        }));
    } catch (error) {
        console.error('Failed to fetch knowledges for sitemap:', error);
    }
    return [...staticPages, ...articlePages, ...knowledgePages];
}
