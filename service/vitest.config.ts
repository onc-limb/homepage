import { defineConfig } from "vitest/config"
import path from "node:path"
import fs from "node:fs"

/**
 * Vitest config for the service/ Next.js app.
 *
 * The production code uses webpack-specific features that Vite/Vitest does
 * not natively understand:
 *  - `import x from "./foo.md"` (next.config.mjs registers `.md` as `asset/source`)
 *  - `require.context` for dynamic markdown loading
 *
 * This config compensates with two small inline plugins:
 *  - markdown-as-raw: transforms `.md` imports into a default-exported string
 *  - require-context-stub: rewrites top-level `require.context(...)` calls so
 *    test files can import modules that use it without crashing at evaluation
 *    time. Tests that need real markdown content should stub the relevant
 *    module via `vi.mock(...)`.
 */
export default defineConfig({
    plugins: [
        {
            name: "markdown-as-raw",
            enforce: "pre",
            load(id) {
                const cleanId = id.split("?")[0]
                if (cleanId.endsWith(".md")) {
                    const source = fs.readFileSync(cleanId, "utf-8")
                    return `export default ${JSON.stringify(source)}`
                }
                return undefined
            },
        },
        {
            name: "require-context-stub",
            enforce: "pre",
            transform(code, id) {
                if (!/\.(t|j)sx?$/.test(id)) return undefined
                if (!code.includes("require.context")) return undefined
                // Replace `require.context(...)` with a no-op stub returning a
                // function that has a `.keys()` method. Tests must `vi.mock`
                // any module that depends on real markdown loading.
                const replaced = code.replace(
                    /require\.context\([^)]*\)/g,
                    "(Object.assign(() => '', { keys: () => [] }))"
                )
                if (replaced === code) return undefined
                return { code: replaced, map: null }
            },
        },
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./"),
        },
    },
    test: {
        environment: "node",
        globals: true,
        include: ["lib/**/*.test.ts", "components/**/*.test.{ts,tsx}"],
        css: false,
    },
})
