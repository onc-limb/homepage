import matter from "gray-matter"
import { extractFlatListItems } from "./markdown-utils"
import { type ListItem, type Skill, type SkillMeta } from "./skills-meta"

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
        experience: extractListItems(content, "経験"),
        knowledge: extractListItems(content, "知識"),
        relatedTech: extractFlatListItems(content, "関連技術"),
        relatedBooks: extractFlatListItems(content, "関連書籍"),
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
