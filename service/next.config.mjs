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
    webpack: (config) => {
        config.module.rules.push({
            test: /\.md$/,
            type: 'asset/source',
        });

        // 本番ビルドでは @libsql/client (Node.js版) をバンドルから除外
        // ローカル開発時のみ require() で読み込まれる
        // $ 付きで完全一致のみマッチし、@libsql/client/web には影響しない
        if (process.env.NODE_ENV === 'production') {
            config.resolve.alias = {
                ...config.resolve.alias,
                '@libsql/client$': false,
            };
        }

        return config;
    },
};
export default nextConfig;
