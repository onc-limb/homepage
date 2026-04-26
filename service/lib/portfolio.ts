import matter from "gray-matter"
import { extractFlatListItems, extractSection } from "./markdown-utils"
// @ts-expect-error raw-loader returns string
import portfolioSiteMd from "../docs/portfolio/portfolio-site.md"
export interface ProjectLinks {
    github?: string
    demo?: string
    article?: string
}
export interface ArchitectureComponent {
    name: string
    description: string
    technologies: string[]
}
export interface TechnicalPoint {
    title: string
    description: string
}
export interface Challenge {
    problem: string
    solution: string
}
export interface ProjectMeta {
    id: string
    title: string
    description: string
    longDescription?: string
    technologies: string[]
    role: string
    period: string
    highlights: string[]
    links?: ProjectLinks
    image?: string
    category: "personal" | "work"
}
export interface ProjectDetail {
    overview?: string
    background?: string
    architecture?: {
        description: string
        diagram?: string
        components?: ArchitectureComponent[]
    }
    technicalPoints?: TechnicalPoint[]
    challenges?: Challenge[]
    results?: string[]
    futureWork?: string[]
}
export interface Project extends ProjectMeta {
    detail?: ProjectDetail
}
// アーキテクチャコンポーネントを抽出するヘルパー関数
function extractArchitectureComponents(content: string): ArchitectureComponent[] {
    const regex = /### コンポーネント\s*\n([\s\S]*?)(?=\n## |$)/i
    const match = content.match(regex)
    if (!match) return []
    const components: ArchitectureComponent[] = []
    const componentRegex = /#### ([^\n]+)\n\n([^\n]+)\n\n([\s\S]*?)(?=\n#### |$)/g
    let componentMatch
    while ((componentMatch = componentRegex.exec(match[1])) !== null) {
        const [, name, description, techList] = componentMatch
        const technologies = techList
            .split("\n")
            .filter((line) => line.trim().startsWith("-"))
            .map((line) => line.replace(/^-\s*/, "").trim())
            .filter((item) => item.length > 0)
        components.push({
            name: name.trim(),
            description: description.trim(),
            technologies,
        })
    }
    return components
}
// 技術的な工夫を抽出するヘルパー関数
function extractTechnicalPoints(content: string): TechnicalPoint[] {
    const regex = /## 技術的な工夫\s*\n([\s\S]*?)(?=\n## |$)/i
    const match = content.match(regex)
    if (!match) return []
    const points: TechnicalPoint[] = []
    const pointRegex = /### ([^\n]+)\n\n([\s\S]*?)(?=\n### |\n## |$)/g
    let pointMatch
    while ((pointMatch = pointRegex.exec(match[1])) !== null) {
        points.push({
            title: pointMatch[1].trim(),
            description: pointMatch[2].trim(),
        })
    }
    return points
}
// 課題と解決策を抽出するヘルパー関数
function extractChallenges(content: string): Challenge[] {
    const regex = /## 課題と解決策\s*\n([\s\S]*?)(?=\n## |$)/i
    const match = content.match(regex)
    if (!match) return []
    const challenges: Challenge[] = []
    const challengeRegex =
        /### ([^\n]+)\n\n\*\*課題\*\*:\s*([^\n]+)\n\n\*\*解決策\*\*:\s*([\s\S]*?)(?=\n### |\n## |$)/g
    let challengeMatch
    while ((challengeMatch = challengeRegex.exec(match[1])) !== null) {
        challenges.push({
            problem: challengeMatch[2].trim(),
            solution: challengeMatch[3].trim(),
        })
    }
    return challenges
}
// すべての Portfolio Markdown
const portfolioMarkdowns: string[] = [
    portfolioSiteMd,
    // 新しいプロジェクトを追加する場合は、ここにインポートを追加
]
function parsePortfolioMarkdown(rawContent: string): Project {
    const { data, content } = matter(rawContent)
    const meta = data as ProjectMeta
    // アーキテクチャセクションを取得
    const architectureDescription = extractSection(content, "アーキテクチャ")
    const architectureComponents = extractArchitectureComponents(content)
    const detail: ProjectDetail = {
        overview: extractSection(content, "概要"),
        background: extractSection(content, "背景・課題"),
        architecture: architectureDescription
            ? {
                  description: architectureDescription.split("\n### ")[0].trim(),
                  components:
                      architectureComponents.length > 0
                          ? architectureComponents
                          : undefined,
              }
            : undefined,
        technicalPoints: extractTechnicalPoints(content),
        challenges: extractChallenges(content),
        results: extractFlatListItems(content, "成果・学び"),
        futureWork: extractFlatListItems(content, "今後の展望"),
    }
    // 詳細が空でないかチェック
    const hasDetail = Object.values(detail).some((v) =>
        Array.isArray(v) ? v.length > 0 : v !== undefined
    )
    return {
        id: meta.id,
        title: meta.title,
        description: meta.description,
        longDescription: meta.longDescription,
        technologies: meta.technologies || [],
        role: meta.role,
        period: meta.period,
        highlights: meta.highlights || [],
        links: meta.links,
        image: meta.image,
        category: meta.category,
        detail: hasDetail ? detail : undefined,
    }
}
// すべてのプロジェクトを取得
export function getProjects(): Project[] {
    return portfolioMarkdowns.map(parsePortfolioMarkdown)
}
// IDでプロジェクトを取得
export function getProjectById(id: string): Project | undefined {
    const projects = getProjects()
    return projects.find((project) => project.id === id)
}
// プロジェクトIDの一覧を取得
export function getProjectIds(): string[] {
    const projects = getProjects()
    return projects.map((project) => project.id)
}

/**
 * 指定 id の前後 id を返す純粋関数 (pager 用)。
 * - currentId が ids に無い場合は両方 undefined
 * - 重複 id は最初の出現位置を採用
 * - ラップなし (末尾の next は undefined)
 */
export function findAdjacentProjectIds(
    ids: string[],
    currentId: string,
): { prev?: string; next?: string } {
    const idx = ids.indexOf(currentId)
    if (idx === -1) return {}
    return {
        prev: idx > 0 ? ids[idx - 1] : undefined,
        next: idx < ids.length - 1 ? ids[idx + 1] : undefined,
    }
}

const CATEGORY_PREFIX: Record<Project["category"], string> = {
    personal: "P",
    work: "W",
}

/**
 * 表示用のプロジェクト番号を生成する純粋関数。
 * - personal は "P/01" 形式、work は "W/01" 形式
 * - indexInList は 0 始まり
 * - フォーマット (prefix / 桁数 / 区切り) を変えるときはここだけを更新する
 */
export function formatProjectNumber(
    category: Project["category"],
    indexInList: number,
): string {
    const prefix = CATEGORY_PREFIX[category]
    return `${prefix}/${String(indexInList + 1).padStart(2, "0")}`
}
