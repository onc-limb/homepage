// crawl-news の日付一覧とコンテンツを取得するユーティリティ
// Webpack の require.context を使って docs/crawl-news 内の全 .md ファイルを取得
// @ts-expect-error require.context is webpack specific
const newsContext = require.context("../docs/crawl-news", false, /\.md$/)
export interface NewsItem {
    date: string
    fileName: string
}
export interface NewsContent {
    date: string
    content: string
}
/**
 * 利用可能なニュースの日付一覧を取得
 */
export function getNewsDates(): NewsItem[] {
    const keys = newsContext.keys() as string[]
    // 日付形式（YYYY-MM-DD）のファイル名のみをフィルタ
    const datePattern = /^\.\/\d{4}-\d{2}-\d{2}\.md$/
    return keys
        .filter((key: string) => datePattern.test(key))
        .map((key: string) => {
            // "./2025-11-29.md" -> "2025-11-29"
            const fileName = key.replace("./", "").replace(".md", "")
            return {
                date: fileName,
                fileName: key,
            }
        })
        .sort((a, b) => b.date.localeCompare(a.date)) // 新しい日付順
}
/**
 * 特定の日付のニュースコンテンツを取得
 */
export function getNewsContent(date: string): NewsContent | null {
    const fileName = `./${date}.md`
    try {
        const rawContent = newsContext(fileName)
        // raw-loader の出力は文字列または { default: string } のオブジェクト
        const content =
            typeof rawContent === "string" ? rawContent : (rawContent.default as string)
        return {
            date,
            content,
        }
    } catch {
        return null
    }
}
/**
 * 全ての日付を取得（静的生成用）
 */
export function getAllNewsDates(): string[] {
    return getNewsDates().map((item) => item.date)
}
