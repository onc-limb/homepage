import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { getKnowledge } from '@/lib/knowledge';
import { Button } from '@/components/ui/button';
export default async function KnowledgeDetail({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);
    const knowledge = await getKnowledge(decodedSlug);
    return (
        <div className="w-full">
            <div className="container px-4 md:px-6 lg:max-w-4xl pt-6">
                <Button asChild variant="outline" className="mb-6">
                    <Link href="/knowledges" prefetch={false}>
                        一覧へ
                    </Link>
                </Button>
            </div>
            <article className="w-full pb-12 md:pb-24 lg:pb-32">
                <div className="container px-4 md:px-6 lg:max-w-4xl">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl lg:text-6xl">
                                {knowledge.title}
                            </h1>
                        </div>
                        <hr className="my-4 border-t border-border w-full" />
                        <div className="markdown prose prose-lg dark:prose-invert prose-readable max-w-none">
                            <Markdown remarkPlugins={[remarkGfm]}>{knowledge.content}</Markdown>
                        </div>
                    </div>
                </div>
            </article>
        </div>
    );
}
export const revalidate = 86400;
