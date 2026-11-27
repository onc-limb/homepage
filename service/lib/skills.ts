import matter from "gray-matter"
import { extractFlatListItems } from "./markdown-utils"
import {
    SKILL_SECTION_TITLES,
    type ListItem,
    type ListSection,
    type ListSubsection,
    type Skill,
    type SkillMeta,
} from "./skills-meta"

export {
    categoryLabels,
    categoryOrder,
    levelLabels,
    sortSkillsByLevel,
    type ListItem,
    type Skill,
    type SkillCategory,
    type SkillLevel,
    type SkillMeta,
} from "./skills-meta"

export interface SkillSource {
    key: string // require.context のキー（./<category>/<file>.md）
    raw: string
}

// docs/skills配下のすべての.mdファイルを動的にimport
// @ts-expect-error require.context is webpack specific
const requireContext = require.context("../docs/skills", true, /\.md$/)
const skillSources: SkillSource[] = requireContext.keys().map((key: string) => {
    const mdModule = requireContext(key)
    // raw-loaderはデフォルトエクスポートとして文字列を返す
    return { key, raw: typeof mdModule === "string" ? mdModule : mdModule.default || mdModule }
})
// Markdown から経験・知識を抽出するヘルパー関数（階層構造対応）
function extractListItems(content: string, sectionTitle: string): ListSection {
    const regex = new RegExp(`## ${sectionTitle}\\s*\\n([\\s\\S]*?)(?=\\n## |$)`, "i")
    const match = content.match(regex)
    const result: ListSection = { items: [], subsections: [] }
    if (!match) return result
    const lines = match[1].split("\n")
    // サブセクション（### で始まる）とリストアイテムを解析
    let currentSubsection: ListSubsection | null = null
    const stack: { item: ListItem; indent: number }[] = []
    const topLevel = () => (currentSubsection ? currentSubsection.items : result.items)
    for (const line of lines) {
        // サブセクション（### xxx）
        const subsectionMatch = line.match(/^###\s+(.+)$/)
        if (subsectionMatch) {
            currentSubsection = { title: subsectionMatch[1], items: [] }
            result.subsections.push(currentSubsection)
            stack.length = 0 // スタックをリセット
            continue
        }
        // リストアイテム（- で始まる行、インデント考慮）
        const listMatch = line.match(/^(\s*)-\s+(.+)$/)
        if (listMatch) {
            const indent = listMatch[1].length
            const newItem: ListItem = { text: listMatch[2], children: [] }
            // インデントが0の場合はトップレベル
            if (indent === 0) {
                topLevel().push(newItem)
                stack.length = 0
            } else {
                // インデントがある場合は親を探す
                while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
                    stack.pop()
                }
                if (stack.length > 0) {
                    stack[stack.length - 1].item.children.push(newItem)
                } else {
                    topLevel().push(newItem)
                }
            }
            stack.push({ item: newItem, indent })
        }
    }
    return result
}

function parseSkillMarkdown({ key, raw }: SkillSource): Skill {
    const { data, content } = matter(raw)
    const meta = data as SkillMeta
    return {
        name: meta.name,
        slug: key.replace(/^.*\//, "").replace(/\.md$/, ""),
        category: meta.category,
        level: meta.level,
        publish: meta.publish,
        // work / study 以外の値は無視し、階は level で決める
        context: meta.context === "work" || meta.context === "study" ? meta.context : undefined,
        experience: extractListItems(content, SKILL_SECTION_TITLES.experience),
        knowledge: extractListItems(content, SKILL_SECTION_TITLES.knowledge),
        relatedTech: extractFlatListItems(content, SKILL_SECTION_TITLES.relatedTech),
        relatedBooks: extractFlatListItems(content, SKILL_SECTION_TITLES.relatedBooks),
    }
}

// md の本文とキーから公開スキルの一覧を作る（getSkills から分けた純粋関数）
export function parseSkillSources(sources: SkillSource[]): Skill[] {
    const allSkills = sources
        .map(parseSkillMarkdown)
        .filter((skill) => skill.publish)

    // スキル名でユニーク化
    // Note: Webpackの require.context() がビルド時に Server/Client 両方のバンドルで評価され、
    // sources に同じファイルが複数回含まれる場合があるため、
    // スキル名をキーとして重複を除去する
    return Array.from(new Map(allSkills.map((skill) => [skill.name, skill])).values())
}

// すべてのスキルを取得
export function getSkills(): Skill[] {
    return parseSkillSources(skillSources)
}
