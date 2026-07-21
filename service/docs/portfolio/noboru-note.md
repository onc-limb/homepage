---
id: noboru-note
title: のぼるノート
description: ボルダリングの課題を記録・分析するクライミングノートアプリ
longDescription: ボルダリング課題の記録アプリ「のぼるノート」。写真からのホールド抽出や、LLM によるオブザベーション生成・課題生成を備えたクライマー向けプロダクト。
technologies:
    - TypeScript
    - Hono
    - TanStack Start
    - Cloudflare Workers
    - Turso
    - Clerk
    - Swift
    - LLM
role: 設計・開発・運用
period: 2026年〜
highlights:
    - API / モバイル / AI 推論の 3 リポジトリ構成による責務分離
    - 写真からのホールド検出と LLM によるオブザベーション生成
    - Cloudflare Workers 上で動くエッジネイティブな API
category: personal
---

## 概要

ボルダリングの課題（ボルダリングにおける「問題」）を記録・振り返りできるクライミングノートアプリ。壁の写真からホールドを検出し、LLM がムーブ予測・戦略（オブザベーション）や独自課題を生成する AI 機能を備える。

## 背景・課題

自身のクライミング経験から、登った課題の記録や攻略の振り返りを一元的に残せるツールが欲しかった。単なる記録にとどまらず、写真からのホールド抽出や AI によるオブザベーション支援まで踏み込んだプロダクトとして開発している。

## アーキテクチャ

API・認証・データ管理を担う Hono API を中心に、iOS ネイティブアプリと AI 推論サービスが HTTP で連携するマルチリポジトリ構成。API と LP は Cloudflare Workers 上で動作し、データベースはローカル SQLite (WASM) / クラウド Turso を使い分ける。

### コンポーネント

#### API / Web

Hono による API サーバーと TanStack Start による LP。pnpm workspaces のモノレポで型・バリデーションを共有

- TypeScript
- Hono
- TanStack Start
- TypeBox
- Cloudflare Workers
- Turso

#### Mobile

iOS ネイティブアプリ。XcodeGen でプロジェクト定義をコード管理し、Clerk で認証

- Swift
- XcodeGen
- Clerk

#### AI Service

Hono API から呼び出されるステートレスな推論層。ホールド検出と LLM 生成を提供

- LLM
- ホールド検出（bbox / マスク / 代表色 / 相対深度）

## 技術的な工夫

### AI 推論のステートレス分離

AI 推論を専用サービスに切り出し、API・認証・データ管理は Hono API に集約。推論側は「HTTP で呼ばれて結果を返すだけ」のステートレスな層とし、画像合成などの後処理は API 側で行う設計にした。

### 共有パッケージによる型の一元管理

pnpm workspaces のモノレポで、API と Web が使う型定義・バリデーションスキーマ（TypeBox）を shared パッケージに集約。クライアント・サーバー間の契約のズレをビルド時に検出できる。

### Xcode プロジェクトのコード管理

.xcodeproj を git 追跡せず、XcodeGen の project.yml を source of truth とする運用。CI でも生成コマンドを前段に挟み、プロジェクトファイルのコンフリクトを構造的に排除した。

### fail-fast なシークレット管理

Clerk の Publishable Key は gitignore された xcconfig から注入し、プレースホルダのままアプリを起動すると即座に停止する fail-fast 検査を実装。設定漏れが実行時の不可解な挙動になる前に検出できる。

## 課題と解決策

### マルチリポジトリでのドキュメント分散

**課題**: API・モバイル・AI 推論の 3 リポジトリに分かれ、プロダクト全体像や仕様の置き場が分散しがちだった

**解決策**: プロダクトビジョン・ロードマップ・機能仕様・ドメイン用語を組織共通のドキュメントリポジトリに集約し、各リポジトリの README からは参照リンクのみを張る運用に統一した。

## 成果・学び

- ホールド検出 + LLM 生成（オブザベーション・課題生成・チャット）の MVP 機能を設計から実装まで一貫して構築
- エッジ実行（Cloudflare Workers）を前提にした API 設計・データベース選定の知見を獲得
- マルチリポジトリ構成での責務分離とドキュメント集約の運用を確立

## 今後の展望

- LP・記事サイトのパッケージ追加による Web 面の拡充
- Android 対応
- AI 機能（課題生成・チャット）の精度向上と拡張
