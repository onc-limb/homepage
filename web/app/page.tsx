import Link from 'next/link';
import { CardContent, Card } from '@/components/ui/card';
import Logo from '@/public/MainLogo.jpg';

import Image from 'next/image';

export default function Top() {
    return (
        <>
            <section className="w-full py-6 md:py-12 lg:py-18">
                <div className="container px-4 md:px-6 grid lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px] gap-6">
                    <div className="flex flex-col justify-center space-y-16">
                        <div className="space-y-4">
                            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                                技術登攀録
                            </h1>
                            <div className='text-3xl font-bold'>〜　技術の壁を登攀する　〜</div>
                            <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                            <ol>
                                <li>
                                    仕事としてのエンジニアリング（課題解決）
                                </li>
                                <li>
                                    趣味としてのエンジニアリング（知的好奇心）
                                </li>
                                <li>
                                    生き甲斐としてのクライミング（生きる意味）
                                </li>
                            </ol>
                            </p>
                        </div>
                        <Link
                            className="inline-flex h-10 items-center justify-center rounded-md bg-gray-900 px-8 text-sm text-gray-50 shadow hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300"
                            href="/articles"
                        >
                            記事一覧
                        </Link>
                    </div>
                    <Image
                        src={Logo}
                        alt="記事トップ"
                        width={550}
                        height={550}
                        className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
                    />
                </div>
            </section>
            <section className="w-full py-8 md:py-12 lg:py-16 bg-gray-100 dark:bg-gray-800">
                <div className="container px-4 md:px-6 flex flex-col items-center justify-center space-y-8 text-center">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                            記事のカテゴリー
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
                        <Link
                            className="inline-flex h-16 items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-950 dark:text-gray-50 dark:hover:bg-gray-800 dark:focus-visible:ring-gray-300"
                            href="/articles/engineering"
                        >
                            エンジニアリング
                        </Link>
                        <Link
                            className="inline-flex h-16 items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-950 dark:text-gray-50 dark:hover:bg-gray-800 dark:focus-visible:ring-gray-300"
                            href="/articles/climbing"
                        >
                            クライミング
                        </Link>
                        <Link
                            className="inline-flex h-16 items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-950 dark:text-gray-50 dark:hover:bg-gray-800 dark:focus-visible:ring-gray-300"
                            href="/articles/others"
                        >
                            生活・その他
                        </Link>
                    </div>
                </div>
            </section>
            <section className="w-full py-12 md:py-24 lg:py-32">
                <div className="container px-4 md:px-6 space-y-4">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                            最新の投稿
                        </h2>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <Card>
                            <CardContent>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-semibold">タイトル１</h3>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        テキスト
                                    </p>
                                    <Link
                                        className="inline-flex items-center text-sm font-medium text-gray-900 transition-colors hover:text-gray-700 dark:text-gray-50 dark:hover:text-gray-300"
                                        href="#"
                                    >
                                        全文を読む
                                        <ArrowRightIcon className="ml-1 h-4 w-4" />
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-semibold">タイトル１</h3>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        テキスト
                                    </p>
                                    <Link
                                        className="inline-flex items-center text-sm font-medium text-gray-900 transition-colors hover:text-gray-700 dark:text-gray-50 dark:hover:text-gray-300"
                                        href="#"
                                    >
                                        全文を読む
                                        <ArrowRightIcon className="ml-1 h-4 w-4" />
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-semibold">タイトル１</h3>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        テキスト
                                    </p>
                                    <Link
                                        className="inline-flex items-center text-sm font-medium text-gray-900 transition-colors hover:text-gray-700 dark:text-gray-50 dark:hover:text-gray-300"
                                        href="#"
                                    >
                                        全文を読む
                                        <ArrowRightIcon className="ml-1 h-4 w-4" />
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>
        </>
    );
}

const ArrowRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
        </svg>
    );
};
