import type Parser from "rss-parser";
import type {
  FeedConfig,
  Article,
  ProcessResult,
  PendingArticle,
  FeedFetchResult,
} from "./types.js";
import { isContentFeedType } from "./types.js";
import { fetchFeed, isWithinOneDay, isStableRelease } from "./feed.js";
import { summarizeWithRateLimit } from "./summarizer.js";

/** 1日あたりの最大要約件数 */
export const MAX_SUMMARY_COUNT = 50;

/**
 * フィードを取得してフィルタリングする（要約なし）
 */
export async function fetchAndFilterFeed(
  feedConfig: FeedConfig
): Promise<FeedFetchResult> {
  const feed = await fetchFeed(feedConfig.url, {
    requiresUserAgent: feedConfig.requiresUserAgent,
  });

  if (!feed || !feed.items) {
    return { name: feedConfig.name, status: "failed", pendingArticles: [] };
  }

  let filteredItems: Parser.Item[];
  const feedType = feedConfig.type;

  // タイプ別のフィルタリング
  if (isContentFeedType(feedType)) {
    filteredItems = feed.items.filter(isWithinOneDay);
  } else {
    filteredItems = feed.items.filter(isStableRelease);
  }

  if (filteredItems.length === 0) {
    const reason = isContentFeedType(feedType)
      ? "1日以内の記事はありません"
      : "1日以内の安定版リリースはありません";
    return { name: feedConfig.name, status: "skipped", reason, pendingArticles: [] };
  }

  const pendingArticles: PendingArticle[] = filteredItems.map((item) => ({
    title: item.title || "タイトルなし",
    link: item.link || "",
    content: item.contentSnippet || item.content || "",
    source: feedConfig.name,
  }));

  return {
    name: feedConfig.name,
    status: "fetched",
    pendingArticles,
  };
}

/**
 * 複数のフィードを並列で取得する
 */
export async function fetchAllFeeds(
  feedConfigs: FeedConfig[]
): Promise<FeedFetchResult[]> {
  const promises = feedConfigs.map((config) => fetchAndFilterFeed(config));
  return Promise.all(promises);
}

/**
 * 記事を要約する
 */
async function summarizeArticle(pending: PendingArticle): Promise<Article> {
  const summary = await summarizeWithRateLimit(
    pending.title,
    pending.content,
    pending.link
  );

  return {
    title: pending.title,
    link: pending.link,
    source: pending.source,
    summary,
  };
}

/**
 * タイトルとリンクのみの記事を作成する（要約なし）
 */
function createTitleOnlyArticle(pending: PendingArticle): Article {
  return {
    title: pending.title,
    link: pending.link,
    source: pending.source,
    summary: "",
    summaryOnly: true,
  };
}

/**
 * 複数の記事を並列で要約する（セマフォで同時実行数を制限）
 * 最大件数を超えた記事はタイトルとリンクのみにする
 */
export async function summarizeAllArticles(
  pendingArticles: PendingArticle[],
  onProgress?: (title: string, isSummary: boolean) => void
): Promise<Article[]> {
  // 要約対象とタイトルのみ対象を分ける
  const toSummarize = pendingArticles.slice(0, MAX_SUMMARY_COUNT);
  const titleOnly = pendingArticles.slice(MAX_SUMMARY_COUNT);

  // 要約対象を並列処理
  const summaryPromises = toSummarize.map(async (pending) => {
    if (onProgress) {
      onProgress(pending.title, true);
    }
    return summarizeArticle(pending);
  });

  const summarizedArticles = await Promise.all(summaryPromises);

  // タイトルのみの記事を作成
  const titleOnlyArticles = titleOnly.map((pending) => {
    if (onProgress) {
      onProgress(pending.title, false);
    }
    return createTitleOnlyArticle(pending);
  });

  return [...summarizedArticles, ...titleOnlyArticles];
}

/**
 * フィード取得結果を処理結果に変換する
 */
export function convertToProcessResult(
  fetchResult: FeedFetchResult,
  articles: Article[]
): ProcessResult {
  if (fetchResult.status === "failed") {
    return { name: fetchResult.name, status: "failed", articles: [] };
  }

  if (fetchResult.status === "skipped") {
    return {
      name: fetchResult.name,
      status: "skipped",
      reason: fetchResult.reason,
      articles: [],
    };
  }

  return {
    name: fetchResult.name,
    status: "saved",
    count: articles.length,
    articles,
  };
}

/**
 * 単一フィードを処理する（後方互換性のため残す）
 */
export async function processFeed(feedConfig: FeedConfig): Promise<ProcessResult> {
  const fetchResult = await fetchAndFilterFeed(feedConfig);

  if (fetchResult.status !== "fetched") {
    return convertToProcessResult(fetchResult, []);
  }

  const articles: Article[] = [];
  for (const pending of fetchResult.pendingArticles) {
    console.log(`   📝 要約中: ${pending.title.slice(0, 50)}...`);
    const article = await summarizeArticle(pending);
    articles.push(article);
  }

  return convertToProcessResult(fetchResult, articles);
}
