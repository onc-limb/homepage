import type { Article, ProcessResult, PendingArticle } from "./types.js";
import { loadConfig, ensureOutputDirectory } from "./config.js";
import { saveAllArticlesAsMarkdown } from "./markdown.js";
import {
  fetchAllFeeds,
  summarizeAllArticles,
  convertToProcessResult,
  MAX_SUMMARY_COUNT,
} from "./processor.js";

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

  // フェーズ1: 全フィードを並列で取得
  console.log("📡 フィードを並列取得中...\n");
  const startFetch = Date.now();
  const fetchResults = await fetchAllFeeds(config.feeds);
  const fetchTime = ((Date.now() - startFetch) / 1000).toFixed(1);

  // フィード取得結果を表示
  for (const result of fetchResults) {
    if (result.status === "fetched") {
      console.log(`   ✅ ${result.name}: ${result.pendingArticles.length}件の記事`);
    } else if (result.status === "skipped") {
      console.log(`   ⏭️ ${result.name}: ${result.reason}`);
    } else {
      console.log(`   ❌ ${result.name}: 取得失敗`);
    }
  }
  console.log(`\n⏱️ フィード取得完了: ${fetchTime}秒\n`);

  // 全ての要約待ち記事を収集
  const allPendingArticles: PendingArticle[] = [];
  for (const result of fetchResults) {
    if (result.status === "fetched") {
      allPendingArticles.push(...result.pendingArticles);
    }
  }

  if (allPendingArticles.length === 0) {
    console.log("📭 要約する記事がありません");
    return;
  }

  // フェーズ2: 全記事を並列で要約（セマフォで同時実行数を制限）
  const summaryCount = Math.min(allPendingArticles.length, MAX_SUMMARY_COUNT);
  const titleOnlyCount = Math.max(0, allPendingArticles.length - MAX_SUMMARY_COUNT);

  console.log(`📝 ${summaryCount}件の記事を要約中...`);
  if (titleOnlyCount > 0) {
    console.log(`   (残り${titleOnlyCount}件はタイトルとリンクのみ)`);
  }
  console.log("");

  const startSummary = Date.now();

  let completedCount = 0;
  const allArticles = await summarizeAllArticles(allPendingArticles, (title, isSummary) => {
    completedCount++;
    const prefix = isSummary ? "📝" : "📌";
    console.log(
      `   ${prefix} [${completedCount}/${allPendingArticles.length}] ${title.slice(0, 50)}...`
    );
  });

  const summaryTime = ((Date.now() - startSummary) / 1000).toFixed(1);
  console.log(`\n⏱️ 要約完了: ${summaryTime}秒\n`);

  // 処理結果を構築
  const results: ProcessResult[] = [];
  let articleIndex = 0;

  for (const fetchResult of fetchResults) {
    if (fetchResult.status === "fetched") {
      const articleCount = fetchResult.pendingArticles.length;
      const articles = allArticles.slice(articleIndex, articleIndex + articleCount);
      articleIndex += articleCount;
      results.push(convertToProcessResult(fetchResult, articles));
    } else {
      results.push(convertToProcessResult(fetchResult, []));
    }
  }

  // すべての記事を1つのファイルに保存
  if (allArticles.length > 0) {
    const fileName = await saveAllArticlesAsMarkdown(outputDir, date, allArticles);
    console.log(`📄 ${fileName} に保存しました`);
  }

  // 結果をステータス別に分類
  const saved = results.filter((r) => r.status === "saved");
  const skipped = results.filter((r) => r.status === "skipped");
  const failed = results.filter((r) => r.status === "failed");

  // サマリーを表示
  const totalTime = ((Date.now() - startFetch) / 1000).toFixed(1);
  console.log("\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(
    `📊 結果: ${saved.length}サイトから ${allArticles.length}件の記事を保存`
  );
  console.log(`   (スキップ ${skipped.length}件 / 失敗 ${failed.length}件)`);
  console.log(`⏱️ 総処理時間: ${totalTime}秒`);
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
