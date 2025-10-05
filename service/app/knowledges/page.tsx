import KnowledgeHierarchy from '@/components/KnowledgeHierarchy';
export default function KnowledgeListPage() {
    return (
        <section className="w-full py-12 md:py-24">
            <div className="container px-4 md:px-6 max-w-5xl">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                            ナレッジベース
                        </h2>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            学んだ知識、得た経験を乱雑に記録する
                        </p>
                    </div>
                </div>
                <KnowledgeHierarchy />
            </div>
        </section>
    );
}
