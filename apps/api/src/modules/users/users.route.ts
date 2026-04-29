import { Router, Request, Response } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { prisma } from "../../libs/prisma";

const router = Router();

router.get("/", authenticate, async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      phone: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  res.json({ success: true, data: users });
});

export default router;
