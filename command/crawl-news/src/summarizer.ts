import { GoogleGenAI } from "@google/genai";
import { getGeminiApiKey } from "./config.js";

// Gemini API クライアントの初期化（遅延初期化）
let genAI: GoogleGenAI | null = null;

/**
 * Gemini API クライアントを取得する（シングルトン）
 */
function getGenAI(): GoogleGenAI {
  if (!genAI) {
    genAI = new GoogleGenAI({ apiKey: getGeminiApiKey() });
  }
  return genAI;
}

/**
 * セマフォクラス - 並列実行数を制限する
 */
export class Semaphore {
  private permits: number;
  private waiting: Array<() => void> = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return;
    }
    await new Promise<void>((resolve) => {
      this.waiting.push(resolve);
    });
  }

  release(): void {
    this.permits++;
    const next = this.waiting.shift();
    if (next) {
      this.permits--;
      next();
    }
  }

  /**
   * セマフォで保護された関数を実行する
   */
  async run<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }
}

// グローバルセマフォ（Gemini API の同時実行数を制限）
const summarySemaphore = new Semaphore(5);

/**
 * Gemini APIを使用して記事を要約する
 */
export async function summarizeWithGemini(
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
    const response = await getGenAI().models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "要約を生成できませんでした";
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`   ⚠️ 要約エラー: ${errorMessage}`);
    return "要約の生成に失敗しました";
  }
}

/**
 * API レート制限を考慮した待機
 */
export async function waitForRateLimit(ms: number = 100): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * セマフォで保護された要約処理
 * 同時実行数を制限しながら要約を行う
 */
export async function summarizeWithRateLimit(
  title: string,
  content: string,
  link: string
): Promise<string> {
  return summarySemaphore.run(async () => {
    const result = await summarizeWithGemini(title, content, link);
    // API レート制限を考慮して少し待機
    await waitForRateLimit();
    return result;
  });
}
