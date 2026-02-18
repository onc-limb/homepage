import type { Article, ProcessResult, PendingArticle } from "./types.js";
import { loadConfig } from "./config.js";
import { db, news } from "./db.js";
import { sql } from "drizzle-orm";
import {
  fetchAllFeeds,
  summarizeAllArticles,
  convertToProcessResult,
  MAX_SUMMARY_COUNT,
} from "./processor.js";

/**
 * 日本時間（JST）の日付を YYYY-MM-DD 形式で取得する
 */
function getJSTDateString(): string {
  const now = new Date();
  const jstDate = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jstDate.toISOString().split("T")[0];
}

/**
 * メイン処理
 */
async function main(): Promise<void> {
  console.log("🚀 ニュースクローラー（要約付き）を開始します...\n");

  // 設定を読み込む
  const config = await loadConfig();
  console.log(`📋 ${config.feeds.length}件のフィードを取得します\n`);

  const crawlDate = getJSTDateString();

  // DB メンテナンス: 3ヶ月以上前のレコードを削除
  await db.run(sql`DELETE FROM news WHERE crawl_date < date('now', '-3 months')`);
  console.log("🗑️ 3ヶ月以上前のレコードを削除しました\n");

  // DB メンテナンス: 31日以上前のレコードの isPublished を false に更新
  await db.run(sql`UPDATE news SET is_published = 0 WHERE crawl_date < date('now', '-31 days') AND is_published = 1`);
  console.log("📅 31日以上前のレコードを非公開にしました\n");

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

  // 記事をDBに保存
  if (allArticles.length > 0) {
    let insertedCount = 0;
    for (const article of allArticles) {
      const result = await db.insert(news).values({
        title: article.title,
        source: article.source,
        url: article.link,
        summary: article.summary || null,
        publishedAt: article.publishedAt,
        crawlDate,
        isPublished: true,
      }).onConflictDoNothing();
      if (result.rowsAffected > 0) {
        insertedCount++;
      }
    }
    console.log(`💾 ${insertedCount}件の記事をDBに保存しました（${allArticles.length - insertedCount}件は重複のためスキップ）`);
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
    `📊 結果: ${saved.length}サイトから ${allArticles.length}件の記事を処理`
  );
  console.log(`   (スキップ ${skipped.length}件 / 失敗 ${failed.length}件)`);
  console.log(`⏱️ 総処理時間: ${totalTime}秒`);
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
