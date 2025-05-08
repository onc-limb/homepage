import matter from 'gray-matter';
type File = {
    name: string;
};

export const getKnowledges = async () => {
    const repo = 'onc-limb/knowledge-hub';
    const dir = 'knowledges';
    const apiUrl = `https://api.github.com/repos/${repo}/contents/${dir}`;

    const res = await fetch(apiUrl);
    const files = (await res.json()) as File[];

    const knowledges = files.map((file) => file.name.replace('.md', ''));

    return knowledges;
};

export const getKnowledge = async (slug: string) => {
    const repo = 'onc-limb/knowledge-hub';
    const dir = 'knowledges';
    const apiUrl = `https://api.github.com/repos/${repo}/contents/${dir}/${slug}.md`;

    const res = await fetch(apiUrl);
    const json = await res.json();
    const knowledge = Buffer.from(json.content, 'base64').toString('utf-8');
    const { content } = matter(knowledge);

    return content;
};
