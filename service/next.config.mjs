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
            use: 'raw-loader',
        });

        return config;
    },
};
export default nextConfig;
