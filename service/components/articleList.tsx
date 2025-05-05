import { getArticles } from '@/lib/article';
import Link from 'next/link';

export default async function ArticleList() {
    const articles = await getArticles();
    console.log(articles);

    return (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-12">
            {articles.map((article) => {
                return (
                    <Link
                        key={article.name}
                        href={`/articles/${article.name}`}
                        className="group flex flex-col bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        prefetch={false}
                    >
                        <div className="p-6 flex flex-col gap-4">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>
                                    {article.topics &&
                                        article.topics.map((topic, index) => (
                                            <span
                                                key={index}
                                                className="px-2 py-1 bg-muted rounded-full"
                                            >
                                                {topic}
                                            </span>
                                        ))}
                                </span>
                            </div>
                            <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
                                {article.title}
                            </h3>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}
