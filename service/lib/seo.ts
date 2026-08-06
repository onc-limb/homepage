import type { Metadata } from "next"

export const SITE_NAME = "onclimb"
export const SITE_DESCRIPTION =
    "ソフトウェアアーキテクトの視点で、設計から実装・運用まで担うフルスタックエンジニア onclimb のポートフォリオ。"
export const SITE_URL = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://onclimb.net")

const OG_IMAGE = {
    url: "/opengraph-image",
    width: 1200,
    height: 630,
    alt: "onclimb — Fullstack Engineer / Software Architect",
}

export function absoluteUrl(path: string): string {
    return new URL(path, SITE_URL).toString()
}

interface PageMetadataInput {
    title: string
    description: string
    path: string
    canonical?: string
    type?: "website" | "article"
}

export function createPageMetadata({
    title,
    description,
    path,
    canonical = absoluteUrl(path),
    type = "website",
}: PageMetadataInput): Metadata {
    const socialTitle = `${title} | ${SITE_NAME}`

    return {
        title,
        description,
        alternates: { canonical },
        openGraph: {
            type,
            title: socialTitle,
            description,
            url: canonical,
            siteName: SITE_NAME,
            locale: "ja_JP",
            images: [OG_IMAGE],
        },
        twitter: {
            card: "summary_large_image",
            title: socialTitle,
            description,
            images: [OG_IMAGE.url],
        },
    }
}

export function breadcrumbJsonLd(
    items: Array<{ name: string; path: string }>
): Record<string, unknown> {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: absoluteUrl(item.path),
        })),
    }
}
