import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";
import type { Config } from "./types.js";

// .env ファイルを読み込む
dotenv.config();

/**
 * Gemini API キーを取得する
 * 環境変数が設定されていない場合はエラーを投げる
 */
export function getGeminiApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY 環境変数が設定されていません");
    console.error("   .env ファイルに GEMINI_API_KEY を設定してください");
    process.exit(1);
  }
  return apiKey;
}

/**
 * 設定ファイルを読み込む
 */
export async function loadConfig(): Promise<Config> {
  const configPath = path.join(import.meta.dirname, "..", "feeds.json");
  const configData = await fs.readFile(configPath, "utf-8");
  return JSON.parse(configData) as Config;
}
