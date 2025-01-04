import type { FC } from "hono/jsx";
import Layout from "../../../layout";

type Props = {
  articles: {title: string, category: string, content: string}[];
};
  
const Top: FC = (props: Props) => {
    return (
      <Layout>
        <h1>投稿記事一覧</h1>
        <a href="/articles/new">記事投稿</a>
      {props.articles.map((article, index) => (
        <div key={index}>
          <h2>{article.title}</h2>
          <p>カテゴリー: {article.category}</p>
          <p>本文: {article.content}</p>
        </div>
      ))}
      </Layout>
    )
  }

export default Top