import Link from 'next/link';
import { getNewsDates } from '@/lib/news';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
export default function NewsListPage() {
    const newsList = getNewsDates();
    return (
        <section className="w-full py-16 md:py-24">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="flex flex-col items-center justify-center space-y-6 text-center">
                    <span className="text-xs tracking-wide-elegant text-turquoise-600 uppercase">Daily Updates</span>
                    <h2 className="text-4xl font-light tracking-elegant sm:text-5xl text-foreground">
                        技術ニュース
                    </h2>
                    <div className="w-16 h-px bg-turquoise-400/60" />
                    <p className="max-w-[600px] text-muted-foreground text-sm md:text-base font-light tracking-elegant">
                        毎日自動収集される技術ニュースのAI要約
                    </p>
                </div>
                <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {newsList.length === 0 ? (
                        <p className="col-span-full text-center text-muted-foreground tracking-elegant">
                            ニュースはまだありません
                        </p>
                    ) : (
                        newsList.map((news) => (
                            <Link
                                key={news.date}
                                href={`/news/${news.date}`}
                                prefetch={false}
                            >
                                <Card className="h-full">
                                    <CardHeader>
                                        <CardTitle className="text-lg font-light tracking-elegant">
                                            {news.date}
                                        </CardTitle>
                                        <CardDescription className="text-muted-foreground/70 tracking-elegant">
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
