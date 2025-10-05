import Link from 'next/link';
import Logo from '@/public/MainLogo.jpg';
import Image from 'next/image';
import KnowledgeList from '@/components/knowledgeList';
export default function Top() {
    return (
        <>
            <section className="w-full py-6 md:py-12 lg:py-18">
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col items-center justify-center space-y-8 text-center">
                        <div className="space-y-4">
                            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                                onclimb
                            </h1>
                            <p className="max-w-[800px] text-gray-500 md:text-xl dark:text-gray-400">
                                エンジニアとしての成長記録<br/>
                                ナレッジベースや技術記事を通じて、学んだことや経験を共有します
                            </p>
                        </div>
                        <Image
                            src={Logo}
                            alt="onclimb"
                            width={300}
                            height={300}
                            className="rounded-xl object-cover"
                        />
                    </div>
                </div>
            </section>
            <section className="w-full py-12 md:py-24 bg-gray-100 dark:bg-gray-800">
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col items-center justify-center space-y-4 text-center">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                                ナレッジベース
                            </h2>
                            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                学んだ知識、得た経験を乱雑に記録する
                            </p>
                        </div>
                    </div>
                    <KnowledgeList />
                </div>
            </section>
            <section className="w-full py-12 md:py-24">
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col items-center justify-center space-y-4 text-center">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                                技術記事
                            </h2>
                            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                技術的な深掘りと実践的な知見を共有します
                            </p>
                        </div>
                        <Link
                            className="inline-flex h-10 items-center justify-center rounded-md bg-gray-900 px-8 text-sm text-gray-50 shadow hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300"
                            href="/articles"
                        >
                            記事一覧を見る
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
