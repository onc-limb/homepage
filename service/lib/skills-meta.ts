// スキルのメタ定義と純粋関数だけを置くモジュール。
// lib/skills.ts は require.context で docs/skills 配下の全 Markdown（publish: false を含む）を
// 読み込むため、Client Component から import するとそれらがクライアントバンドルに載ってしまう。
// クライアント側で必要な型・ラベル・ソートはこちらから import する。

import { findGroup, toVirtualPath, type FloorGroup, type FloorId } from "./building/floors"

// ネストされたリストアイテムを表す型
export interface ListItem {
    text: string
    children: ListItem[]
}
// ### の行で始まるまとまり（タイトルと、その下の箇条書き）
export interface ListSubsection {
    title: string
    items: ListItem[]
}
// md の 1 つの節。items は最初の ### より前の箇条書き、subsections は ### ごとのまとまり
export interface ListSection {
    items: ListItem[]
    subsections: ListSubsection[]
}
// md の本文にある 4 つの節の見出し。解析と表示の両方がここから引く
export const SKILL_SECTION_TITLES = {
    experience: "経験",
    knowledge: "知識",
    relatedTech: "関連技術",
    relatedBooks: "関連書籍",
} as const
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
// スキルを使った文脈。work = 業務で使った、study = 自己学習
export type SkillContext = "work" | "study"
export interface SkillMeta {
    name: string
    category: SkillCategory
    level: SkillLevel
    publish: boolean
    context?: SkillContext
}
export interface Skill extends SkillMeta {
    slug: string // md のファイル名（拡張子なし）。仮想パスと URL に使う
    experience: ListSection // やったこと（実績）
    knowledge: ListSection // 知っていること（知識）
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
// 地図の部屋のラベルに出す短い名前
export const categoryShortLabels: Record<SkillCategory, string> = {
    language: "言語",
    frontend: "フロントエンド",
    framework: "バックエンド",
    compute: "コンピューティング",
    networking: "ネットワーク",
    storage: "ストレージ",
    database: "データベース",
    integration: "統合サービス",
    IaC: "IaC",
    container: "コンテナ",
    tools: "ツール",
    architecture: "設計",
    methodology: "開発手法",
    api: "API",
    "ai-llm": "AI・LLM",
    ml: "機械学習",
    "devops-sre": "DevOps",
    testing: "テスト",
    security: "セキュリティ",
    auth: "認証",
}
export const levelLabels: Record<SkillLevel, { label: string }> = {
    1: { label: "学習中" },
    2: { label: "個人利用" },
    3: { label: "実務経験あり" },
    4: { label: "実務継続利用" },
    5: { label: "専門" },
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

export type SkillFloor = "2f" | "b1"

// 業務のスキルは 2F、自己学習は B1。context があればその値で、無ければ level で決める（3 以上 = 業務）
export function getSkillFloor(skill: Pick<SkillMeta, "context" | "level">): SkillFloor {
    if (skill.context) return skill.context === "work" ? "2f" : "b1"
    return skill.level >= 3 ? "2f" : "b1"
}

// level を 5 段の印にする（filled = ●、empty = ○）
const GAUGE_STEPS = 5

export function levelGauge(level: SkillLevel): { filled: string; empty: string } {
    return {
        filled: "●".repeat(level),
        empty: "○".repeat(GAUGE_STEPS - level),
    }
}

export interface SkillCategoryGroup {
    category: SkillCategory
    skills: Skill[]
}

// 指定した階のスキルだけを、categoryOrder の順に分野でまとめる（0 件の分野は返さない）
export function groupSkillsByCategory(skills: Skill[], floor: FloorId): SkillCategoryGroup[] {
    const onFloor = skills.filter((skill) => getSkillFloor(skill) === floor)
    return categoryOrder
        .map((category) => ({
            category,
            skills: sortSkillsByLevel(onFloor.filter((skill) => skill.category === category)),
        }))
        .filter((group) => group.skills.length > 0)
}

// スキルが属する分類。業務は 2F の skills、自己学習は B1 の studies
export function skillGroup(skill: Pick<SkillMeta, "context" | "level">): FloorGroup {
    return findGroup(getSkillFloor(skill) === "2f" ? "skills" : "studies")
}

// 詳細ページの URL（/2f/skills/<slug>、/b1/studies/<slug>）
export function skillHref(skill: Pick<Skill, "context" | "level" | "slug">): string {
    return `${skillGroup(skill).url}/${skill.slug}`
}

// 詳細ページのコマンドと地図に使う仮想パス（~/2f/skills/<category>/<slug>.md）
export function skillVirtualPath(skill: Pick<Skill, "context" | "level" | "slug" | "category">): string {
    return `${toVirtualPath(skillGroup(skill).url)}/${skill.category}/${skill.slug}.md`
}

// 一覧の表の行の並び（分野の順 → level の高い順 → 名前順）で、指定した階のスキルを返す
export function listSkillsOnFloor(skills: Skill[], floor: FloorId): Skill[] {
    return groupSkillsByCategory(skills, floor).flatMap((group) => group.skills)
}

export type SkillPageResolution =
    | { kind: "found"; skill: Skill; prev?: Skill; next?: Skill }
    | { kind: "moved"; href: string }
    | { kind: "missing" }

// 詳細ページの [name]（md のファイル名）を解決する。skills は公開済みのスキルだけを渡す
export function resolveSkillPage(skills: Skill[], group: FloorGroup, slug: string): SkillPageResolution {
    const skill = skills.find((candidate) => candidate.slug === slug)
    if (!skill) return { kind: "missing" }
    if (skillGroup(skill).slug !== group.slug) return { kind: "moved", href: skillHref(skill) }
    const onFloor = listSkillsOnFloor(skills, group.floor)
    const index = onFloor.indexOf(skill)
    return { kind: "found", skill, prev: onFloor[index - 1], next: onFloor[index + 1] }
}
