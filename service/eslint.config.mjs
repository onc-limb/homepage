import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import prettier from "eslint-config-prettier/flat"
import importPlugin from "eslint-plugin-import"
import react from "eslint-plugin-react"

// Next.js 16 で `next lint` が削除されたため、.eslintrc.json を
// flat config へ移行したもの。ルールの内容は移行前と同じ。
const eslintConfig = defineConfig([
    ...nextVitals,
    prettier,
    {
        files: ["**/*.{js,jsx,mjs,cjs,ts,tsx}"],
        plugins: {
            import: importPlugin,
            react,
        },
        rules: {
            "import/no-unresolved": "off",
            "import/named": "off",
            "import/namespace": "off",
            "import/default": "off",
            "import/export": "error",
            "no-multiple-empty-lines": ["error", { max: 1 }],
            "react/jsx-indent": ["error", 4],
            "react/jsx-indent-props": ["error", 4],
        },
    },
    // `next lint` は対象ディレクトリを限定していたが、ESLint CLI はリポジトリ全体を
    // 走査するため、ビルド生成物（.gitignore と同じ範囲）を明示的に除外する。
    globalIgnores([
        ".next/**",
        "out/**",
        "build/**",
        "coverage/**",
        ".open-next/**",
        ".wrangler/**",
        "next-env.d.ts",
    ]),
])

export default eslintConfig
