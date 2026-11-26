import type { Config } from "tailwindcss"
import typography from "@tailwindcss/typography"
import tailwindcssAnimate from "tailwindcss-animate"

/**
 * The only Tailwind config. `darkMode: ["selector", '[data-theme="dark"]']` lets
 * the `dark:` variants follow the same data attribute the theme toggle sets.
 */
const config: Config = {
    darkMode: ["selector", '[data-theme="dark"]'],
    content: [
        "./pages/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./app/**/*.{ts,tsx}",
        "./src/**/*.{ts,tsx}",
    ],
    prefix: "",
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
                bg: "var(--bg)",
                "bg-elev": "var(--bg-elev)",
                "bg-elev-2": "var(--bg-elev-2)",
                surface: "var(--surface)",
                "surface-strong": "var(--surface-strong)",
                // Solid (opaque, gradient-free) surface fills for cards/panels.
                // See docs/background-audit.md §(i).
                "surface-solid": "var(--surface-solid)",
                "surface-solid-strong": "var(--surface-solid-strong)",
                hairline: "var(--hairline)",
                "hairline-strong": "var(--hairline-strong)",
                // Opaque border tokens for the glassmorphism removal.
                "hairline-solid": "var(--hairline-solid)",
                "hairline-solid-strong": "var(--hairline-solid-strong)",
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
                ds: {
                    "bg": "var(--ds-bg)",
                    "surface": "var(--ds-surface)",
                    "fg": "var(--ds-fg)",
                    "fg-muted": "var(--ds-fg-muted)",
                    "border": "var(--ds-border)",
                    "border-strong": "var(--ds-border-strong)",
                    "accent": "var(--ds-accent)",
                    "on-accent": "var(--ds-on-accent)",
                    "prompt": "var(--ds-prompt)",
                    "link": "var(--ds-link)",
                    "map-wood": "var(--ds-map-wood)",
                    "map-wood-joint": "var(--ds-map-wood-joint)",
                    "map-wood-wall": "var(--ds-map-wood-wall)",
                    "map-wood-shade": "var(--ds-map-wood-shade)",
                    "map-stone": "var(--ds-map-stone)",
                    "map-stone-joint": "var(--ds-map-stone-joint)",
                    "map-stone-wall": "var(--ds-map-stone-wall)",
                    "map-stone-shade": "var(--ds-map-stone-shade)",
                    "map-deck": "var(--ds-map-deck)",
                    "map-deck-joint": "var(--ds-map-deck-joint)",
                    "map-corridor": "var(--ds-map-corridor)",
                    "map-lit": "var(--ds-map-lit)",
                    "map-slab": "var(--ds-map-slab)",
                    "map-tree-1": "var(--ds-map-tree-1)",
                    "map-tree-2": "var(--ds-map-tree-2)",
                    "map-trunk": "var(--ds-map-trunk)",
                    "map-hill": "var(--ds-map-hill)",
                },
            },
            // Design system namespace (docs/design-system.md §3). Values live in
            // app/globals.css as --ds-* custom properties.
            fontFamily: {
                ds: "var(--ds-font)",
                "ds-prose": "var(--ds-font-prose)",
            },
            fontSize: {
                "ds-sm": "var(--ds-text-sm)",
                "ds-base": "var(--ds-text-base)",
                "ds-lg": "var(--ds-text-lg)",
                "ds-xl": "var(--ds-text-xl)",
            },
            lineHeight: {
                ds: "var(--ds-leading)",
                "ds-prose": "var(--ds-leading-prose)",
            },
            spacing: {
                "ds-1": "var(--ds-space-1)",
                "ds-2": "var(--ds-space-2)",
                "ds-3": "var(--ds-space-3)",
                "ds-4": "var(--ds-space-4)",
                "ds-5": "var(--ds-space-5)",
                // 40px page gutter built from existing tokens (24px + 16px).
                "ds-page-gutter": "calc(var(--ds-space-4) + var(--ds-space-3))",
            },
            maxWidth: {
                "ds-page": "var(--ds-page-max)",
                "ds-measure": "var(--ds-measure)",
                "ds-map": "762px",
                "ds-map-small": "358px",
            },
            gridTemplateColumns: {
                "ds-kv": "max-content minmax(0, 1fr)",
                // LogList row: date, identifier, title.
                "ds-log": "7.5em 11em minmax(0, 1fr)",
            },
            // Door sizes (150x210 desktop, 104x150 narrow) and frame widths.
            width: {
                "ds-door": "150px",
                "ds-door-narrow": "104px",
            },
            height: {
                "ds-door": "210px",
                "ds-door-narrow": "150px",
                // FloorGuide roof: the gable above the floor list (Maze.dc.html).
                "ds-roof": "34px",
            },
            borderWidth: {
                "ds-door": "3px",
                "ds-door-lg": "6px",
            },
            borderRadius: {
                lg: "var(--radius-lg)",
                md: "var(--radius)",
                sm: "calc(var(--radius) - 2px)",
            },
            boxShadow: {
                card: "var(--shadow-card)",
            },
            // Named durations instead of arbitrary values (duration-[250ms]).
            // tailwindcss-animate also registers `duration-*` for
            // animation-duration, so arbitrary values match two utilities and
            // Tailwind warns that the class is ambiguous.
            transitionDuration: {
                250: "250ms",
                350: "350ms",
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
    plugins: [tailwindcssAnimate, typography],
}
export default config
