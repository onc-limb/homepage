import Parser from "rss-parser";
import fs from "fs/promises";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// .env ファイルを読み込む
dotenv.config();

// 型定義
interface FeedConfig {
  name: string;
  url: string;
  category?: string;
  type?: "release" | "blog" | "newsletter" | "news" | "aggregator";
  description?: string;
  requiresUserAgent?: boolean;
}

interface Config {
  feeds: FeedConfig[];
}

interface FetchOptions {
  requiresUserAgent?: boolean;
}

interface ParserCustomFields {
  feed: string[];
  item: string[];
}

interface ParserRequestOptions {
  headers: Record<string, string>;
}

interface ParserOptions {
  customFields?: ParserCustomFields;
  requestOptions?: ParserRequestOptions;
}

interface Article {
  title: string;
  link: string;
  source: string;
  summary: string;
}

interface ProcessResult {
  name: string;
  status: "saved" | "skipped" | "failed";
  reason?: string;
  count?: number;
  articles: Article[];
}

// ディレクトリパスの設定
const ROOT_DIR = path.join(import.meta.dirname, "..", "..");
const SERVICE_DIR = path.join(ROOT_DIR, "..", "service");

// Gemini API クライアントの初期化
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY 環境変数が設定されていません");
  console.error("   .env ファイルに GEMINI_API_KEY を設定してください");
  process.exit(1);
}
const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

/**
 * RSSフィードを取得してパースする
 */
async function fetchFeed(
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
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`フィードの取得に失敗しました: ${url}`, errorMessage);
    return null;
  }
}

/**
 * 設定ファイルを読み込む
 */
async function loadConfig(): Promise<Config> {
  const configPath = path.join(import.meta.dirname, "..", "feeds.json");
  const configData = await fs.readFile(configPath, "utf-8");
  return JSON.parse(configData) as Config;
}

/**
 * マークダウン出力用のディレクトリを作成する
 */
async function ensureOutputDirectory(): Promise<{ outputDir: string; date: string }> {
  const date = new Date().toISOString().split("T")[0];
  const outputDir = path.join(SERVICE_DIR, "docs", "crawl-news");
  try {
    await fs.access(outputDir);
  } catch {
    await fs.mkdir(outputDir, { recursive: true });
  }
  return { outputDir, date };
}

/**
 * プレリリース版かどうかを判定する
 * canary, alpha, beta, rc, dev, nightly, preview, next, experimental などを除外
 */
function isPreRelease(item: Parser.Item): boolean {
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
function isWithinOneDay(item: Parser.Item): boolean {
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
function isStableRelease(item: Parser.Item): boolean {
  return isWithinOneDay(item) && !isPreRelease(item);
}

/**
 * Gemini APIを使用して記事を要約する
 */
async function summarizeWithGemini(
  title: string,
  content: string,
  link: string
): Promise<string> {
  const prompt = `以下の技術記事の内容を日本語で要約してください。

タイトル: ${title}
URL: ${link}
内容:
${content || "内容が取得できませんでした"}

要約の際は以下の点に注意してください：
- 200〜300文字程度で簡潔にまとめる
- 技術的なポイントを明確にする
- 開発者にとって重要な情報を優先する
- 日本語で出力する`;

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "要約を生成できませんでした";
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`   ⚠️ 要約エラー: ${errorMessage}`);
    return "要約の生成に失敗しました";
  }
}

/**
 * すべての記事を1つのマークダウンファイルとして保存する
 */
async function saveAllArticlesAsMarkdown(
  outputDir: string,
  date: string,
  allArticles: Article[]
): Promise<string> {
  const fileName = `${date}.md`;
  const filePath = path.join(outputDir, fileName);

  let markdown = `# 技術ニュース ${date}

取得日時: ${new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}
記事数: ${allArticles.length}件

---

`;

  for (const article of allArticles) {
    markdown += `## ${article.title}

**ソース:** ${article.source}

${article.summary}

🔗 [記事を読む](${article.link})

---

`;
  }

  await fs.writeFile(filePath, markdown, "utf-8");
  return fileName;
}

