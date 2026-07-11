// studio (app) 層の読み取りエントリポイント。
// 実装制約「DB へ直接触れない・articles-data-access の関数のみを利用する」に従い、
// ここでは drizzle レイヤへ直接触れず、articles-data-access (@/lib/articles) の
// 読み取り関数へ委譲するだけに留める。DB アクセスは data-access 層に閉じている。
export { getAllTags, getArticles, getArticleById } from "@/lib/articles/queries"
