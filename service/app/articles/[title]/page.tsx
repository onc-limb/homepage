import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { getArticle } from '@/lib/article';

const ArticleDetail = async ({ params }: { params: { title: string } }) => {
    const decodedTitle = decodeURIComponent(params.title);
    const article = await getArticle(decodedTitle);

    return (
        <>
            <Link
                href={`/articles`}
                className="mx-auto bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                prefetch={false}
            >
                一覧へ
            </Link>
            <article className="w-full py-12 md:py-24 lg:py-32">
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
                        <hr className="my-4 border-t border-gray-200 w-full" />
                        <div className="markdown prose prose-lg dark:prose-invert">
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
