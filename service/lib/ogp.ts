export interface OgpData {
    image: string | null
    siteName: string | null
}

export async function fetchOgpImage(url: string): Promise<string | null> {
    try {
        const res = await fetch(url, {
            headers: { "User-Agent": "bot" },
            next: { revalidate: 86400 },
        })
        if (!res.ok) return null
        const html = await res.text()

        const ogImageMatch = html.match(
            /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
        )
        if (ogImageMatch) return ogImageMatch[1]

        const ogImageMatch2 = html.match(
            /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i
        )
        if (ogImageMatch2) return ogImageMatch2[1]

        return null
    } catch {
        return null
    }
}
