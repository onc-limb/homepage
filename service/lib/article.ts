import matter from 'gray-matter';

type ArticleMeta = {
    name: string;
    title: string;
    slug: string;
    topics: string[];
};

export const getArticles = async () => {
    const repo = 'onc-limb/knowledge-hub';
    const dir = 'articles';
    const apiUrl = `https://api.github.com/repos/${repo}/contents/${dir}`;

    const res = await fetch(apiUrl);
    const files = await res.json();

    const articles: ArticleMeta[] = [];

    for (const file of files) {
        if (file.name.endsWith('.md')) {
            const raw = await fetch(file.download_url).then((r) => r.text());
            const { data } = matter(raw);

            articles.push({
                name: file.name,
                title: data.title,
                slug: data.slug || file.name.replace('.md', ''),
                topics: data.topics,
            });
        }
    }
    console.log('data: ', articles);

    return articles;
};
