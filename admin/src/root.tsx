import type { FC } from "hono/jsx";

const Layout: FC = (props) => {
    return (
      <html>
        <body>{props.children}</body>
      </html>
    )
  }
  
const Top: FC<{message: string[]}> = (props: {message: string[]}) => {
    return (
      <Layout>
        <h1>Hello Hono!</h1>
        <ul>
          {props.message.map((message) => {
            return <li>{message}!!</li>
          })}
        </ul>
      </Layout>
    )
  }

export default Top