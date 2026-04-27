import type { Config } from "tailwindcss"

/**
 * Tailwind config aligned with docs/design/shared/tokens.css.
 * `darkMode: ['selector', '[data-theme="dark"]']` lets shadcn's `dark:` variants
 * follow the same data-attribute the design prototype toggles.
 */
const config: Config = {
    darkMode: ["selector", '[data-theme="dark"]'],
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        container: {
            center: true,
            padding: "1.5rem",
            screens: {
                "2xl": "1200px",
            },
        },
        extend: {
            colors: {
                // Design tokens (CSS variables defined in app/globals.css)
                bg: "var(--bg)",
                "bg-elev": "var(--bg-elev)",
                "bg-elev-2": "var(--bg-elev-2)",
                surface: "var(--surface)",
                "surface-strong": "var(--surface-strong)",
                hairline: "var(--hairline)",
                "hairline-strong": "var(--hairline-strong)",
                fg: "var(--fg)",
                "fg-strong": "var(--fg-strong)",
                "fg-muted": "var(--fg-muted)",
                "fg-dim": "var(--fg-dim)",
                accent: "var(--accent)",
                "accent-strong": "var(--accent-strong)",
                "accent-soft": "var(--accent-soft)",
                "accent-glow": "var(--accent-glow)",
                cyan: "var(--cyan)",
                indigo: "var(--indigo)",
                violet: "var(--violet)",
                amber: "var(--amber)",
                rose: "var(--rose)",
                // shadcn-compat aliases (consumed by components/ui/*)
                border: "var(--hairline)",
                input: "var(--hairline-strong)",
                ring: "var(--accent)",
                background: "var(--bg)",
                foreground: "var(--fg)",
                primary: {
                    DEFAULT: "var(--accent)",
                    foreground: "var(--fg-strong)",
                },
                secondary: {
                    DEFAULT: "var(--bg-elev-2)",
                    foreground: "var(--fg)",
                },
                destructive: {
                    DEFAULT: "var(--rose)",
                    foreground: "var(--fg-strong)",
                },
                muted: {
                    DEFAULT: "var(--bg-elev)",
                    foreground: "var(--fg-muted)",
                },
                popover: {
                    DEFAULT: "var(--bg-elev)",
                    foreground: "var(--fg)",
                },
                card: {
                    DEFAULT: "var(--bg-elev)",
                    foreground: "var(--fg)",
                },
            },
            borderRadius: {
                lg: "var(--radius-lg)",
                md: "var(--radius)",
                sm: "calc(var(--radius) - 2px)",
            },
            fontFamily: {
                sans: [
                    "var(--font-sans)",
                ],
                mono: [
                    "var(--font-mono)",
                ],
            },
            boxShadow: {
                "card-soft": "var(--shadow-soft)",
                "card-lg": "var(--shadow-lg)",
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
            },
        },
    },
    plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
}
export default config
