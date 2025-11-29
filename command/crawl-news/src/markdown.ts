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
