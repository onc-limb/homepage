import {gql} from '@apollo/client'
import useApolloClient from '@/lib/apolloClient';
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'


const GET_ARTICLE_DETAIL = gql`
    query GetArticleDetail($id: Int!) {
        article(input: $id) {
            id
            title
            category
            content
            featurePoint
            isPublished
            createdAt
            EditedAt
        }
    }
`

const ArticlePage = async ({params}: {params: {id: string}}) => {
    const client = useApolloClient();
    
    const {data, errors} = await client.query({
        query: GET_ARTICLE_DETAIL,
        variables: {id: Number(params.id)}
    })

    if (errors) {
    console.error('Error occurrd:', errors)
    }

    const {article} = data;

    return (
        <article className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6 lg:max-w-4xl">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl lg:text-6xl">{article.title}</h1>
            <div className='flex space-x-4'>
            <p className="flex-row text-gray-500 dark:text-gray-400">投稿日：{new Date(article.createdAt).toLocaleDateString()}</p>
            <p className="flex-row text-gray-500 dark:text-gray-400">更新日：{new Date(article.EditedAt).toLocaleDateString()}</p>
            </div>
          </div>
          <Markdown remarkPlugins={[remarkGfm]}>{article.content}</Markdown>
        </div>
      </div>
    </article>
    )
    
}

export default ArticlePage