import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import fs from 'fs';
import Link from 'next/link';

const ArticleDetail = async ({ params }: { params: { title: string } }) => {
    const decodedTitle = decodeURIComponent(params.title);
    const [category, title] = decodedTitle.split(' ');
    const path = `${__dirname}/../../../../../articles/${decodedTitle}`;
    const articleContent = fs.readFileSync(path, 'utf8');
    const editedAt = fs.statSync(path).mtime;

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
                                {title}
                            </h1>
                            <div className="flex space-x-4">
                                <p className="flex-row text-gray-500 dark:text-gray-400">
                                    {category}
                                </p>
                                <p className="flex-row text-gray-500 dark:text-gray-400">
                                    更新日：{editedAt.toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <hr className="my-4 border-t border-gray-200 w-full" />
                        <div className="markdown prose prose-lg dark:prose-invert">
                            <Markdown remarkPlugins={[remarkGfm]}>
                                {articleContent}
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
