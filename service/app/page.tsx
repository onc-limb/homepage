import Link from 'next/link';
import KnowledgeList from './_components/KnowledgeList';
export default function Top() {
    return (
        <main className="flex-1">
            {/* Hero Section */}
            <section className="w-full py-16 md:py-24 lg:py-32">
                <div className="container px-4 md:px-6 mx-auto">
                    <div className="flex flex-col items-center justify-center space-y-6 text-center">
                        <h1 className="text-5xl font-light tracking-wide-elegant sm:text-6xl xl:text-7xl text-foreground">
                            onclimb
                        </h1>
                        <div className="w-16 h-px bg-border/70 my-4" />
                        <p className="max-w-[600px] text-muted-foreground text-lg md:text-xl font-light tracking-elegant leading-relaxed">
                            エンジニアとしての成長記録
                        </p>
                        <p className="max-w-[700px] text-muted-foreground/70 text-sm md:text-base font-light tracking-elegant">
                            ナレッジベースや技術記事を通じて、学んだことや経験を共有します
                        </p>
                    </div>
                </div>
            </section>
            {/* Divider */}
            <div className="w-full border-t border-border/30" />
            {/* News Section */}
            <section className="w-full py-16 md:py-20 bg-card/30">
                <div className="container px-4 md:px-6 mx-auto">
                    <div className="flex flex-col items-center justify-center space-y-6 text-center">
                        <span className="text-xs tracking-wide-elegant text-muted-foreground uppercase">Daily Updates</span>
                        <h2 className="text-3xl font-light tracking-elegant sm:text-4xl text-foreground">
                            技術ニュース
                        </h2>
                        <p className="max-w-[600px] text-muted-foreground text-sm md:text-base font-light tracking-elegant">
                            毎日自動収集される技術ニュースのAI要約
                        </p>
                        <Link
                            className="mt-4 inline-flex h-11 items-center justify-center border border-border/50 bg-transparent px-8 text-sm text-foreground tracking-elegant hover:bg-accent hover:border-border transition-all duration-200"
                            href="/news"
                        >
                            View News →
                        </Link>
                    </div>
                </div>
            </section>
            {/* Divider */}
            <div className="w-full border-t border-border/30" />
            {/* Knowledge Section */}
            <section className="w-full py-16 md:py-20">
                <div className="container px-4 md:px-6 mx-auto">
                    <div className="flex flex-col items-center justify-center space-y-6 text-center">
                        <span className="text-xs tracking-wide-elegant text-muted-foreground uppercase">Collection</span>
                        <h2 className="text-3xl font-light tracking-elegant sm:text-4xl text-foreground">
                            ナレッジベース
                        </h2>
                        <p className="max-w-[600px] text-muted-foreground text-sm md:text-base font-light tracking-elegant">
                            学んだ知識、得た経験を乱雑に記録する
                        </p>
                    </div>
                    <KnowledgeList />
                </div>
            </section>
            {/* Divider */}
            <div className="w-full border-t border-border/30" />
            {/* Articles Section */}
            <section className="w-full py-16 md:py-20 bg-card/30">
                <div className="container px-4 md:px-6 mx-auto">
                    <div className="flex flex-col items-center justify-center space-y-6 text-center">
                        <span className="text-xs tracking-wide-elegant text-muted-foreground uppercase">Deep Dive</span>
                        <h2 className="text-3xl font-light tracking-elegant sm:text-4xl text-foreground">
                            技術記事
                        </h2>
                        <p className="max-w-[600px] text-muted-foreground text-sm md:text-base font-light tracking-elegant">
                            技術的な深掘りと実践的な知見を共有します
                        </p>
                        <Link
                            className="mt-4 inline-flex h-11 items-center justify-center border border-border/50 bg-transparent px-8 text-sm text-foreground tracking-elegant hover:bg-accent hover:border-border transition-all duration-200"
                            href="/articles"
                        >
                            View Articles →
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
