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
 * レート制限に対応したモデルの順番
 * レートリミットエラーが発生した場合、この順番で次のモデルにフォールバックする
 */
const MODEL_FALLBACK_ORDER = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
] as const;

/**
 * エラーがレートリミットエラーかどうかを判定する
 */
function isRateLimitError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  const message = error.message.toLowerCase();
  return (
    message.includes("rate limit") ||
    message.includes("quota") ||
    message.includes("429") ||
    message.includes("resource exhausted")
  );
}

/**
 * Gemini APIを使用して記事を要約する（モデル指定版）
 */
async function summarizeWithModel(
  title: string,
  content: string,
  link: string,
  model: string
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

  const response = await getGenAI().models.generateContent({
    model,
    contents: prompt,
  });

  return response.text || "要約を生成できませんでした";
}

/**
 * Gemini APIを使用して記事を要約する（レートリミット対応）
 * レートリミットエラーが発生した場合、次のモデルにフォールバックする
 */
export async function summarizeWithGemini(
  title: string,
  content: string,
  link: string
): Promise<string> {
  let lastError: Error | null = null;

  for (let i = 0; i < MODEL_FALLBACK_ORDER.length; i++) {
    const model = MODEL_FALLBACK_ORDER[i];
    try {
      const result = await summarizeWithModel(title, content, link, model);
      
      // 最初のモデル以外で成功した場合はログ出力
      if (i > 0) {
        console.log(`   ✅ フォールバック成功: ${model} を使用`);
      }
      
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown error");
      
      // レートリミットエラーの場合
      if (isRateLimitError(error)) {
        // 最後のモデルでない場合は次のモデルを試す
        if (i < MODEL_FALLBACK_ORDER.length - 1) {
          console.log(`   ⚠️ レートリミット: ${model} -> ${MODEL_FALLBACK_ORDER[i + 1]} にフォールバック`);
          continue;
        } else {
          // 最後のモデルでもレートリミットエラーの場合
          console.error(`   ❌ すべてのモデルでレートリミット: ${lastError.message}`);
          return "要約の生成に失敗しました（レートリミット）";
        }
      } else {
        // レートリミット以外のエラーの場合は即座に失敗
        console.error(`   ⚠️ 要約エラー (${model}): ${lastError.message}`);
        return "要約の生成に失敗しました";
      }
    }
  }

  // ここには到達しないはずだが、念のため
  const errorMessage = lastError?.message || "Unknown error";
  console.error(`   ⚠️ 要約エラー: ${errorMessage}`);
  return "要約の生成に失敗しました";
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
