import Parser from "rss-parser";
import type { FetchOptions, ParserOptions } from "./types.js";

/**
 * RSSフィードを取得してパースする
 */
export async function fetchFeed(
  url: string,
  options: FetchOptions = {}
): Promise<Parser.Output<Parser.Item> | null> {
  const parserOptions: ParserOptions = {};

  // User-Agentが必要な場合はカスタムリクエストヘッダーを設定
  if (options.requiresUserAgent) {
    parserOptions.customFields = {
      feed: [],
      item: [],
    };
    parserOptions.requestOptions = {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    };
  }

  const parser = new Parser(parserOptions);
  try {
    const feed = await parser.parseURL(url);
    return feed;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`フィードの取得に失敗しました: ${url}`, errorMessage);
    return null;
  }
}

/**
 * プレリリース版かどうかを判定する
 * canary, alpha, beta, rc, dev, nightly, preview, next, experimental などを除外
 */
export function isPreRelease(item: Parser.Item): boolean {
  const title = (item.title || "").toLowerCase();
  const prereleasePatterns = [
    /canary/,
    /alpha/,
    /beta/,
    /\brc\b/,
    /\brc\d/,
    /-rc\./,
    /\bdev\b/,
    /nightly/,
    /preview/,
    /-next\./,
    /experimental/,
    /snapshot/,
    /insiders/,
  ];

  return prereleasePatterns.some((pattern) => pattern.test(title));
}

/**
 * 1日以内のアイテムかどうかを判定する
 */
export function isWithinOneDay(item: Parser.Item): boolean {
  const pubDate = item.pubDate || item.isoDate;
  if (!pubDate) return false;

  const itemDate = new Date(pubDate);
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  return itemDate >= oneDayAgo;
}

/**
 * 安定版リリースかどうかを判定する（1日以内 かつ プレリリースではない）
 */
export function isStableRelease(item: Parser.Item): boolean {
  return isWithinOneDay(item) && !isPreRelease(item);
}
