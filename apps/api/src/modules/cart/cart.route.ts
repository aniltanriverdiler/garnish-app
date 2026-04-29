import { Router, Request, Response } from "express";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/", authenticate, (_req: Request, res: Response) => {
  res.json({ success: true, data: [] });
});

export default router;
