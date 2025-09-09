import ArticleList from '@/components/articleList';
export default function ArticleListPage() {
    return (
        <section className="w-full py-12 md:py-24">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                            記事一覧
                        </h2>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            普段使用する技術を少しだけ深く、少しだけ広く理解できるような記事
                        </p>
                    </div>
                </div>
                <ArticleList />
            </div>
        </section>
    );
}
