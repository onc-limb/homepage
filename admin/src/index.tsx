import { Hono } from "hono";
import Top from "./root";
import router from "./router";

const app = new Hono();
app.route("/", router)

app.get("/", (c) => {
  const message = ["Good Morning", "Good Evening", "Good Night"];
  return c.html(<Top message={message} />);
});

export default app;
