import { Hono } from "hono";
import New from "./views/new";
import Top from "./views/top";
import { GetArticles } from "../usecase/getArticles";

const article = new Hono().basePath("/articles");

article.get("/", async (c) => {
  const articles = await GetArticles()
  return c.html(<Top articles={articles} />);
});

article.get("/new", async (c) => {
  return c.html(<New />);
});

article.post("/create", async (c) => {
  return c.redirect("/articles");
});

export default article;
