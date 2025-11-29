import Link from 'next/link';
import { getNewsDates } from '@/lib/news';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
export default function NewsListPage() {
    const newsList = getNewsDates();
    return (
        <section className="w-full py-12 md:py-24">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                            技術ニュース
                        </h2>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            毎日自動収集される技術ニュースのAI要約
                        </p>
                    </div>
                </div>
                <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {newsList.length === 0 ? (
                        <p className="col-span-full text-center text-muted-foreground">
                            ニュースはまだありません
                        </p>
                    ) : (
                        newsList.map((news) => (
                            <Link
                                key={news.date}
                                href={`/news/${news.date}`}
                                prefetch={false}
                            >
                                <Card className="h-full transition-colors hover:bg-muted/50">
                                    <CardHeader>
                                        <CardTitle className="text-xl">
                                            {news.date}
                                        </CardTitle>
                                        <CardDescription>
                                            技術ニュース
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}
