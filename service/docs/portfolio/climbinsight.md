---
id: climbinsight
updatedAt: "2026-07-14T19:55:38+09:00"
title: ClimbInsight
description: Segment Anything Model を活用したクライミング画像解析 Web アプリ
longDescription: クライミング画像の解析・セグメンテーション機能を持つ Web アプリケーション。SAM（Segment Anything Model）でクライミングルートやホールドを自動認識する。
technologies:
    - Next.js
    - Go
    - Python
    - SAM
    - Supabase
    - MinIO / R2
    - Docker
role: 設計・開発
period: 2025年〜
highlights:
    - SAM によるホールド・ルートの自動セグメンテーション
    - Next.js / Go / Python のポリグロット 3 層構成
    - S3 互換ストレージによるローカル・本番の環境差吸収
category: personal
---

## 概要

クライミングジムの壁画像を解析し、ホールドやルートを自動認識する Web アプリケーション。Meta の Segment Anything Model (SAM) を推論エンジンに採用し、画像セグメンテーションをクライミングというドメインに適用した。

## 背景・課題

クライミング画像からホールドを人手でマークするのは手間が大きい。汎用のセグメンテーションモデルである SAM をクライミング画像に適用することで、ルート・ホールド認識を自動化できないかを検証・実装するために開発した。

## アーキテクチャ

ブラウザ → Next.js フロントエンド → Go API サーバー → Python AI サービスという 3 層構成。永続化は Supabase PostgreSQL、認証は Supabase Auth（Google OAuth）、画像ストレージは S3 互換の MinIO / R2 を利用する。

### コンポーネント

#### Frontend

Next.js による Web フロントエンド

- Next.js 15
- React 19
- Tailwind CSS 4

#### API Server

ビジネスロジックと永続化を担う Go サーバー

- Go
- Gin
- GORM
- Supabase PostgreSQL

#### AI Service

SAM を動かす Python 推論サービス

- Python 3.13
- Quart
- SAM (Segment Anything Model)

#### Storage / Auth

画像ストレージと認証基盤

- MinIO / Cloudflare R2
- Supabase Auth

## 技術的な工夫

### レイヤーごとの言語最適化

Web フロントは Next.js、API は Go、機械学習推論は Python と、各レイヤーに適した言語・エコシステムを選択。サービス間は HTTP で疎結合に連携させ、AI サービスの差し替えを容易にした。

### S3 互換ストレージによる環境差の吸収

画像ストレージを S3 互換 API に統一し、ローカル開発は MinIO、本番は Cloudflare R2 という構成でコードを変えずに環境を切り替えられるようにした。

### Supabase によるローカル開発体験

Supabase CLI のローカルエミュレータで DB・認証をローカル完結させ、Makefile にセットアップから起動までのコマンドを集約してオンボーディングコストを下げた。

## 課題と解決策

### 過剰設計だった非同期構成の見直し

**課題**: 当初 Redis + ポーリング + gRPC の非同期構成を検討していたが、実装が複雑化し未使用コードが残っていた

**解決策**: Supabase RDB + HTTP REST のシンプルな同期構成へ移行し、旧構成の残骸（未参照 DTO・Redis サービス・gRPC 生成ターゲット）をドキュメントも含めて棚卸し・削除。実装と設計記録の乖離を解消した。

## 成果・学び

- SAM をアプリケーションに組み込む一連の流れ（推論 API 化・画像ストレージ連携）を実装で習得
- Go / Python / TypeScript を組み合わせたポリグロット構成の設計・運用経験を獲得
- 「まず作って、複雑さが割に合わなければ簡素化する」設計判断の記録と実践

## 今後の展望

- セグメンテーション結果を使ったルート記録・共有機能の拡充
- 推論の高速化とモデルの軽量化
