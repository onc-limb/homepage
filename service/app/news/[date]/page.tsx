import Link from "next/link"
import { notFound } from "next/navigation"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { getAllNewsDates, getNewsByDate } from "@/lib/news"
import { Reveal } from "@/components/animations"

export const revalidate = 36000

interface NewsDetailProps {
    params: Promise<{ date: string }>
}

export async function generateStaticParams() {
    const dates = await getAllNewsDates()
    return dates.map((date) => ({ date }))
}

export default async function NewsDetail({ params }: NewsDetailProps) {
    const { date } = await params
    const articles = await getNewsByDate(date)
    if (articles.length === 0) notFound()

    return (
        <main className="page flex-1">
            <section className="px-0 pb-10 pt-16">
                <div className="mx-auto max-w-[1200px] px-6">
                    <Reveal className="mb-4 flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.16em] text-fg-dim">
                        <Link
                            href="/"
                            className="text-fg-muted transition-colors hover:text-accent"
                        >
                            onclimb
                        </Link>
                        <span>/</span>
                        <Link
                            href="/news"
                            className="text-fg-muted transition-colors hover:text-accent"
                        >
                            news
                        </Link>
                        <span>/</span>
                        <b className="font-medium text-accent">{date}</b>
                    </Reveal>
                    <Reveal delay={80}>
                        <h1 className="mb-3 text-[clamp(36px,5vw,56px)] font-semibold leading-[1.05] tracking-[-0.03em]">
                            {date.replace(/-/g, ".")}
                        </h1>
                    </Reveal>
                    <Reveal delay={160}>
                        <p className="text-base text-fg-muted">
                            {articles.length} stories
                        </p>
                    </Reveal>
                </div>
            </section>

            <section className="pb-20">
                <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-3.5 px-6 [@media(min-width:720px)]:grid-cols-2 [@media(min-width:1100px)]:grid-cols-3">
                    {articles.map((article, i) => (
                        <Reveal key={article.url} delay={i * 40}>
                            <article
                                className="ncard relative flex min-h-[220px] flex-col overflow-hidden rounded-[var(--radius-lg)] border border-hairline bg-surface px-5 pb-6 pt-5 backdrop-blur-[8px] transition-[transform,border-color] duration-[350ms] hover:-translate-y-1.5 hover:border-accent"
                            >
                                <div className="mb-3.5 flex items-center justify-between font-mono text-[11px] tracking-[0.1em] text-fg-dim">
                                    <span className="inline-flex items-center gap-1.5 before:block before:h-1 before:w-1 before:rounded-full before:bg-accent">
                                        {article.source}
                                    </span>
                                </div>
                                <h3 className="mb-2.5 text-base font-semibold leading-[1.4] text-fg-strong">
                                    {article.title}
                                </h3>
                                <div className="prose prose-sm prose-invert mb-4 max-w-none flex-1 text-[13.5px] leading-[1.7] text-fg-muted">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            p: ({ children }) => (
                                                <p className="mb-2 last:mb-0">
                                                    {children}
                                                </p>
                                            ),
                                            a: ({ href, children }) => (
                                                <a
                                                    href={href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-accent hover:underline"
                                                >
                                                    {children}
                                                </a>
                                            ),
                                        }}
                                    >
                                        {article.summary ?? "要約なし"}
                                    </ReactMarkdown>
                                </div>
                                <a
                                    href={article.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-mono text-xs tracking-[0.06em] text-accent transition-all duration-200 hover:gap-2.5"
                                >
                                    元記事を読む →
                                </a>
                            </article>
                        </Reveal>
                    ))}
                </div>
            </section>
        </main>
    )
}
