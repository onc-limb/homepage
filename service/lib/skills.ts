import matter from "gray-matter"
import { extractFlatListItems } from "./markdown-utils"
// @ts-expect-error raw-loader returns string
import typescriptMd from "../docs/skills/language/typescript.md"
// @ts-expect-error raw-loader returns string
import pythonMd from "../docs/skills/language/python.md"
// @ts-expect-error raw-loader returns string
import javascriptMd from "../docs/skills/language/javascript.md"
// @ts-expect-error raw-loader returns string
import reactMd from "../docs/skills/framework/react.md"
// @ts-expect-error raw-loader returns string
import nextjsMd from "../docs/skills/framework/nextjs.md"
// @ts-expect-error raw-loader returns string
import tailwindcssMd from "../docs/skills/framework/tailwindcss.md"
// @ts-expect-error raw-loader returns string
import awsEcsMd from "../docs/skills/compute/aws-ecs.md"
// @ts-expect-error raw-loader returns string
import awsElbMd from "../docs/skills/networking/aws-elb.md"
// @ts-expect-error raw-loader returns string
import cloudflareMd from "../docs/skills/compute/cloudflare.md"
// @ts-expect-error raw-loader returns string
import dockerMd from "../docs/skills/container/docker.md"
// @ts-expect-error raw-loader returns string
import gitGithubMd from "../docs/skills/tools/git-github.md"
// @ts-expect-error raw-loader returns string
import cleanArchitectureMd from "../docs/skills/architecture/clean-architecture.md"
// @ts-expect-error raw-loader returns string
import restApiMd from "../docs/skills/api/rest-api.md"
// @ts-expect-error raw-loader returns string
import graphqlMd from "../docs/skills/api/graphql.md"
// @ts-expect-error raw-loader returns string
import httpHttpsMd from "../docs/skills/networking/http-https.md"
// @ts-expect-error raw-loader returns string
import llmGptMd from "../docs/skills/ai-ml/llm.md"
// @ts-expect-error raw-loader returns string
import postgresqlMd from "../docs/skills/database/postgresql.md"
// @ts-expect-error raw-loader returns string
import prismaMd from "../docs/skills/database/prisma.md"
// @ts-expect-error raw-loader returns string
import gormMd from "../docs/skills/database/gorm.md"
// @ts-expect-error raw-loader returns string
import awsS3Md from "../docs/skills/storage/aws-s3.md"
// @ts-expect-error raw-loader returns string
import r2Md from "../docs/skills/storage/r2.md"
// @ts-expect-error raw-loader returns string
import minioMd from "../docs/skills/storage/minio.md"
// @ts-expect-error raw-loader returns string
import bigqueryMd from "../docs/skills/storage/bigquery.md"
// @ts-expect-error raw-loader returns string
import html5Md from "../docs/skills/markup-style/html5.md"
// @ts-expect-error raw-loader returns string
import awsSnsMd from "../docs/skills/integration/aws-sns.md"
// @ts-expect-error raw-loader returns string
import awsSqsMd from "../docs/skills/integration/aws-sqs.md"
// @ts-expect-error raw-loader returns string
import awsEventbridgeMd from "../docs/skills/integration/aws-eventbridge.md"
// @ts-expect-error raw-loader returns string
import awsStepfunctionsMd from "../docs/skills/integration/aws-stepfunctions.md"
// @ts-expect-error raw-loader returns string
import terraformMd from "../docs/skills/IaC/terraform.md"
// @ts-expect-error raw-loader returns string
import awsCdkMd from "../docs/skills/IaC/aws-cdk.md"
// @ts-expect-error raw-loader returns string
import scrumMd from "../docs/skills/methodology/scrum.md"
// @ts-expect-error raw-loader returns string
import userStoryMd from "../docs/skills/methodology/user-story.md"
// @ts-expect-error raw-loader returns string
import eventStormingMd from "../docs/skills/methodology/event-storming.md"
// @ts-expect-error raw-loader returns string
import awsSagemakerMd from "../docs/skills/ai-ml/aws-sagemaker.md"
// @ts-expect-error raw-loader returns string
import githubActionsMd from "../docs/skills/devops-sre/github-actions.md"
// @ts-expect-error raw-loader returns string
import awsCloudwatchMd from "../docs/skills/devops-sre/aws-cloudwatch.md"
// @ts-expect-error raw-loader returns string
import jestMd from "../docs/skills/testing/jest.md"
// @ts-expect-error raw-loader returns string
import playwrightMd from "../docs/skills/testing/playwright.md"
// @ts-expect-error raw-loader returns string
import firebaseAuthMd from "../docs/skills/auth/firebase-authentication.md"
// @ts-expect-error raw-loader returns string
import supabaseAuthMd from "../docs/skills/auth/supabase-authentication.md"
export type SkillCategory =
    | "language" // プログラミング言語
    | "framework" // フレームワーク・ライブラリ
    | "markup-style" // マークアップ・スタイル
    | "compute" // コンピューティング
    | "networking" // ネットワーキング
    | "storage" // ストレージ
    | "database" // データベース
    | "integration" // 統合サービス
    | "IaC" // インフラ構成管理・IaC
    | "container" // コンテナ・オーケストレーション
    | "tools" // ツール・SaaS
    | "architecture" // アーキテクチャ
    | "methodology" // 開発手法・プロセス
    | "api" // API
    | "ai-ml" // AI・機械学習
    | "devops-sre" // DevOps・SRE
    | "testing" // テスト・品質保証
    | "security" // セキュリティ
    | "auth" // 認証・認可
