---
name: Python
category: language
level: 4
publish: true
---

## 経験

### 業務

- AWS SageMaker を前提とした MLOps 環境構築（Python SDK による AWS リソース構築、学習パイプライン・デプロイパイプラインの構築）
- AI 検索アプリ（RAG / Agentic Search）の API サーバー構築（FastAPI）
- Google ADK / Strands Agents を利用した AI エージェント構築
- uv によるマルチプロジェクトの依存管理
- PyTorch 学習コードのリーディングによる学習処理の理解（モデル構築は担当外）

### 個人

- FastAPI 推論バックエンドのデプロイ単位分割（GPU 推論と LLM 呼び出しの分離、Modal / Cloud Run へのデプロイ）
- ruff / mypy による静的解析・型チェックの運用
- SAM（Segment Anything Model）を利用した画像処理の試行

## 知識

- 基本文法
- 型ヒントと Pydantic によるバリデーション
- 動的型付けゆえの型制約の限界（ライブラリの型定義が薄く Any が増えやすい）
- インタプリタ言語としての実行モデル（ML 系 CPU バウンド処理の実体は C++ 実装）
- uv による依存管理・マルチプロジェクト運用
- pip + requirements.txt による依存管理
- FastAPI のアプリファクトリパターンによる構成分割

## 関連技術

- FastAPI
- PyTorch
- AWS SageMaker
- Google ADK
- RAG
