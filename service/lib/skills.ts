import matter from 'gray-matter';
import { extractFlatListItems } from './markdown-utils';
// @ts-expect-error raw-loader returns string
import typescriptMd from '../docs/skills/typescript.md';
// @ts-expect-error raw-loader returns string
import pythonMd from '../docs/skills/python.md';
// @ts-expect-error raw-loader returns string
import javascriptMd from '../docs/skills/javascript.md';
// @ts-expect-error raw-loader returns string
import reactMd from '../docs/skills/react.md';
// @ts-expect-error raw-loader returns string
import nextjsMd from '../docs/skills/nextjs.md';
// @ts-expect-error raw-loader returns string
import tailwindcssMd from '../docs/skills/tailwindcss.md';
// @ts-expect-error raw-loader returns string
import awsMd from '../docs/skills/aws.md';
// @ts-expect-error raw-loader returns string
import cloudflareMd from '../docs/skills/cloudflare.md';
// @ts-expect-error raw-loader returns string
import dockerMd from '../docs/skills/docker.md';
// @ts-expect-error raw-loader returns string
import gitGithubMd from '../docs/skills/git-github.md';
// @ts-expect-error raw-loader returns string
import cleanArchitectureMd from '../docs/skills/clean-architecture.md';
// @ts-expect-error raw-loader returns string
import restApiMd from '../docs/skills/rest-api.md';
// @ts-expect-error raw-loader returns string
import graphqlMd from '../docs/skills/graphql.md';
// @ts-expect-error raw-loader returns string
import httpHttpsMd from '../docs/skills/http-https.md';
// @ts-expect-error raw-loader returns string
import llmGptMd from '../docs/skills/llm-gpt.md';
export type SkillCategory =
    | 'language'        // プログラミング言語
    | 'framework'       // フレームワーク・ライブラリ
    | 'infrastructure'  // インフラ・クラウドプラットフォーム・サービス
    | 'tools'           // ツール・SaaS
    | 'architecture'    // アーキテクチャ
    | 'api'             // API
    | 'cs-protocol'     // CS・プロトコル・低レイヤー
    | 'ai-ml';          // AI・機械学習
export type SkillLevel =
    | 'production'  // 🟢 実務で使える
    | 'basic'       // 🟡 基礎は理解
    | 'learning';   // 🔵 学習中
export interface SkillMeta {
    name: string;
    category: SkillCategory;
    level: SkillLevel;
}
export interface Skill extends SkillMeta {
    experience: ListItem[];    // やったこと（実績）
    knowledge: ListItem[];     // 知っていること（知識）
    relatedTech: string[];   // 関連技術
    relatedBooks: string[];  // 関連書籍
}
export const categoryLabels: Record<SkillCategory, string> = {
    language: 'プログラミング言語',
    framework: 'フレームワーク・ライブラリ',
    infrastructure: 'インフラ・クラウドプラットフォーム・サービス',
    tools: 'ツール・SaaS',
    architecture: 'アーキテクチャ',
    api: 'API',
    'cs-protocol': 'CS・プロトコル・低レイヤー',
    'ai-ml': 'AI・機械学習',
};
export const levelLabels: Record<SkillLevel, { label: string; color: string; icon: string }> = {
    production: { label: '実務で使える', color: 'text-green-500', icon: '🟢' },
    basic: { label: '基礎は理解', color: 'text-yellow-500', icon: '🟡' },
    learning: { label: '学習中', color: 'text-blue-500', icon: '🔵' },
};
// カテゴリの表示順序
export const categoryOrder: SkillCategory[] = [
    'language',
    'framework',
    'infrastructure',
    'tools',
    'architecture',
    'api',
    'cs-protocol',
    'ai-ml',
];
// ネストされたリストアイテムを表す型
export interface ListItem {
    text: string;
    children: ListItem[];
}
// Markdown から経験・知識を抽出するヘルパー関数（階層構造対応）
function extractListItems(content: string, sectionTitle: string): ListItem[] {
    const regex = new RegExp(`## ${sectionTitle}\\s*\\n([\\s\\S]*?)(?=\\n## |$)`, 'i');
    const match = content.match(regex);
    if (!match) return [];
    const sectionContent = match[1];
    const lines = sectionContent.split('\n');
    const result: ListItem[] = [];
    // サブセクション（### で始まる）とリストアイテムを解析
    let currentSubsection: ListItem | null = null;
    const stack: { item: ListItem; indent: number }[] = [];
    for (const line of lines) {
        // サブセクション（### xxx）
        const subsectionMatch = line.match(/^###\s+(.+)$/);
        if (subsectionMatch) {
            currentSubsection = { text: subsectionMatch[1], children: [] };
            result.push(currentSubsection);
            stack.length = 0; // スタックをリセット
            continue;
        }
        // リストアイテム（- で始まる行、インデント考慮）
        const listMatch = line.match(/^(\s*)-\s+(.+)$/);
        if (listMatch) {
            const indent = listMatch[1].length;
            const text = listMatch[2];
            const newItem: ListItem = { text, children: [] };
            // インデントが0の場合はトップレベル
            if (indent === 0) {
                if (currentSubsection) {
                    currentSubsection.children.push(newItem);
                } else {
                    result.push(newItem);
                }
                stack.length = 0;
                stack.push({ item: newItem, indent });
            } else {
                // インデントがある場合は親を探す
                while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
                    stack.pop();
                }
                if (stack.length > 0) {
                    stack[stack.length - 1].item.children.push(newItem);
                } else if (currentSubsection) {
                    currentSubsection.children.push(newItem);
                } else {
                    result.push(newItem);
                }
                stack.push({ item: newItem, indent });
            }
        }
    }
    return result;
}
// すべてのスキル Markdown
const skillMarkdowns: string[] = [
    typescriptMd,
    // pythonMd,
    javascriptMd,
    // reactMd,
    // nextjsMd,
    // tailwindcssMd,
    // awsMd,
    // cloudflareMd,
    // dockerMd,
    // gitGithubMd,
    // cleanArchitectureMd,
    // restApiMd,
    // graphqlMd,
    // httpHttpsMd,
    // llmGptMd,
];
function parseSkillMarkdown(rawContent: string): Skill {
    const { data, content } = matter(rawContent);
    const meta = data as SkillMeta;
    return {
        name: meta.name,
        category: meta.category,
        level: meta.level,
        experience: extractListItems(content, 'やったこと'),
        knowledge: extractListItems(content, '知っていること'),
        relatedTech: extractFlatListItems(content, '関連技術'),
        relatedBooks: extractFlatListItems(content, '関連書籍'),
    };
}
// すべてのスキルを取得
export function getSkills(): Skill[] {
    return skillMarkdowns.map(parseSkillMarkdown);
}
// カテゴリ別にグループ化されたスキルを取得
export function getSkillsByCategory(): Record<SkillCategory, Skill[]> {
    const skills = getSkills();
    return categoryOrder.reduce(
        (acc, category) => {
            acc[category] = skills.filter((skill) => skill.category === category);
            return acc;
        },
        {} as Record<SkillCategory, Skill[]>
    );
}
