import { getNewsByDate, getNewsDates } from "@/lib/news"
import { Reveal } from "@/components/animations"
import { NewsContent, type NewsDayGroup } from "@/components/news"

export const revalidate = 36000

const RECENT_DAYS = 3
const RELATIVE_LABELS = ["Today", "Yesterday", "Two days ago"]

export default async function NewsPage() {
    const allDates = await getNewsDates()
    const recent = allDates.slice(0, RECENT_DAYS)

    const days: NewsDayGroup[] = await Promise.all(
        recent.map(async (entry, i) => ({
            date: formatDate(entry.date),
            label: RELATIVE_LABELS[i] || entry.date,
            articles: await getNewsByDate(entry.date),
        })),
    )

    return (
        <main className="page flex-1">
            <section className="px-0 pb-7 pt-20">
                <div className="mx-auto max-w-[1200px] px-6">
                    <Reveal className="mb-4 flex gap-1.5 font-mono text-xs uppercase tracking-[0.16em] text-fg-dim">
                        <span>onclimb</span>
                        <span>/</span>
                        <b className="font-medium text-accent">news</b>
                    </Reveal>
                    <div className="mb-4 flex flex-wrap items-end justify-between gap-6">
                        <Reveal delay={80}>
                            <h1 className="text-[clamp(40px,5.6vw,64px)] font-semibold leading-[1.05] tracking-[-0.03em]">
                                毎日の
                                <br />
                                知識収集ログ。
                            </h1>
                        </Reveal>
                        <Reveal
                            delay={160}
                            className="live-blink inline-flex items-center gap-2 rounded-full border px-3.5 py-2 font-mono text-xs text-accent"
                            style={{
                                background: "var(--accent-soft)",
                                borderColor: "var(--accent)",
                            }}
                        >
                            <span
                                aria-hidden="true"
                                className="block h-2 w-2 rounded-full"
                                style={{ background: "var(--accent)" }}
                            />
                            LIVE — collecting
                        </Reveal>
                    </div>
                    <Reveal delay={200}>
                        <p className="max-w-[640px] text-[17px] leading-[1.7] text-fg">
                            毎日自動収集される技術ニュースの AI
                            要約。情報源は HackerNews / GitHub Trending / RSS / カンファレンスサイト。読みやすさ重視で、見た目はちょっと遊んでます。
                        </p>
                    </Reveal>
                </div>
            </section>

            <NewsContent days={days} />
        </main>
    )
}

function formatDate(date: string): string {
    // crawlDate is YYYY-MM-DD; convert to YYYY.MM.DD for the design.
    return date.replace(/-/g, ".")
}
