import Link from "next/link"
import { notFound } from "next/navigation"
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
                                    <p className="text-sm text-muted-foreground font-light tracking-elegant mb-4">
                                        {article.summary ?? "要約なし"}
                                    </p>
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
