import matter from "gray-matter"
import { extractFlatListItems } from "./markdown-utils"

// docs/skills配下のすべての.mdファイルを動的にimport
// @ts-expect-error require.context is webpack specific
const requireContext = require.context("../docs/skills", true, /\.md$/)
const skillMarkdowns: string[] = requireContext.keys().map((key: string) => {
    const mdModule = requireContext(key)
    // raw-loaderはデフォルトエクスポートとして文字列を返す
    return typeof mdModule === "string" ? mdModule : mdModule.default || mdModule
})
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
// ネストされたリストアイテムを表す型
export interface ListItem {
    text: string
    children: ListItem[]
}
// Markdown から経験・知識を抽出するヘルパー関数（階層構造対応）
function extractListItems(content: string, sectionTitle: string): ListItem[] {
    const regex = new RegExp(`## ${sectionTitle}\\s*\\n([\\s\\S]*?)(?=\\n## |$)`, "i")
    const match = content.match(regex)
    if (!match) return []
    const sectionContent = match[1]
    const lines = sectionContent.split("\n")
    const result: ListItem[] = []
    // サブセクション（### で始まる）とリストアイテムを解析
    let currentSubsection: ListItem | null = null
    const stack: { item: ListItem; indent: number }[] = []
    for (const line of lines) {
        // サブセクション（### xxx）
        const subsectionMatch = line.match(/^###\s+(.+)$/)
        if (subsectionMatch) {
            currentSubsection = { text: subsectionMatch[1], children: [] }
            result.push(currentSubsection)
            stack.length = 0 // スタックをリセット
            continue
        }
        // リストアイテム（- で始まる行、インデント考慮）
        const listMatch = line.match(/^(\s*)-\s+(.+)$/)
        if (listMatch) {
            const indent = listMatch[1].length
            const text = listMatch[2]
            const newItem: ListItem = { text, children: [] }
            // インデントが0の場合はトップレベル
            if (indent === 0) {
                if (currentSubsection) {
                    currentSubsection.children.push(newItem)
                } else {
                    result.push(newItem)
                }
                stack.length = 0
                stack.push({ item: newItem, indent })
            } else {
                // インデントがある場合は親を探す
                while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
                    stack.pop()
                }
                if (stack.length > 0) {
                    stack[stack.length - 1].item.children.push(newItem)
                } else if (currentSubsection) {
                    currentSubsection.children.push(newItem)
                } else {
                    result.push(newItem)
                }
                stack.push({ item: newItem, indent })
            }
        }
    }
    return result
}

function parseSkillMarkdown(rawContent: string): Skill {
    const { data, content } = matter(rawContent)
    const meta = data as SkillMeta
    return {
        name: meta.name,
        category: meta.category,
        level: meta.level,
        publish: meta.publish,
        experience: extractListItems(content, "経験"),
        knowledge: extractListItems(content, "知識"),
        relatedTech: extractFlatListItems(content, "関連技術"),
        relatedBooks: extractFlatListItems(content, "関連書籍"),
    }
}
// すべてのスキルを取得
export function getSkills(): Skill[] {
    const allSkills = skillMarkdowns
        .map(parseSkillMarkdown)
        .filter((skill) => skill.publish)

    // スキル名でユニーク化
    // Note: Webpackの require.context() がビルド時に Server/Client 両方のバンドルで評価され、
    // skillMarkdowns 配列に同じファイルが複数回含まれる場合があるため、
    // スキル名をキーとして重複を除去する
    const uniqueSkills = Array.from(
        new Map(allSkills.map((skill) => [skill.name, skill])).values()
    )

    return uniqueSkills
}
// カテゴリ別にグループ化されたスキルを取得
export function getSkillsByCategory(): Record<SkillCategory, Skill[]> {
    const skills = getSkills()
    return categoryOrder.reduce(
        (acc, category) => {
            acc[category] = skills.filter((skill) => skill.category === category)
            return acc
        },
        {} as Record<SkillCategory, Skill[]>
    )
}

/**
 * docs/design/skill.html の radar chart に必要な 8 軸定義。
 */
export const RADAR_AXIS_KEYS = [
    "backend",
    "frontend",
    "infra",
    "arch",
    "ai",
    "devops",
    "low",
    "sec",
] as const

export type RadarAxisKey = (typeof RADAR_AXIS_KEYS)[number]

export interface RadarAxis {
    key: RadarAxisKey
    label: string
    value: number
}

const RADAR_AXIS_LABELS: Record<RadarAxisKey, string> = {
    backend: "Backend",
    frontend: "Frontend",
    infra: "Infra/Cloud",
    arch: "Architecture",
    ai: "AI/MLOps",
    devops: "DevOps",
    low: "Low-level",
    sec: "Security",
}

const AXIS_TO_CATEGORIES: Record<RadarAxisKey, SkillCategory[]> = {
    backend: ["framework", "api", "database", "integration"],
    frontend: ["frontend"],
    infra: ["compute", "networking", "storage", "IaC", "container"],
    arch: ["architecture"],
    ai: ["ai-llm", "ml"],
    devops: ["devops-sre", "tools", "testing"],
    low: ["language"],
    sec: ["security", "auth"],
}

/**
 * 各軸に紐付くカテゴリの level を平均し 0..5 で返す。
 * 寄与スキルが 0 件の軸は 0 を返す。
 */
export function getRadarAxes(skills: Skill[]): RadarAxis[] {
    return RADAR_AXIS_KEYS.map((key) => {
        const categories = AXIS_TO_CATEGORIES[key]
        const matched = skills.filter((s) => categories.includes(s.category))
        const value =
            matched.length === 0
                ? 0
                : clamp(
                      matched.reduce((sum, s) => sum + s.level, 0) / matched.length,
                      0,
                      5,
                  )
        return { key, label: RADAR_AXIS_LABELS[key], value }
    })
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value))
}
