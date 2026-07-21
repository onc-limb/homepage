---
name: Go
category: language
level: 3
publish: true
---

## 経験

### 業務

- Gin を用いた Web サーバーの構築、GORM による DB 操作
- DB から OpenSearch へ定期的にデータを整形しながら投入するバッチ処理の実装
- goroutine 並列バッチの並行数チューニング（チャネルの最大数調整による処理効率の改善）

### 個人

- Echo を用いた API サーバーの構築（複数の AI 機能を利用する個人サービスのオーケストレーション）
- Docker マルチプラットフォームビルドへの対応（platform 不一致で実行ファイルが認識されない問題の解決とビルドプロセスの整備）
- Air を利用したホットリロード開発環境の構築

## 知識

- 基本文法と設計思想
- Interface を利用した関数の再利用・抽象化
- goroutine / チャネルによる並行処理（並行数と処理効率のトレードオフ）
- go get / go install による依存管理、go tool によるプロジェクト内ツール管理
- コンパイル済みバイナリを Docker コンテナで動かす際のプラットフォーム指定

## 関連技術

- Gin
- Echo
- GORM
- OpenSearch
- Docker
