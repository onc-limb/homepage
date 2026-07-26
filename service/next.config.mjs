const isProduction = process.env.NODE_ENV === 'production'

/** @type {import('next').NextConfig} */
const nextConfig = {
    outputFileTracingIncludes: {
        '/*': [
            './node_modules/.pnpm/@libsql+isomorphic-ws@*/node_modules/@libsql/isomorphic-ws/web.mjs',
            './node_modules/.pnpm/@libsql+isomorphic-ws@*/node_modules/@libsql/isomorphic-ws/web.cjs',
        ],
    },
    images: {
        unoptimized: true,
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**",
            },
            {
                protocol: "http",
                hostname: "**",
            },
        ],
    },
    // Next.js 16 から Turbopack が dev/build の既定になったため、
    // webpack のカスタム設定を Turbopack の同等機能へ移行している。
    turbopack: {
        rules: {
            // webpack の `type: 'asset/source'` 相当（Markdown を文字列として import する）
            '*.md': {
                loaders: ['./loaders/markdown-raw-loader.cjs'],
                as: '*.js',
            },
        },
        // 本番ビルドでは @libsql/client (Node.js版) をバンドルから除外
        // ローカル開発時のみ require() で読み込まれる
        // `@libsql/client/web` は別キー扱いなので影響しない
        ...(isProduction
            ? {
                resolveAlias: {
                    '@libsql/client': './loaders/empty-module.js',
                },
            }
            : {}),
    },
};
export default nextConfig;
