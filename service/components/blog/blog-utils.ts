// 公開ブログ (記事) 一覧・詳細で使う純粋ロジックと表示用型。
// React に依存しないユニットテスト可能なユーティリティのみをここに置く。

export const ALL_TAG = "all"

export type BlogArticleStatus = "draft" | "published"

// ASSUMPTION: articles-data-access の公開用関数が返す記事形状を、schema.ts の
// articles テーブル（id / slug / title / body / status / createdAt / updatedAt）+
// 関連タグ名配列 (tags: string[]) として表示層で扱う。
export interface BlogArticle {
    id: number
    slug: string
    title: string
    body: string
    status: BlogArticleStatus
    tags: string[]
    createdAt: string
    updatedAt: string
}

/**
 * 公開状態 (published) の記事だけを残す。
 * データアクセス層が published のみを返す契約だが、公開一覧に draft を
 * 決して漏らさないための多層防御としても機能する。
 */
export function filterPublished(articles: BlogArticle[]): BlogArticle[] {
    return articles.filter((a) => a.status === "published")
}

/**
 * 記事群に含まれるタグ名を重複なく、表示安定のためアルファベット順で返す。
 */
export function collectTags(articles: BlogArticle[]): string[] {
    const set = new Set<string>()
    for (const article of articles) {
        for (const tag of article.tags) set.add(tag)
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b))
}

/**
 * タグによる絞り込み。tag が未指定 / ALL_TAG の場合は全件を返す。
 */
export function filterByTag(
    articles: BlogArticle[],
    tag?: string | null,
): BlogArticle[] {
    if (!tag || tag === ALL_TAG) return articles
    return articles.filter((a) => a.tags.includes(tag))
}

/**
 * Markdown 本文からカード用のプレーンな抜粋を作る。
 * 主要な記法を取り除き、max を超える場合は省略記号を付ける。
 */
export function excerpt(body: string, max = 140): string {
    const text = body
        .replace(/```[\s\S]*?```/g, " ") // コードフェンス
        .replace(/`([^`]*)`/g, "$1") // インラインコード
        .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // 画像
        .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // リンク → テキスト
        .replace(/^#{1,6}\s+/gm, "") // 見出し記号
        .replace(/[*_>~#-]/g, " ") // 残りの記法記号
        .replace(/\s+/g, " ")
        .trim()
    return text.length > max ? text.slice(0, max).trimEnd() + "…" : text
}

/**
 * createdAt ("2026-01-02 03:04:05" など) を YYYY-MM-DD 表記に整える。
 */
export function formatDate(value: string): string {
    if (!value) return ""
    return value.slice(0, 10)
}
