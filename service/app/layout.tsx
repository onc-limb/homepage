import SiteShell from "@/components/SiteShell"
import { ThemeProvider, themeBootScript } from "@/components/theme"
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
    title: "onc-limb",
    description: "onc-limb home page",
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
                <script
                    dangerouslySetInnerHTML={{ __html: themeBootScript }}
                />
                <script
                    async
                    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2116109734269102"
                    crossOrigin="anonymous"
                />
            </head>
            <body className={`${fontVars} min-h-screen antialiased`}>
                <ThemeProvider>
                    <SiteShell>{children}</SiteShell>
                </ThemeProvider>
            </body>
        </html>
    )
}
