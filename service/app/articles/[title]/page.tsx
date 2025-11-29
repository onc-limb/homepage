import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { getArticle } from '@/lib/article';
import { Button } from '@/components/ui/button';
const ArticleDetail = async ({ params }: { params: Promise<{ title: string }> }) => {
    const { title } = await params;
    const decodedTitle = decodeURIComponent(title);
    const article = await getArticle(decodedTitle);
    return (
        <>
            <div className="container px-4 md:px-6 lg:max-w-4xl pt-6">
                <Button asChild variant="outline" className="mb-6">
                    <Link href="/articles" prefetch={false}>
                        一覧へ
                    </Link>
                </Button>
            </div>
            <article className="w-full pb-12 md:pb-24 lg:pb-32">
                <div className="container px-4 md:px-6 lg:max-w-4xl">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl lg:text-6xl">
                                {article.data.title}
                            </h1>
                            <div className="flex space-x-4">
                                <span>
                                    {article.data.topics &&
                                        article.data.topics.map((topic, index) => (
                                            <span
                                                key={index}
                                                className="px-2 py-1 bg-muted rounded-full"
                                            >
                                                {topic}
                                            </span>
                                        ))}
                                </span>
                            </div>
                        </div>
                        <hr className="my-4 border-t border-border w-full" />
                        <div className="markdown prose prose-lg dark:prose-invert prose-readable max-w-none">
                            <Markdown remarkPlugins={[remarkGfm]}>
                                {article.content}
                            </Markdown>
                        </div>
                    </div>
                </div>
            </article>
        </>
    );
};
export default ArticleDetail;
export const revalidate = 86400;
