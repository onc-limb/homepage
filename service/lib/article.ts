import matter from 'gray-matter';
type ArticleMeta = {
    title: string;
    slug: string;
    topics: string[];
};
type Article = {
    data: ArticleMeta;
    content: string;
};
export const getArticles = async () => {
    const repo = 'onc-limb/knowledge-hub';
    const dir = 'articles';
    const apiUrl = `https://api.github.com/repos/${repo}/contents/${dir}`;
    const res = await fetch(apiUrl, {
        headers: {
            'User-Agent': 'onc-limb-homepage',
        },
    });
    const files = await res.json();
    const articles: ArticleMeta[] = [];
    for (const file of files) {
        if (file.name.endsWith('.md')) {
            const raw = await fetch(file.download_url, {
                headers: {
                    'User-Agent': 'onc-limb-homepage',
                },
            }).then((r) => r.text());
            const { data } = matter(raw);
            articles.push({
                title: data.title,
                slug: file.name.replace('.md', ''),
                topics: data.topics,
            });
        }
    }
    return articles;
};
export const getArticle = async (slug: string) => {
    const repo = 'onc-limb/knowledge-hub';
    const dir = 'articles';
    const apiUrl = `https://api.github.com/repos/${repo}/contents/${dir}/${slug}.md`;
    const res = await fetch(apiUrl, {
        headers: {
            'User-Agent': 'onc-limb-homepage',
        },
    });
    const json = await res.json();
    const decoded = Buffer.from(json.content, 'base64').toString('utf-8');
    const file = matter(decoded);
    const article = {
        data: {
            title: file.data.title,
            slug: slug,
            topics: file.data.topics,
        },
        content: file.content,
    };
    return article as Article;
};
