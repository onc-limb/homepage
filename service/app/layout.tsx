import { AdSense } from "@/components/AdSense"
import SiteShell from "@/components/SiteShell"
import { ThemeProvider, themeBootScript } from "@/components/theme"
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo"
import type { Metadata } from "next"
import {
    Geist,
    Geist_Mono,
    Noto_Sans_JP,
    Space_Grotesk,
    JetBrains_Mono,
} from "next/font/google"
import "./globals.css"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })
const notoSansJP = Noto_Sans_JP({
    subsets: ["latin"],
    variable: "--font-noto-jp",
    weight: ["400", "500", "700"],
})
const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    variable: "--font-space-grotesk",
    weight: ["500", "600", "700"],
})
const jetbrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-jetbrains-mono",
})

export const metadata: Metadata = {
    metadataBase: SITE_URL,
    title: {
        default: SITE_NAME,
        template: `%s | ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    openGraph: {
        type: "website",
        title: SITE_NAME,
        description: SITE_DESCRIPTION,
        url: "/",
        siteName: SITE_NAME,
        locale: "ja_JP",
        images: [
            {
                url: "/og-default.png",
                width: 1200,
                height: 630,
                alt: "onclimb — Fullstack Engineer / Software Architect",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: SITE_NAME,
        description: SITE_DESCRIPTION,
        images: ["/og-default.png"],
    },
    icons: {
        icon: "/favicon.ico",
    },
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    const fontVars = [
        geist.variable,
        geistMono.variable,
        notoSansJP.variable,
        spaceGrotesk.variable,
        jetbrainsMono.variable,
    ].join(" ")

    return (
        <html lang="ja" data-theme="dark" suppressHydrationWarning>
            <head>
                {/* Apply persisted theme before hydration to prevent FOUC. */}
                <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
            </head>
            <body className={`${fontVars} min-h-screen antialiased`}>
                <ThemeProvider>
                    <SiteShell>{children}</SiteShell>
                </ThemeProvider>
                <AdSense />
            </body>
        </html>
    )
}