/**
 * 単一フィードを処理する（記事を収集するのみ）
 */
async function processFeed(
  feedConfig: FeedConfig
): Promise<ProcessResult> {
  const feed = await fetchFeed(feedConfig.url, {
    requiresUserAgent: feedConfig.requiresUserAgent,
  });

  if (feed && feed.items) {
    let filteredItems: Parser.Item[];
    const feedType = feedConfig.type;

    // タイプ別のフィルタリング
    if (
      feedType === "blog" ||
      feedType === "newsletter" ||
      feedType === "news" ||
      feedType === "aggregator"
    ) {
      // ブログ/ニュースレター/ニュース/アグリゲーターは期間のみでフィルタ
      filteredItems = feed.items.filter(isWithinOneDay);
    } else {
      // リリースは安定版のみ
      filteredItems = feed.items.filter(isStableRelease);
    }

    if (filteredItems.length === 0) {
      const reason =
        feedType === "blog" ||
        feedType === "newsletter" ||
        feedType === "news" ||
        feedType === "aggregator"
          ? "1日以内の記事はありません"
          : "1日以内の安定版リリースはありません";
      return { name: feedConfig.name, status: "skipped", reason, articles: [] };
    }

    const articles: Article[] = [];
    for (const item of filteredItems) {
      const title = item.title || "タイトルなし";
      const link = item.link || "";
      const content = item.contentSnippet || item.content || "";

      console.log(`   📝 要約中: ${title.slice(0, 50)}...`);

      // Gemini APIで要約を取得
      const summary = await summarizeWithGemini(title, content, link);

      const article: Article = {
        title,
        link,
        source: feedConfig.name,
        summary,
      };

      articles.push(article);

      // API レート制限を考慮して少し待機
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    return {
      name: feedConfig.name,
      status: "saved",
      count: articles.length,
      articles,
    };
  } else {
    return { name: feedConfig.name, status: "failed", articles: [] };
  }
}

/**
 * メイン処理
 */
async function main(): Promise<void> {
  console.log("🚀 ニュースクローラー（要約付き）を開始します...\n");

  // 設定を読み込む
  const config = await loadConfig();
  console.log(`📋 ${config.feeds.length}件のフィードを取得します\n`);

  // 出力ディレクトリを作成
  const { outputDir, date } = await ensureOutputDirectory();
  console.log(`📁 出力先: service/docs/crawl-news/${date}.md\n`);

  console.log("📡 フィードを順次取得・要約中...\n");

  // フィードを順次処理（API レート制限を考慮）
  const results: ProcessResult[] = [];
  const allArticles: Article[] = [];

  for (const feedConfig of config.feeds) {
    console.log(`\n🔄 ${feedConfig.name} を処理中...`);
    const result = await processFeed(feedConfig);
    results.push(result);

    if (result.status === "saved") {
      console.log(`   ✅ ${result.count}件の記事を取得しました`);
      allArticles.push(...result.articles);
    } else if (result.status === "skipped") {
      console.log(`   ⏭️ スキップ: ${result.reason}`);
    } else {
      console.log(`   ❌ 取得に失敗しました`);
    }
  }

  // すべての記事を1つのファイルに保存
  if (allArticles.length > 0) {
    const fileName = await saveAllArticlesAsMarkdown(outputDir, date, allArticles);
    console.log(`\n📄 ${fileName} に保存しました`);
  }

  // 結果をステータス別に分類
  const saved = results.filter((r) => r.status === "saved");
  const skipped = results.filter((r) => r.status === "skipped");
  const failed = results.filter((r) => r.status === "failed");

  // サマリーを表示
  console.log("\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(
    `📊 結果: ${saved.length}サイトから ${allArticles.length}件の記事を保存`
  );
  console.log(`   (スキップ ${skipped.length}件 / 失敗 ${failed.length}件)`);
  console.log(`📁 出力先: service/docs/crawl-news/${date}.md`);
  console.log("✨ 完了しました！");
}

// スクリプトを実行
main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
