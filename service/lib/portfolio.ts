export interface Project {
    id: string;
    title: string;
    description: string;
    longDescription?: string;
    technologies: string[];
    role: string;
    period: string;
    highlights: string[];
    links?: {
        github?: string;
        demo?: string;
        article?: string;
    };
    image?: string;
    category: 'personal' | 'work';
}
// プロジェクトデータ（後で内容を充実させてください）
export const projects: Project[] = [
    {
        id: 'portfolio-site',
        title: 'ポートフォリオサイト',
        description: 'Next.js と Tailwind CSS で構築した個人ポートフォリオサイト',
        longDescription:
            'フルスタックエンジニアとしての技術力をアピールするためのポートフォリオサイト。毎日の技術ニュースをAIで要約する機能も搭載。',
        technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Cloudflare Pages'],
        role: '設計・開発・運用',
        period: '2024年〜',
        highlights: [
            'App Router を使った SSG/ISR の実装',
            'Cloudflare Pages へのデプロイ',
            '技術ニュースのAI要約機能',
        ],
        links: {
            github: 'https://github.com/onc-limb/homepage',
        },
        category: 'personal',
    },
    // 他のプロジェクトを追加してください
];
