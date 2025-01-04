import { Hono } from "hono";
import Top from "./root";
import router from "./router";

const app = new Hono();
app.route("/", router)

app.get("/", (c) => {
  return c.html(<Top />);
});

export default app;
