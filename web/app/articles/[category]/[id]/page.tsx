import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const getCategoryString = (category: number): string => {
  switch (category) {
    case 1:
      return "CLIMBING";
    case 2:
      return "ENGINEERING";
    case 3:
      return "LIFE";
    default:
      throw new Error("Invalid category");
  }
};

const ArticleDetail = async ({params}: {params: {category: string, id: string}}) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/getDetail`, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    cache: 'no-store'
  })
  const article = await res.json()

    return (
    <article className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6 lg:max-w-4xl">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl lg:text-6xl">{article.title}</h1>
            <div className='flex space-x-4'>
            <p className="flex-row text-gray-500 dark:text-gray-400">投稿日：{new Date(article.publishedAt).toLocaleDateString()}</p>
            <p className="flex-row text-gray-500 dark:text-gray-400">更新日：{new Date(article.editedAt).toLocaleDateString()}</p>
            </div>
          </div>
          <Markdown remarkPlugins={[remarkGfm]}>{article.content}</Markdown>
        </div>
      </div>
    </article>
    )
    
}

export default ArticleDetail

export const revalidate = 86400;