---
id: portfolio-site
updatedAt: "2025-12-26T20:10:09+09:00"
title: ポートフォリオサイト
description: Next.js と Tailwind CSS で構築した個人ポートフォリオサイト
longDescription: フルスタックエンジニアとしての技術力をアピールするためのポートフォリオサイト。毎日の技術ニュースをAIで要約する機能も搭載。
technologies:
    - Next.js
    - TypeScript
    - Tailwind CSS
    - Cloudflare Pages
    - OpenAI API
role: 設計・開発・運用
period: 2024年〜
highlights:
    - App Router を使った SSG/ISR の実装
    - Cloudflare Pages へのデプロイ
    - 技術ニュースのAI要約機能
category: personal
links:
    github: https://github.com/onc-limb/homepage
---

## 概要

フリーランスエンジニアとしてのスキルや実績をアピールするためのポートフォリオサイト。単なる静的サイトではなく、毎日の技術ニュースを自動収集・AI要約する機能を持つ。

## 背景・課題

フルスタックエンジニアとして、フロントエンドからバックエンド、インフラまで一貫して対応できることを示すために、実際に動くプロダクトとしてポートフォリオサイトを構築。

## アーキテクチャ

Next.js の App Router を採用し、SSG（静的サイト生成）をベースとした高速なサイトを実現。Cloudflare Pages でホスティングし、エッジでの配信により低レイテンシを実現。

### コンポーネント

#### Frontend

Next.js App Router によるReactアプリケーション

- Next.js 15
- React 18
- TypeScript
- Tailwind CSS

#### Hosting

Cloudflare Pages によるエッジ配信

- Cloudflare Pages
- Cloudflare Workers

#### News Aggregation

技術ニュースの自動収集とAI要約

- Node.js
- OpenAI API
- GitHub Actions

## 技術的な工夫

### App Router による最適化

Next.js 15 の App Router を採用し、Server Components を活用してバンドルサイズを最小化。必要な部分のみ Client Components として実装。

### Cloudflare Pages でのデプロイ

Vercel ではなく Cloudflare Pages を選択し、エッジでの配信とコスト最適化を実現。open-next を使用した互換性の確保。

### 技術ニュースの自動収集

GitHub Actions で毎日定時に RSS フィードから技術ニュースを収集し、OpenAI API で要約を生成。Markdown ファイルとしてリポジトリにコミット。

## 課題と解決策

### Cloudflare Pages での Next.js App Router の互換性

**課題**: Next.js App Router と Cloudflare Pages の互換性問題

**解決策**: open-next パッケージを使用し、Cloudflare Workers 向けにビルドを最適化。wrangler.jsonc での適切な設定。

### AI要約の品質とコスト

**課題**: AI要約の品質維持とAPIコストのバランス

**解決策**: プロンプトエンジニアリングによる要約品質の向上と、適切なトークン制限によるコスト管理。

## 成果・学び

- ミニマルなデザインで読みやすいポートフォリオサイトを構築
- 毎日の技術ニュース収集により、継続的な学習習慣を確立
- Cloudflare Pages により高速かつ低コストなホスティングを実現

## 今後の展望

- お問い合わせフォームの追加
- ダークモード/ライトモードの切り替え
- より詳細なプロジェクト紹介ページの充実
