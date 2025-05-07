import { getArticles } from '@/lib/article';
import { getKnowledges } from '@/lib/knowledge';
import Link from 'next/link';

export default async function KnowledgeList() {
    const knowledges = await getKnowledges();

    return (
        <div className="grid gap-8 md:grid-cols-4 lg:grid-cols-6 mt-12">
            {knowledges.map((knowledge) => {
                return (
                    <Link
                        key={knowledge}
                        href={`/knowledges/${knowledge}`}
                        className="group flex flex-col bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        prefetch={false}
                    >
                        <div className="p-6 flex flex-col gap-4">
                            <div className="flex items-center gap-2 text-xl font-bold">
                                {knowledge}
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}
