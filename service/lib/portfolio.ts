import matter from "gray-matter"
import { findGroup, toVirtualPath } from "./building/floors"
// @ts-expect-error raw-loader returns string
import portfolioSiteMd from "../docs/portfolio/portfolio-site.md"
// @ts-expect-error raw-loader returns string
import noboruNoteMd from "../docs/portfolio/noboru-note.md"
// @ts-expect-error raw-loader returns string
import climbinsightMd from "../docs/portfolio/climbinsight.md"
// @ts-expect-error raw-loader returns string
import ironLegionMd from "../docs/portfolio/iron-legion.md"
// @ts-expect-error raw-loader returns string
import onclimbIndustriesMd from "../docs/portfolio/onclimb-industries.md"
export interface ProjectLinks {
    github?: string
    demo?: string
    article?: string
}
export interface ProjectMeta {
    id: string
    updatedAt: string
    title: string
    description: string
    longDescription?: string
    technologies: string[]
    role: string
    period: string
    highlights: string[]
    links?: ProjectLinks
    image?: string
}
export interface Project extends ProjectMeta {
    /** md の本文（frontmatter を除いたもの）。部分的に解析せず、そのまま描く */
    body: string
}

// すべての Portfolio Markdown
const portfolioMarkdowns: string[] = [
    portfolioSiteMd,
    noboruNoteMd,
    climbinsightMd,
    ironLegionMd,
    onclimbIndustriesMd,
    // 新しいプロジェクトを追加する場合は、ここにインポートを追加
]
function parsePortfolioMarkdown(rawContent: string): Project {
    const { data, content } = matter(rawContent)
    const meta = data as ProjectMeta
    return {
        id: meta.id,
        updatedAt: meta.updatedAt,
        title: meta.title,
        description: meta.description,
        longDescription: meta.longDescription,
        technologies: meta.technologies || [],
        role: meta.role,
        period: meta.period,
        highlights: meta.highlights || [],
        links: meta.links,
        image: meta.image,
        body: content,
    }
}

// すべてのプロジェクトを取得
export function getProjects(): Project[] {
    return portfolioMarkdowns.map(parsePortfolioMarkdown)
}
// 一覧・詳細の静的生成・sitemap・前後の扉が使う並び。updatedAt の新しい順（同じ日時は md の登録順）
export function listProjects(projects: Project[]): Project[] {
    return projects
        .map((project, index) => ({ project, index, time: Date.parse(project.updatedAt) }))
        .sort((a, b) => b.time - a.time || a.index - b.index)
        .map(({ project }) => project)
}

export function projectHref(project: Pick<Project, "id">): string {
    return `${findGroup("portfolios").url}/${project.id}`
}

export function projectVirtualPath(project: Pick<Project, "id">): string {
    return `${toVirtualPath(findGroup("portfolios").url)}/${project.id}.md`
}

/** 一覧に出す日付（updatedAt の YYYY-MM-DD） */
export function projectDate(project: Pick<Project, "updatedAt">): string {
    return project.updatedAt.slice(0, 10)
}

export type ProjectPageResolution =
    | { kind: "found"; project: Project; prev?: Project; next?: Project }
    | { kind: "missing" }

// 詳細ページの [id] を解決する。前後は listProjects の順で決まる
export function resolveProjectPage(projects: Project[], id: string): ProjectPageResolution {
    const listed = listProjects(projects)
    const index = listed.findIndex((project) => project.id === id)
    if (index === -1) return { kind: "missing" }
    return { kind: "found", project: listed[index], prev: listed[index - 1], next: listed[index + 1] }
}
