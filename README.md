# homepage

onc-limb のホームページ

# 開発環境構築手順

## Frontend 開発環境構築手順

以下の手順を./front で実行すること

1. フロントエンドの依存関係をインストールします。

```
npm install
```

2. 開発サーバーを起動します。

```
npm run dev
```

## Backend 開発環境構築手順

以下の手順を./back で実行すること

1. 必要な docker container を立ち上げます。

```
docker compose up --build
```

## GraphQL スキーマの更新

schema.graphql を修正したら下記コマンドを実行することで、graph パッケージ内のコードを再生成できる。
`go run github.com/99designs/gqlgen generate`
