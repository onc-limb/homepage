import { logger } from "./logger"

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
        if (!res.ok) {
            // これまで握りつぶしていた非 2xx 応答を観測可能にする（取得失敗は致命ではないため warn）。
            logger.warn("Failed to fetch OGP source", {
                url,
                status: res.status,
            })
            return null
        }
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
    } catch (error) {
        // fetch / text() の例外を握りつぶしていた箇所。null フォールバックは維持しつつ、
        // 障害調査のために URL とエラー内容を構造化ログへ残す。
        // Node 専用 API に依存しないよう Error 判定でメッセージを取り出す。
        logger.warn("Error while fetching OGP image", {
            url,
            error: error instanceof Error ? error.message : String(error),
        })
        return null
    }
}
