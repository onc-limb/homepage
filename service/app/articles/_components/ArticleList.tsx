import { getArticles } from '@/lib/article';
import Link from 'next/link';
export const revalidate = 3600; // 1時間ごとにバックグラウンド更新
export default async function ArticleList() {
    const articles = await getArticles();
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
            {articles.map((article) => {
                return (
                    <Link
                        key={article.slug}
                        href={`/articles/${article.slug}`}
                        className="group flex flex-col border border-border/50 bg-card overflow-hidden hover:border-border hover:bg-accent/30 transition-all duration-200"
                        prefetch={false}
                    >
                        <div className="p-6 flex flex-col gap-4">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="flex flex-wrap gap-2">
                                    {article.topics &&
                                        article.topics.map((topic, index) => (
                                            <span
                                                key={index}
                                                className="px-2 py-1 border border-border/50 text-muted-foreground tracking-elegant"
                                            >
                                                {topic}
                                            </span>
                                        ))}
                                </span>
                            </div>
                            <h3 className="text-xl font-light tracking-elegant text-foreground group-hover:text-foreground/80 transition-colors">
                                {article.title}
                            </h3>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}
