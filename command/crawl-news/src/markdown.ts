import fs from "fs/promises";
import path from "path";
import type { Article } from "./types.js";

/**
 * すべての記事を1つのマークダウンファイルとして保存する
 */
export async function saveAllArticlesAsMarkdown(
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

  // 要約ありの記事
  const summarizedArticles = allArticles.filter((a) => !a.summaryOnly);
  // 要約なしの記事
  const titleOnlyArticles = allArticles.filter((a) => a.summaryOnly);

  for (const article of summarizedArticles) {
    markdown += `## ${article.title}

**ソース:** ${article.source}

${article.summary}

🔗 [記事を読む](${article.link})

---

`;
  }

  // 要約なしの記事がある場合
  if (titleOnlyArticles.length > 0) {
    markdown += `## その他の記事

以下は本日の追加記事です（要約なし）:

`;

    for (const article of titleOnlyArticles) {
      markdown += `- [${article.title}](${article.link}) (${article.source})
`;
    }

    markdown += `
---

`;
  }

  await fs.writeFile(filePath, markdown, "utf-8");
  return fileName;
}
