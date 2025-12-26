import type { Config } from "tailwindcss"
const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
                "watercolor-gradient":
                    "linear-gradient(135deg, hsl(195, 30%, 98%) 0%, hsl(185, 40%, 95%) 50%, hsl(195, 30%, 98%) 100%)",
            },
            colors: {
                // 水彩ヤモリロゴベースのカラーパレット
                turquoise: {
                    50: "#F0FAFA",
                    100: "#D4F3F3",
                    200: "#A9E6E6",
                    300: "#7DD9D9",
                    400: "#52CCCC",
                    500: "#299E9E" /* メインターコイズ */,
                    600: "#218080",
                    700: "#196262",
                    800: "#114444",
                    900: "#092626",
                },
                terracotta: {
                    50: "#FDF6F3",
                    100: "#FAE9E1",
                    200: "#F5D3C4",
                    300: "#EDBDA6",
                    400: "#E5A789",
                    500: "#C87746" /* メインテラコッタ */,
                    600: "#A55F38",
                    700: "#82482A",
                    800: "#5F311C",
                    900: "#3C1A0E",
                },
                watercolor: {
                    light: "#F8FBFC",
                    blue: "#B8D4E3",
                    mist: "#E8F0F5",
                },
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
            },
            letterSpacing: {
                elegant: "0.03em",
                "wide-elegant": "0.08em",
            },
            transitionDuration: {
                "250": "250ms",
            },
            boxShadow: {
                soft: "0 2px 15px -3px rgba(41, 158, 158, 0.1), 0 4px 6px -4px rgba(41, 158, 158, 0.05)",
                card: "0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)",
            },
        },
    },
    plugins: [require("@tailwindcss/typography")],
}
export default config
