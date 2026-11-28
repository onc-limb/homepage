/**
 * Markdown パース用ユーティリティ関数
 */
/**
 * Markdown からフラットなリストアイテムを抽出する
 * @param content Markdown コンテンツ
 * @param sectionTitle セクションタイトル（## の後の文字列）
 * @returns 抽出されたリストアイテムの配列
 */
export function extractFlatListItems(content: string, sectionTitle: string): string[] {
    const regex = new RegExp(`## ${sectionTitle}\\s*\\n([\\s\\S]*?)(?=\\n## |$)`, "i")
    const match = content.match(regex)
    if (!match) return []
    const items = match[1]
        .split("\n")
        .filter((line) => line.trim().startsWith("-"))
        .map((line) => line.replace(/^\s*-\s*/, "").trim())
        .filter((item) => item.length > 0)
    return items
}
