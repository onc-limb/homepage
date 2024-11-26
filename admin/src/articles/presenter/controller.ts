import { Hono } from "hono";

const article = new Hono().basePath("/article");

article.get("/", async () => {
  return new Response("hoge");
});

export default article;
