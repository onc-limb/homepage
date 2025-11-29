import KnowledgeHierarchy from './_components/KnowledgeHierarchy';
export default function KnowledgeListPage() {
    return (
        <section className="w-full py-16 md:py-24">
            <div className="container px-4 md:px-6 max-w-5xl mx-auto">
                <div className="flex flex-col items-center justify-center space-y-6 text-center">
                    <span className="text-xs tracking-wide-elegant text-muted-foreground uppercase">Collection</span>
                    <h2 className="text-4xl font-light tracking-elegant sm:text-5xl text-foreground">
                        ナレッジベース
                    </h2>
                    <div className="w-16 h-px bg-border/70" />
                    <p className="max-w-[600px] text-muted-foreground text-sm md:text-base font-light tracking-elegant">
                        学んだ知識、得た経験を乱雑に記録する
                    </p>
                </div>
                <KnowledgeHierarchy />
            </div>
        </section>
    );
}
