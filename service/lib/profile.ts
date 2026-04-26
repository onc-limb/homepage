import matter from "gray-matter"
// @ts-expect-error raw-loader returns string
import profileMarkdown from "../docs/profile.md"

export type ProfileMeta = {
    name: string
    title: string
    avatar: string
    github: string
}

export type Profile = {
    data: ProfileMeta
    content: string
}

export interface CareerItem {
    period: "CURRENT" | "PRIOR" | "START"
    role: string
    bullets: string[]
}

export interface InterestItem {
    title: string
    description: string
}

export interface CertItem {
    title: string
    year: string
}

export type IntroBlock =
    | { type: "paragraph"; text: string }
    | { type: "pullQuote"; text: string }

export interface ParsedProfile {
    selfIntroduction: IntroBlock[]
    career: CareerItem[]
    interests: InterestItem[]
    certs: CertItem[]
}

export const getProfile = async (): Promise<Profile> => {
    const { data, content } = matter(profileMarkdown)
    return {
        data: data as ProfileMeta,
        content,
    }
}

export const getParsedProfile = async (): Promise<ParsedProfile> => {
    return parseProfile(profileMarkdown)
}

/**
 * raw markdown を構造化して返す。design 素案の profile セクション構造に合わせる。
 * - story 01 自己紹介 (paragraphs)
 * - story 02 経歴 (### 役職 + - 箇条書き、period は配列順序から自動採番)
 * - story 03 関心 (### 関心 内の `**title** - description` リスト)
 * - story 04 資格 (### 資格 内の `title (year ...)` リスト)
 */
export function parseProfile(rawMarkdown: string): ParsedProfile {
    if (!rawMarkdown.trim()) {
        return { selfIntroduction: [], career: [], interests: [], certs: [] }
    }

    const { content } = matter(rawMarkdown)

    return {
        selfIntroduction: extractSelfIntroduction(content),
        career: extractCareer(content),
        interests: extractInterestsLike(content, "関心"),
        certs: extractCerts(content),
    }
}

function extractSelfIntroduction(content: string): IntroBlock[] {
    const section = extractTopLevelSection(content, "自己紹介")
    if (!section) return []

    // markdown の段落単位で扱う。`>` で始まる段落は pull-quote として分離する。
    const paragraphs = section
        .split(/\n{2,}/)
        .map((para) =>
            para
                .split("\n")
                .filter((line) => !line.startsWith("###"))
                .map((line) => line.trim())
                .filter(Boolean)
                .join(" "),
        )
        .filter(Boolean)

    return paragraphs.map<IntroBlock>((para) =>
        para.startsWith(">")
            ? { type: "pullQuote", text: para.replace(/^>\s*/, "").trim() }
            : { type: "paragraph", text: para },
    )
}

function extractCareer(content: string): CareerItem[] {
    const section = extractTopLevelSection(content, "経歴")
    if (!section) return []

    const subsections = splitSubsections(section)
    if (subsections.length === 0) return []

    const total = subsections.length
    return subsections.map((sub, idx) => {
        const period: CareerItem["period"] =
            total === 1
                ? "CURRENT"
                : idx === 0
                  ? "CURRENT"
                  : idx === total - 1
                    ? "START"
                    : "PRIOR"
        return {
            period,
            role: sub.title,
            bullets: extractBullets(sub.body),
        }
    })
}

function extractInterestsLike(content: string, sectionName: string): InterestItem[] {
    const body = extractAnySubsection(content, sectionName)
    if (!body) return []

    const items: InterestItem[] = []
    for (const line of body.split("\n")) {
        const m = line.match(/^\s*-\s+\*\*([^*]+)\*\*\s*[-–—]\s*(.+)$/)
        if (m) {
            items.push({ title: m[1].trim(), description: m[2].trim() })
        }
    }
    return items
}

function extractCerts(content: string): CertItem[] {
    const body = extractAnySubsection(content, "資格")
    if (!body) return []

    const items: CertItem[] = []
    for (const line of body.split("\n")) {
        const m = line.match(/^\s*-\s+(.+)$/)
        if (!m) continue
        const raw = m[1].trim()
        const yearMatch = raw.match(/\(([^)]+)\)\s*(.*)$/)
        if (yearMatch) {
            const title = raw.slice(0, raw.indexOf("(")).trim()
            const year = `${yearMatch[1].trim()}${yearMatch[2] ? " " + yearMatch[2].trim() : ""}`.trim()
            items.push({ title, year })
        } else {
            items.push({ title: raw, year: "" })
        }
    }
    return items
}

/**
 * `## sectionName` から次の `## ` または文書末までを抽出。
 */
function extractTopLevelSection(content: string, sectionName: string): string | null {
    const lines = content.split("\n")
    const head = new RegExp(`^##\\s+${escapeRegex(sectionName)}\\s*$`)
    const start = lines.findIndex((l) => head.test(l))
    if (start === -1) return null
    let end = lines.length
    for (let i = start + 1; i < lines.length; i++) {
        if (/^##\s+/.test(lines[i])) {
            end = i
            break
        }
    }
    return lines.slice(start + 1, end).join("\n")
}

/**
 * `### sectionName` を `##` 階層を問わず探し、その本文 (次の `### ` または `## ` または文書末まで) を返す。
 */
function extractAnySubsection(content: string, sectionName: string): string | null {
    const lines = content.split("\n")
    const head = new RegExp(`^###\\s+${escapeRegex(sectionName)}\\s*$`)
    const start = lines.findIndex((l) => head.test(l))
    if (start === -1) return null
    let end = lines.length
    for (let i = start + 1; i < lines.length; i++) {
        if (/^###\s+/.test(lines[i]) || /^##\s+/.test(lines[i])) {
            end = i
            break
        }
    }
    return lines.slice(start + 1, end).join("\n")
}

function escapeRegex(input: string): string {
    return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

interface Subsection {
    title: string
    body: string
}

function splitSubsections(section: string): Subsection[] {
    const lines = section.split("\n")
    const subs: Subsection[] = []
    let current: Subsection | null = null
    for (const line of lines) {
        const head = line.match(/^###\s+(.+?)\s*$/)
        if (head) {
            if (current) subs.push(current)
            current = { title: head[1].trim(), body: "" }
        } else if (current) {
            current.body += line + "\n"
        }
    }
    if (current) subs.push(current)
    return subs
}

function extractBullets(body: string): string[] {
    return body
        .split("\n")
        .map((line) => line.match(/^\s*-\s+(.+?)\s*$/))
        .filter((m): m is RegExpMatchArray => m !== null)
        .map((m) => m[1].trim())
}
