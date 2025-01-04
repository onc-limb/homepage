import { Hono } from "hono";
import New from "./views/new";
import Top from "./views/top";

const article = new Hono().basePath("/articles");

article.get("/", async (c) => {
  return c.html(<Top />);
});

article.get("/new", async (c) => {
  return c.html(<New />);
});

article.post("/create", async (c) => {
  return c.redirect("/articles");
});

export default article;
