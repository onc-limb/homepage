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
export interface Skill {
    name: string;
    category: SkillCategory;
    level: SkillLevel;
    experience: string[];   // やったこと（実績）
    knowledge: string[];    // 知っていること（知識）
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
// スキルデータ（後で内容を充実させてください）
export const skills: Skill[] = [
    // プログラミング言語
    {
        name: 'TypeScript',
        category: 'language',
        level: 'production',
        experience: [
            'Next.js でのWebアプリケーション開発',
            '型安全なAPI設計と実装',
        ],
        knowledge: [
            'ジェネリクス、ユーティリティ型の活用',
            '型ガード、discriminated union',
        ],
    },
    {
        name: 'Python',
        category: 'language',
        level: 'production',
        experience: [
            'バックエンドAPI開発',
            'データ処理スクリプト作成',
        ],
        knowledge: [
            '型ヒントを活用した開発',
            '非同期処理（asyncio）',
        ],
    },
    {
        name: 'JavaScript',
        category: 'language',
        level: 'production',
        experience: [
            'フロントエンド開発全般',
        ],
        knowledge: [
            'ES6+の機能',
            'Node.js ランタイム',
        ],
    },
    // フレームワーク・ライブラリ
    {
        name: 'React',
        category: 'framework',
        level: 'production',
        experience: [
            'SPAの設計・開発',
            'コンポーネント設計',
        ],
        knowledge: [
            'Hooks API',
            'Context API',
            'パフォーマンス最適化',
        ],
    },
    {
        name: 'Next.js',
        category: 'framework',
        level: 'production',
        experience: [
            'App Router を使った SSR/SSG',
            'このポートフォリオサイトの開発',
        ],
        knowledge: [
            'Server Components',
            'ISR（Incremental Static Regeneration）',
        ],
    },
    {
        name: 'Tailwind CSS',
        category: 'framework',
        level: 'production',
        experience: [
            'レスポンシブデザインの実装',
            'デザインシステムの構築',
        ],
        knowledge: [
            'ユーティリティファーストCSS',
            'カスタムテーマ設定',
        ],
    },
    // インフラ・クラウドプラットフォーム・サービス
    {
        name: 'AWS',
        category: 'infrastructure',
        level: 'production',
        experience: [
            'EC2, ECS, Lambda でのアプリケーション運用',
            'RDS, DynamoDB でのデータベース運用',
        ],
        knowledge: [
            'VPC設計、セキュリティグループ',
            'IAM ポリシー設計',
            'CloudWatch によるモニタリング',
        ],
    },
    {
        name: 'Cloudflare',
        category: 'infrastructure',
        level: 'production',
        experience: [
            'Cloudflare Pages でのデプロイ',
            'Workers でのエッジ処理',
        ],
        knowledge: [
            'CDN設定',
            'DNS管理',
        ],
    },
    {
        name: 'Docker',
        category: 'infrastructure',
        level: 'production',
        experience: [
            '開発環境のコンテナ化',
            'Docker Compose での複数サービス管理',
        ],
        knowledge: [
            'Dockerfile の最適化',
            'マルチステージビルド',
        ],
    },
    // ツール・SaaS
    {
        name: 'Git / GitHub',
        category: 'tools',
        level: 'production',
        experience: [
            'チーム開発でのバージョン管理',
            'GitHub Actions でのCI/CD構築',
        ],
        knowledge: [
            'ブランチ戦略（Git Flow, GitHub Flow）',
            'コードレビュー',
        ],
    },
    // アーキテクチャ
    {
        name: 'クリーンアーキテクチャ',
        category: 'architecture',
        level: 'basic',
        experience: [
            'レイヤード設計の実践',
        ],
        knowledge: [
            '依存性逆転の原則',
            'ドメイン駆動設計の基礎',
        ],
    },
    // API
    {
        name: 'REST API',
        category: 'api',
        level: 'production',
        experience: [
            'RESTful API の設計・実装',
        ],
        knowledge: [
            'OpenAPI / Swagger',
            'HTTPメソッドとステータスコード',
        ],
    },
    {
        name: 'GraphQL',
        category: 'api',
        level: 'basic',
        experience: [
            'GraphQL クライアントの実装',
        ],
        knowledge: [
            'Query, Mutation, Subscription',
            'スキーマ設計',
        ],
    },
    // CS・プロトコル・低レイヤー
    {
        name: 'HTTP/HTTPS',
        category: 'cs-protocol',
        level: 'basic',
        experience: [
            'Web開発での日常的な使用',
        ],
        knowledge: [
            'HTTPヘッダー、Cookie、セッション',
            'TLS/SSL の基礎',
        ],
    },
    // AI・機械学習
    {
        name: 'LLM / GPT',
        category: 'ai-ml',
        level: 'production',
        experience: [
            'OpenAI API を使ったアプリケーション開発',
            'プロンプトエンジニアリング',
        ],
        knowledge: [
            'トークン、コンテキストウィンドウ',
            'RAG（Retrieval-Augmented Generation）',
        ],
    },
];
