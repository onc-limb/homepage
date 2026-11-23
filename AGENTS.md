# AGENTS.md - AI エージェント向けガイドライン

このドキュメントは、AI エージェントがこのプロジェクトで作業する際のガイドラインを定義します。

## ビルド・開発コマンドの実行

ビルドや開発サーバーの起動時は、**必ず `/service` ディレクトリに移動してから**コマンドを実行してください。

```bash
# 正しい手順
cd service
pnpm dev      # 開発サーバー起動
pnpm build    # プロダクションビルド
pnpm lint     # Lint チェック
pnpm test     # vitest
pnpm preview  # OpenNext でビルドして Cloudflare Workers のプレビュー
pnpm deploy   # Cloudflare Workers へデプロイ（本番。エージェントは実行しない）
```

**注意**: ルートディレクトリからではなく、必ず `service/` ディレクトリ内でコマンドを実行してください。

## パッケージマネージャー

このプロジェクトは **pnpm** を使用しています。

```bash
# パッケージのインストール
cd service
pnpm install

# 新しいパッケージの追加
pnpm add <package-name>

# 開発用パッケージの追加
pnpm add -D <package-name>
```

## ディレクトリ構成

- `/service` - メインの Next.js アプリケーション
- `/command` - CLI ツール（ニュースクロール等）
- `/docs` - ドキュメント

## 開発フロー

1. `cd service` でサービスディレクトリに移動
2. `pnpm install` で依存関係をインストール
3. `pnpm dev` で開発サーバーを起動
4. コード変更後は `pnpm exec tsc --noEmit`・`pnpm test`・`pnpm lint` を通す
5. `pnpm build` でビルドが通ることを確認

## worklog / ToDo の記録

- worklog・ToDo の記録ルールはグローバル `~/.codex/AGENTS.md` の
  「worklog イベント記録」「ToDo 台帳との突き合わせ」に従う。
- このリポジトリの project id は `homepage`。`record_milestone` / `record_blocker` /
  `todo.py` の `--project` にはこの id を使う。
