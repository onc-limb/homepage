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
    // 詳細ページ用の追加フィールド
    detail?: {
        overview?: string; // プロジェクト概要（詳細）
        background?: string; // 背景・課題
        architecture?: {
            description: string; // アーキテクチャの説明
            diagram?: string; // 図のURL（あれば）
            components?: {
                name: string;
                description: string;
                technologies: string[];
            }[];
        };
        technicalPoints?: {
            title: string;
            description: string;
        }[]; // 技術的な工夫
        challenges?: {
            problem: string;
            solution: string;
        }[]; // 課題と解決策
        results?: string[]; // 成果・学び
        futureWork?: string[]; // 今後の展望
    };
}
// プロジェクトデータ
export const projects: Project[] = [
    {
        id: 'portfolio-site',
        title: 'ポートフォリオサイト',
        description: 'Next.js と Tailwind CSS で構築した個人ポートフォリオサイト',
        longDescription:
            'フルスタックエンジニアとしての技術力をアピールするためのポートフォリオサイト。毎日の技術ニュースをAIで要約する機能も搭載。',
        technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Cloudflare Pages', 'OpenAI API'],
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
        detail: {
            overview:
                'フリーランスエンジニアとしてのスキルや実績をアピールするためのポートフォリオサイト。単なる静的サイトではなく、毎日の技術ニュースを自動収集・AI要約する機能を持つ。',
            background:
                'フルスタックエンジニアとして、フロントエンドからバックエンド、インフラまで一貫して対応できることを示すために、実際に動くプロダクトとしてポートフォリオサイトを構築。',
            architecture: {
                description:
                    'Next.js の App Router を採用し、SSG（静的サイト生成）をベースとした高速なサイトを実現。Cloudflare Pages でホスティングし、エッジでの配信により低レイテンシを実現。',
                components: [
                    {
                        name: 'Frontend',
                        description: 'Next.js App Router によるReactアプリケーション',
                        technologies: ['Next.js 15', 'React 18', 'TypeScript', 'Tailwind CSS'],
                    },
                    {
                        name: 'Hosting',
                        description: 'Cloudflare Pages によるエッジ配信',
                        technologies: ['Cloudflare Pages', 'Cloudflare Workers'],
                    },
                    {
                        name: 'News Aggregation',
                        description: '技術ニュースの自動収集とAI要約',
                        technologies: ['Node.js', 'OpenAI API', 'GitHub Actions'],
                    },
                ],
            },
            technicalPoints: [
                {
                    title: 'App Router による最適化',
                    description:
                        'Next.js 15 の App Router を採用し、Server Components を活用してバンドルサイズを最小化。必要な部分のみ Client Components として実装。',
                },
                {
                    title: 'Cloudflare Pages でのデプロイ',
                    description:
                        'Vercel ではなく Cloudflare Pages を選択し、エッジでの配信とコスト最適化を実現。open-next を使用した互換性の確保。',
                },
                {
                    title: '技術ニュースの自動収集',
                    description:
                        'GitHub Actions で毎日定時に RSS フィードから技術ニュースを収集し、OpenAI API で要約を生成。Markdown ファイルとしてリポジトリにコミット。',
                },
            ],
            challenges: [
                {
                    problem: 'Cloudflare Pages での Next.js App Router の互換性',
                    solution:
                        'open-next パッケージを使用し、Cloudflare Workers 向けにビルドを最適化。wrangler.jsonc での適切な設定。',
                },
                {
                    problem: 'AI要約の品質とコスト',
                    solution:
                        'プロンプトエンジニアリングによる要約品質の向上と、適切なトークン制限によるコスト管理。',
                },
            ],
            results: [
                'ミニマルなデザインで読みやすいポートフォリオサイトを構築',
                '毎日の技術ニュース収集により、継続的な学習習慣を確立',
                'Cloudflare Pages により高速かつ低コストなホスティングを実現',
            ],
            futureWork: [
                'お問い合わせフォームの追加',
                'ダークモード/ライトモードの切り替え',
                'より詳細なプロジェクト紹介ページの充実',
            ],
        },
    },
    // 他のプロジェクトを追加してください
];
// ユーティリティ関数
export function getProjectById(id: string): Project | undefined {
    return projects.find((project) => project.id === id);
}
export function getProjectIds(): string[] {
    return projects.map((project) => project.id);
}
