import type Parser from "rss-parser";

/**
 * フィード設定の型定義
 */
export interface FeedConfig {
  name: string;
  url: string;
  category?: string;
  type?: "release" | "blog" | "newsletter" | "news" | "aggregator";
  description?: string;
  requiresUserAgent?: boolean;
}

/**
 * 設定ファイルの型定義
 */
export interface Config {
  feeds: FeedConfig[];
}

/**
 * フィード取得オプション
 */
export interface FetchOptions {
  requiresUserAgent?: boolean;
}

/**
 * rss-parser のカスタムフィールド設定
 */
export interface ParserCustomFields {
  feed: string[];
  item: string[];
}

/**
 * rss-parser のリクエストオプション
 */
export interface ParserRequestOptions {
  headers: Record<string, string>;
}

/**
 * rss-parser のオプション
 */
export interface ParserOptions {
  customFields?: ParserCustomFields;
  requestOptions?: ParserRequestOptions;
}

/**
 * 記事データ
 */
export interface Article {
  title: string;
  link: string;
  source: string;
  summary: string;
}

/**
 * フィード処理結果
 */
export interface ProcessResult {
  name: string;
  status: "saved" | "skipped" | "failed";
  reason?: string;
  count?: number;
  articles: Article[];
}

/**
 * 出力ディレクトリ情報
 */
export interface OutputDirInfo {
  outputDir: string;
  date: string;
}

/**
 * 要約待ちの記事データ（要約前）
 */
export interface PendingArticle {
  title: string;
  link: string;
  content: string;
  source: string;
}

/**
 * フィード取得結果（要約前）
 */
export interface FeedFetchResult {
  name: string;
  status: "fetched" | "skipped" | "failed";
  reason?: string;
  pendingArticles: PendingArticle[];
}

/**
 * フィードタイプの判定用型
 */
export type ContentFeedType = "blog" | "newsletter" | "news" | "aggregator";

/**
 * コンテンツベースのフィードかどうかを判定する型ガード
 */
export function isContentFeedType(
  type: FeedConfig["type"]
): type is ContentFeedType {
  return (
    type === "blog" ||
    type === "newsletter" ||
    type === "news" ||
    type === "aggregator"
  );
}
