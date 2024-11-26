import { Hono } from "hono";
import Top from "./root";

const app = new Hono();

app.get("/", (c) => {
  const message = ["Good Morning", "Good Evening", "Good Night"];
  return c.html(<Top message={message} />);
});

export default app;
