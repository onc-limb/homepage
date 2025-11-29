# News Crawler with AI Summary

RSSフィードからニュースを取得し、Gemini 2.5 Flash APIで要約してマークダウンファイルとして出力するツールです。

## 機能

- `feeds.json`に定義されたRSSフィードから記事を取得
- 実行時から24時間以内に更新された記事のみをフィルタリング
- プレリリース（canary, alpha, beta, rc等）を自動除外（リリース系フィードの場合）
- Gemini 2.5 Flash APIを使用して各記事の要約を生成
- マークダウン形式でservice/docs/crawl-news/{日付}/配下に保存

## セットアップ

### 1. 依存関係のインストール

```bash
cd command/crawl-news
pnpm install
```

### 2. 環境変数の設定

`.env` ファイルに Gemini API キーを設定します：

```bash
# .env ファイルを編集
GEMINI_API_KEY=your-api-key-here
```

### 3. Gemini API キーの取得

1. [Google AI Studio](https://aistudio.google.com/apikey) にアクセス
2. 「Create API Key」をクリック
3. 生成されたキーをコピーして `.env` ファイルに設定

### 4. ビルド

```bash
pnpm build
```

## 使用方法

### 本番実行（ビルド後）

```bash
pnpm crawl
# または
pnpm start
```

### 開発時の実行（ビルドなし）

```bash
pnpm dev
```

## 出力

記事は以下のパスに保存されます：

```
service/docs/crawl-news/{YYYY-MM-DD}/{記事ID}.md
```

### マークダウンファイルの構造

```markdown
---
id: abc123def456
title: "記事タイトル"
source: React
category: frontend
type: release
url: https://example.com/article
publishedAt: 2024-01-15T10:00:00Z
fetchedAt: 2024-01-15T12:00:00Z
---

# 記事タイトル

## 基本情報

| 項目 | 内容 |
|------|------|
| ソース | React |
| カテゴリ | frontend |
| 種別 | release |
| 公開日時 | 2024/01/15 19:00 |
| URL | https://example.com/article |

## 要約

AIが生成した要約文がここに入ります。

## 元の内容

RSSフィードから取得した元の内容がここに入ります。
```

## feeds.json の設定

`feeds.json` でRSSフィードを設定できます：

```json
{
  "feeds": [
    {
      "name": "フィード名",
      "url": "https://example.com/feed.xml",
      "category": "frontend",
      "type": "blog",
      "description": "フィードの説明",
      "requiresUserAgent": false
    }
  ]
}
```

### プロパティ

| プロパティ | 必須 | 説明 |
|-----------|------|------|
| name | ✅ | フィードの表示名 |
| url | ✅ | RSSフィードのURL |
| category | ❌ | カテゴリ（frontend, backend, infrastructure, ai, general等） |
| type | ❌ | タイプ（release, blog, newsletter, news, aggregator） |
| description | ❌ | フィードの説明 |
| requiresUserAgent | ❌ | User-Agentヘッダーが必要な場合はtrue |

### typeによるフィルタリング

- `release`: プレリリースを除外し、安定版リリースのみ取得
- `blog`, `newsletter`, `news`, `aggregator`: 24時間以内の記事をすべて取得

## 注意事項

- Gemini APIには利用制限があります。大量の記事を処理する場合は注意してください
- 各記事の要約生成間に500msの待機時間を設けています
- APIキーは環境変数として管理し、コードにハードコードしないでください
