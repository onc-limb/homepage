import Link from "next/link"
import fs from 'fs'

export default function Component() {
  const articles = fs.readdirSync(`${__dirname}/../../../../articles`).map(name => {
    const path = `${__dirname}/../../../../articles/${name}`;
    const stats = fs.statSync(path);
    return { name: name.replace(/\.[^/.]+$/, ""), editedAt: stats.mtime };
  });

  return (
    <section className="w-full py-12 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">記事一覧</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              普段使用する技術を少しだけ深く、少しだけ広く理解できるような記事
            </p>
          </div>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-12">
          {articles.map((article, index) =>{
            const [category, title] = article.name.split(' ');
            return <Link
              key={index}
              href={`/articles/${article.name}`}
              className="group flex flex-col bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              prefetch={false}
            >
              <div className="p-6 flex flex-col gap-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{category}</span>
                </div>
                <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
                  {title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  Edited At: {article.editedAt.toDateString()}
                </div>
              </div>
            </Link>
          })}
        </div>
      </div>
    </section>
  )
}