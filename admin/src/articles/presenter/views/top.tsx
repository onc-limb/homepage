import type { FC } from "hono/jsx";
import Layout from "../../../layout";
  
const Top: FC = () => {
    return (
      <Layout>
        <h1>投稿記事一覧</h1>
        <a href="/articles/new">記事投稿</a>
      </Layout>
    )
  }

export default Top