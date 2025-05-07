import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { getArticle } from '@/lib/article';
import { getKnowledge } from '@/lib/knowledge';

export default async function KnowledgeDetail({ params }: { params: { slug: string } }) {
    const decodedSlug = decodeURIComponent(params.slug);
    const knowledge = await getKnowledge(decodedSlug);

    return (
        <>
            <Link
                href={`/knowledges`}
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
                                {decodedSlug}
                            </h1>
                        </div>
                        <hr className="my-4 border-t border-gray-200 w-full" />
                        <div className="markdown prose prose-lg dark:prose-invert">
                            <Markdown remarkPlugins={[remarkGfm]}>{knowledge}</Markdown>
                        </div>
                    </div>
                </div>
            </article>
        </>
    );
}

export const revalidate = 86400;
