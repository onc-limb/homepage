// 記事管理 UI 内で共有する型定義。
// articles-data-access (@/lib/articles) の戻り値をそのまま渡す代わりに、
// UI 側で必要なフィールドだけを持つ最小の構造型を宣言し、疎結合に保つ。
export type ArticleStatus = "draft" | "published"

// タグは既存 tags テーブルを再利用する（記事専用タグは作らない）。
export type TagOption = {
    id: number
    name: string
}

// 一覧表示に必要な記事フィールド。
export type ArticleListItem = {
    id: number
    title: string
    slug: string
    status: ArticleStatus
    updatedAt?: string
    tags?: TagOption[]
}

// 編集フォームの初期値として必要な記事フィールド（本文含む）。
export type ArticleDetail = ArticleListItem & {
    body: string
}

// フォームが扱う入力値の形。
export type ArticleFormValues = {
    title: string
    slug: string
    body: string
    status: ArticleStatus
    tagIds: number[]
}
