import Link from "next/link"
import { notFound } from "next/navigation"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { getNewsByDate, getAllNewsDates } from "@/lib/news"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export const revalidate = 36000

interface NewsDetailProps {
    params: Promise<{ date: string }>
}
export async function generateStaticParams() {
    const dates = await getAllNewsDates()
    return dates.map((date) => ({
        date,
    }))
}
const NewsDetail = async ({ params }: NewsDetailProps) => {
    const { date } = await params
    const articles = await getNewsByDate(date)
    if (articles.length === 0) {
        notFound()
    }
    return (
        <>
            <div className="container px-4 md:px-6 lg:max-w-4xl pt-6">
                <Button asChild variant="outline" className="mb-6">
                    <Link href="/news" prefetch={false}>
                        一覧へ
                    </Link>
                </Button>
            </div>
            <section className="w-full pb-12 md:pb-24 lg:pb-32">
                <div className="container px-4 md:px-6 lg:max-w-4xl">
                    <h2 className="text-3xl font-light tracking-elegant sm:text-4xl text-foreground mb-8">
                        {date}
                    </h2>
                    <div className="grid gap-4">
                        {articles.map((article) => (
                            <Card key={article.url}>
                                <CardHeader>
                                    <CardTitle className="text-lg font-light tracking-elegant">
                                        {article.title}
                                    </CardTitle>
                                    <CardDescription className="text-muted-foreground/70 tracking-elegant">
                                        {article.source}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm text-muted-foreground font-light tracking-elegant mb-4">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                p: ({ children }) => (
                                                    <p className="mb-3 last:mb-0">{children}</p>
                                                ),
                                                strong: ({ children }) => (
                                                    <strong className="font-medium">{children}</strong>
                                                ),
                                                ul: ({ children }) => (
                                                    <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>
                                                ),
                                                ol: ({ children }) => (
                                                    <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>
                                                ),
                                                li: ({ children }) => (
                                                    <li className="leading-relaxed">{children}</li>
                                                ),
                                                code: ({ children }) => (
                                                    <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{children}</code>
                                                ),
                                                pre: ({ children }) => (
                                                    <pre className="bg-muted p-3 rounded-md mb-3 overflow-x-auto text-xs">{children}</pre>
                                                ),
                                                a: ({ href, children }) => (
                                                    <a href={href} className="text-turquoise-600 hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>
                                                ),
                                                h1: ({ children }) => (
                                                    <h1 className="text-base font-medium mb-2">{children}</h1>
                                                ),
                                                h2: ({ children }) => (
                                                    <h2 className="text-sm font-medium mb-2">{children}</h2>
                                                ),
                                                h3: ({ children }) => (
                                                    <h3 className="text-sm font-medium mb-1">{children}</h3>
                                                ),
                                                blockquote: ({ children }) => (
                                                    <blockquote className="border-l-2 border-muted-foreground/30 pl-3 italic mb-3">{children}</blockquote>
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
                                        className="text-sm text-turquoise-600 hover:underline tracking-elegant"
                                    >
                                        元記事を読む →
                                    </a>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
        </>
    )
}
export default NewsDetail
