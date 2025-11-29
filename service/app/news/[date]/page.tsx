import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getNewsContent, getAllNewsDates } from '@/lib/news';
import { Button } from '@/components/ui/button';
interface NewsDetailProps {
    params: Promise<{ date: string }>;
}
export async function generateStaticParams() {
    const dates = getAllNewsDates();
    return dates.map((date) => ({
        date,
    }));
}
const NewsDetail = async ({ params }: NewsDetailProps) => {
    const { date } = await params;
    const news = getNewsContent(date);
    if (!news) {
        notFound();
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
            <article className="w-full pb-12 md:pb-24 lg:pb-32">
                <div className="container px-4 md:px-6 lg:max-w-4xl">
                    <div className="markdown prose prose-lg dark:prose-invert prose-readable max-w-none">
                        <Markdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                a: ({ href, children }) => (
                                    <a href={href} target="_blank" rel="noopener noreferrer">
                                        {children}
                                    </a>
                                ),
                            }}
                        >
                            {news.content}
                        </Markdown>
                    </div>
                </div>
            </article>
        </>
    );
};
export default NewsDetail;
