// 本番ビルドで `@libsql/client`（Node.js 版クライアント）をバンドルから外すための
// 空モジュール。lib/db/index.ts は本番では `@libsql/client/web` だけを使い、
// Node.js 版は開発時の require() でしか読まれない。
// Next.js 15 までは webpack の `resolve.alias` に false を指定していた箇所を、
// Turbopack の `resolveAlias` で置き換えたもの（false 相当の指定が無いため）。
module.exports = {}
