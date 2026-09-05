// スキルのメタ定義と純粋関数だけを置くモジュール。
// lib/skills.ts は require.context で docs/skills 配下の全 Markdown（publish: false を含む）を
// 読み込むため、Client Component から import するとそれらがクライアントバンドルに載ってしまう。
// クライアント側で必要な型・ラベル・ソートはこちらから import する。

// ネストされたリストアイテムを表す型
export interface ListItem {
    text: string
    children: ListItem[]
}
export type SkillCategory =
    | "language" // プログラミング言語
    | "frontend" // フロントエンド
    | "framework" // バックエンド・フレームワーク
    | "compute" // コンピューティング
    | "networking" // ネットワーキング
    | "storage" // ストレージ
    | "database" // データベース
    | "integration" // 統合サービス
    | "IaC" // インフラ構成管理・IaC
    | "container" // コンテナ・オーケストレーション
    | "tools" // ツール・SaaS
    | "architecture" // 設計・アーキテクチャ
    | "methodology" // 開発手法・プロセス
    | "api" // API
    | "ai-llm" // LLM・AIエージェント
    | "ml" // 機械学習
    | "devops-sre" // DevOps・SRE
    | "testing" // テスト・品質保証
    | "security" // セキュリティ
    | "auth" // 認証・認可
export type SkillLevel = 1 | 2 | 3 | 4 | 5
export interface SkillMeta {
    name: string
    category: SkillCategory
    level: SkillLevel
    publish: boolean
}
export interface Skill extends SkillMeta {
    experience: ListItem[] // やったこと（実績）
    knowledge: ListItem[] // 知っていること（知識）
    relatedTech: string[] // 関連技術
    relatedBooks: string[] // 関連書籍
}
export const categoryLabels: Record<SkillCategory, string> = {
    language: "プログラミング言語",
    frontend: "フロントエンド",
    framework: "バックエンド・フレームワーク",
    compute: "コンピューティング",
    networking: "ネットワーキング",
    storage: "ストレージ",
    database: "データベース",
    integration: "統合サービス",
    IaC: "インフラ構成管理・IaC",
    container: "コンテナ・オーケストレーション",
    tools: "ツール・SaaS",
    architecture: "設計・アーキテクチャ",
    methodology: "開発手法・プロセス",
    api: "API",
    "ai-llm": "LLM・AIエージェント",
    ml: "機械学習",
    "devops-sre": "DevOps・SRE",
    testing: "テスト・品質保証",
    security: "セキュリティ",
    auth: "認証・認可",
}
export const levelLabels: Record<
    SkillLevel,
    { label: string; color: string; icon: string }
> = {
    1: { label: "学習中", color: "text-yellow-500", icon: "🟡" },
    2: { label: "個人利用", color: "text-orange-500", icon: "🟠" },
    3: { label: "実務経験あり", color: "text-red-500", icon: "🔴" },
    4: { label: "実務継続利用", color: "text-blue-500", icon: "🔵" },
    5: { label: "専門", color: "text-green-500", icon: "🟢" },
}
// カテゴリの表示順序
export const categoryOrder: SkillCategory[] = [
    "language",
    "frontend",
    "framework",
    "compute",
    "networking",
    "storage",
    "database",
    "integration",
    "IaC",
    "container",
    "tools",
    "architecture",
    "methodology",
    "api",
    "ai-llm",
    "ml",
    "devops-sre",
    "testing",
    "security",
    "auth",
]

// level 降順、同 level はスキル名の昇順で並べる
export function sortSkillsByLevel(skills: Skill[]): Skill[] {
    return [...skills].sort((a, b) => b.level - a.level || a.name.localeCompare(b.name))
}
