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
pnpm preview  # Cloudflare Pages プレビュー
pnpm deploy   # Cloudflare Pages デプロイ
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
4. コード変更後は `pnpm lint` でエラーチェック
5. `pnpm build` でビルドが通ることを確認
