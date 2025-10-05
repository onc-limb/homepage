# GitHub Copilot Agent Instructions

このファイルは、homepage プロジェクトをコーディングする際に GitHub Copilot Agent が守るべきルールセットを定義します。

## ディレクトリ構成

```
.
├── .github/                    # GitHub設定ファイル
│   └── copilot-instructions.md # このファイル
├── .gitignore                  # Git除外設定
├── .vscode/                    # VS Code設定
│   └── setting.json
├── README.md                   # プロジェクト説明
├── docker-compose.yml          # Docker構成
└── service/                    # メインのNext.jsアプリケーション
    ├── .eslintignore           # ESLint除外設定
    ├── .eslintrc.json          # ESLintルール
    ├── .gitignore              # サービス固有のGit除外設定
    ├── .prettierrc             # Prettierフォーマット設定
    ├── .yarnrc.yml             # Yarn設定
    ├── README.md               # サービス説明
    ├── app/                    # Next.js App Router
    │   ├── articles/           # 記事関連ページ
    │   │   ├── [title]/        # 動的記事詳細ページ
    │   │   │   └── page.tsx
    │   │   └── page.tsx        # 記事一覧ページ
    │   ├── favicon.ico         # ファビコン
    │   ├── globals.css         # グローバルスタイル
    │   ├── knowledges/         # ナレッジ関連ページ
    │   │   ├── [slug]/         # 動的ナレッジ詳細ページ
    │   │   │   └── page.tsx
    │   │   └── page.tsx        # ナレッジ一覧ページ
    │   ├── layout.tsx          # ルートレイアウト
    │   ├── page.tsx            # トップページ
    │   ├── portfolio/          # ポートフォリオ関連ページ
    │   │   ├── climbing-shoes-library/
    │   │   │   └── page.tsx
    │   │   └── page.tsx        # ポートフォリオ一覧
    │   └── profile/            # プロフィールページ
    │       └── page.tsx
    ├── components/             # Reactコンポーネント
    │   ├── ComingSoon.tsx      # Coming Soonコンポーネント
    │   ├── HeaderButton.tsx    # ヘッダーボタンコンポーネント
    │   ├── articleList.tsx     # 記事一覧コンポーネント
    │   ├── footer.tsx          # フッターコンポーネント
    │   ├── header.tsx          # ヘッダーコンポーネント
    │   ├── knowledgeList.tsx   # ナレッジ一覧コンポーネント
    │   └── ui/                 # shadcn/uiコンポーネント
    │       ├── avatar.tsx
    │       ├── button.tsx
    │       ├── card.tsx
    │       ├── dropdown-menu.tsx
    │       ├── navigation-menu.tsx
    │       └── pagination.tsx
    ├── components.json         # shadcn/ui設定
    ├── lib/                    # ユーティリティライブラリ
    │   ├── article.ts          # 記事取得ロジック
    │   ├── knowledge.ts        # ナレッジ取得ロジック
    │   └── utils.ts            # 共通ユーティリティ
    ├── next.config.mjs         # Next.js設定
    ├── package.json            # 依存関係とスクリプト
    ├── postcss.config.js       # PostCSS設定
    ├── public/                 # 静的ファイル
    │   └── MainLogo.jpg        # メインロゴ
    ├── tailwind.config.js      # Tailwind CSS設定
    ├── tailwind.config.ts      # Tailwind CSS設定（TypeScript）
    ├── tsconfig.json           # TypeScript設定
    └── yarn.lock               # Yarn依存関係ロックファイル
```

## 使用技術

### フレームワーク・ライブラリ

- **Next.js**: `15.3.2` - React フレームワーク（App Router 使用）
- **React**: `18` - UI ライブラリ
- **TypeScript**: `5.5.4` - 型安全な JavaScript

### スタイリング

- **Tailwind CSS**: `3.4.3` - ユーティリティファースト CSS フレームワーク
- **shadcn/ui**: UI コンポーネントライブラリ（Radix UI ベース）
- **@tailwindcss/typography**: `0.5.16` - 文章コンテンツ用スタイル
- **tailwindcss-animate**: `1.0.7` - アニメーションユーティリティ

### UI コンポーネント

- **@radix-ui/react-avatar**: `1.0.4`
- **@radix-ui/react-dropdown-menu**: `2.0.6`
- **@radix-ui/react-navigation-menu**: `1.1.4`
- **@radix-ui/react-slot**: `1.1.0`
- **lucide-react**: `0.368.0` - アイコンライブラリ

### マークダウン処理

- **react-markdown**: `9.0.1` - Markdown レンダリング
- **remark-gfm**: `4.0.0` - GitHub Flavored Markdown
- **gray-matter**: `4.0.3` - Frontmatter 解析

### 開発・ビルドツール

- **ESLint**: `8` - コード品質チェック
- **Prettier**: `3.2.5` - コードフォーマッター
- **Yarn**: `4.4.0` - パッケージマネージャー（Corepack 使用）

## 使用するツール

### OSS ライブラリ調査

- **deepwiki MCP** を使用してオープンソースライブラリの詳細情報、使用方法、ベストプラクティスを調査する

### 最新情報取得

- **context7 MCP** を使用して最新の技術情報、アップデート情報、セキュリティ情報を取得する

### 開発タスク別ツール使用指針

#### コンポーネント開発時

- shadcn/ui の既存コンポーネントを最大限活用する
- 新しいコンポーネントが必要な場合は、既存のデザインシステムに準拠する
- Tailwind CSS を使用してレスポンシブデザインを実装する

#### ページ開発時

- Next.js App Router のパターンに従う
- 動的ルート（`[param]`）を適切に使用する
- レイアウトコンポーネントを有効活用する

#### データ取得時

- GitHub API を使用した記事・ナレッジの取得パターンを踏襲する
- `lib/` ディレクトリの既存ユーティリティを活用する

#### スタイリング時

- Tailwind CSS のユーティリティクラスを優先する
- カスタム CSS は最小限に留める
- ダークモード対応を考慮する

### ビルド・デプロイ

- **ビルドコマンド**: `yarn build` または `wrangler pages deploy` でビルド
- **デプロイ先**: Cloudflare Pages
- **デプロイツール**: Wrangler CLI を使用
- `wrangler.jsonc` に Cloudflare 関連の設定が記載されている
- `open-next.config.ts` で Cloudflare Workers 向けの Next.js 設定を管理

### コード品質管理

- ESLint ルールに従ったコードを書く
- Prettier によるフォーマットを適用する
- TypeScript の型安全性を維持する
- 既存のコードスタイルと一貫性を保つ

#### ESLint フォーマット指針

- **空行ルール**: 複数の空行は禁止（`no-multiple-empty-lines`）- 空行は最大 1 行まで
- **インデント**: React JSX は 4 スペースインデント、JSX プロパティは 6 スペースインデント
- **自動修正**: コード編集後は必ず `npx eslint . --fix` で自動修正を実行する
- **Lint チェック**: 作業完了前に `npm run lint` でエラーがないことを確認する
- **コード生成時の注意**: 新しいコンポーネントやファイル作成時は、既存ファイルのフォーマットパターンに従う
