import type { FC } from "hono/jsx";
import Layout from "../../../layout";
  
const New: FC = () => {
  const categories = [{id: 1, name: "engineer"}, {id: 2, name: "climbing"}]
    return (
      <Layout>
        <h1>記事作成</h1>
      </Layout>
    )
  }

export default New