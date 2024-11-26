import { Hono } from "hono";
import article from "./articles/presenter/controller";

const router = new Hono();

// サブルーターを統合
router.route("/", article);

export default router;