export type SkillLevel =
    | "production" // 🟢 実務で使える
    | "basic" // 🟡 基礎は理解
    | "learning" // 🔵 学習中
export interface SkillMeta {
    name: string
    category: SkillCategory
    level: SkillLevel
}
export interface Skill extends SkillMeta {
    experience: ListItem[] // やったこと（実績）
    knowledge: ListItem[] // 知っていること（知識）
    relatedTech: string[] // 関連技術
    relatedBooks: string[] // 関連書籍
}
export const categoryLabels: Record<SkillCategory, string> = {
    language: "プログラミング言語",
    framework: "フレームワーク・ライブラリ",
    "markup-style": "マークアップ・スタイル",
    compute: "コンピューティング",
    networking: "ネットワーキング",
    storage: "ストレージ",
    database: "データベース",
    integration: "統合サービス",
    IaC: "インフラ構成管理・IaC",
    container: "コンテナ・オーケストレーション",
    tools: "ツール・SaaS",
    architecture: "アーキテクチャ",
    methodology: "開発手法・プロセス",
    api: "API",
    "ai-ml": "AI・機械学習",
    "devops-sre": "DevOps・SRE",
    testing: "テスト・品質保証",
    security: "セキュリティ",
    auth: "認証・認可",
}
export const levelLabels: Record<
    SkillLevel,
    { label: string; color: string; icon: string }
> = {
    production: { label: "実務で使える", color: "text-green-500", icon: "🟢" },
    basic: { label: "基礎は理解", color: "text-yellow-500", icon: "🟡" },
    learning: { label: "学習中", color: "text-blue-500", icon: "🔵" },
}
// カテゴリの表示順序
export const categoryOrder: SkillCategory[] = [
    "language",
    "framework",
    "markup-style",
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
    "ai-ml",
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
// すべてのスキル Markdown
const skillMarkdowns: string[] = [
    typescriptMd,
    pythonMd,
    javascriptMd,
    reactMd,
    nextjsMd,
    tailwindcssMd,
    awsEcsMd,
    awsElbMd,
    cloudflareMd,
    dockerMd,
    gitGithubMd,
    cleanArchitectureMd,
    restApiMd,
    graphqlMd,
    httpHttpsMd,
    llmGptMd,
    postgresqlMd,
    prismaMd,
    gormMd,
    awsS3Md,
    r2Md,
    minioMd,
    bigqueryMd,
    html5Md,
    awsSnsMd,
    awsSqsMd,
    awsEventbridgeMd,
    awsStepfunctionsMd,
    terraformMd,
    awsCdkMd,
    scrumMd,
    userStoryMd,
    eventStormingMd,
    awsSagemakerMd,
    githubActionsMd,
    awsCloudwatchMd,
    jestMd,
    playwrightMd,
    firebaseAuthMd,
    supabaseAuthMd,
]
function parseSkillMarkdown(rawContent: string): Skill {
    const { data, content } = matter(rawContent)
    const meta = data as SkillMeta
    return {
        name: meta.name,
        category: meta.category,
        level: meta.level,
        experience: extractListItems(content, "経験"),
        knowledge: extractListItems(content, "知識"),
        relatedTech: extractFlatListItems(content, "関連技術"),
        relatedBooks: extractFlatListItems(content, "関連書籍"),
    }
}
// すべてのスキルを取得
export function getSkills(): Skill[] {
    return skillMarkdowns.map(parseSkillMarkdown)
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
