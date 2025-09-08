import matter from 'gray-matter';
// Types for knowledge metadata structure
export type KnowledgeFile = {
    name: string;
    path: string;
};
export type SubCategory = {
    category: string;
    point: number;
    names: string[];
};
export type Category = {
    category: string;
    point: number;
    names?: string[];
    subCategories?: SubCategory[];
};
export type KnowledgeMetadata = {
    categories: Category[];
    totalFiles: number;
    lastUpdated: string;
};
type File = {
    name: string;
};
export const getKnowledgeMetadata = async (): Promise<KnowledgeMetadata> => {
    const repo = 'onc-limb/knowledge-hub';
    const apiUrl = `https://api.github.com/repos/${repo}/contents/knowledges/meta.json`;
    const res = await fetch(apiUrl);
    const json = await res.json();
    const metadataContent = Buffer.from(json.content, 'base64').toString('utf-8');
    return JSON.parse(metadataContent) as KnowledgeMetadata;
};
export const getKnowledges = async () => {
    const metadata = await getKnowledgeMetadata();
    return metadata;
};
// Helper function to get file path from category and filename
export const getKnowledgeFilePath = (category: string, subcategory: string | null, filename: string): string => {
    if (subcategory) {
        return `knowledges/${category}/${subcategory}/${filename}`;
    } else {
        return `knowledges/${category}/${filename}`;
    }
};
export const getKnowledge = async (slug: string) => {
    const repo = 'onc-limb/knowledge-hub';
    // The slug might contain directory separators, so we need to handle it properly
    const filePath = slug.includes('/') ? slug : `knowledges/${slug}`;
    const apiUrl = `https://api.github.com/repos/${repo}/contents/${filePath}.md`;
    const res = await fetch(apiUrl);
    const json = await res.json();
    const knowledge = Buffer.from(json.content, 'base64').toString('utf-8');
    const { content } = matter(knowledge);
    return content;
};
