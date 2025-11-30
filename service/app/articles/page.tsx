import ArticleList from './_components/ArticleList';
export default function ArticleListPage() {
    return (
        <section className="w-full py-16 md:py-24">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="flex flex-col items-center justify-center space-y-6 text-center">
                    <span className="text-xs tracking-wide-elegant text-muted-foreground uppercase">Deep Dive</span>
                    <h2 className="text-4xl font-light tracking-elegant sm:text-5xl text-foreground">
                        記事一覧
                    </h2>
                    <div className="w-16 h-px bg-border/70" />
                    <p className="max-w-[600px] text-muted-foreground text-sm md:text-base font-light tracking-elegant">
                        普段使用する技術を少しだけ深く、少しだけ広く理解できるような記事
                    </p>
                </div>
                <ArticleList />
            </div>
        </section>
    );
}
