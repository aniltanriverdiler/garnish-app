import { Router, Request, Response } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { prisma } from "../../libs/prisma";

const router = Router();

router.get("/", authenticate, async (req: Request, res: Response) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user!.id },
    include: {
      items: { include: { options: true } },
      restaurant: true,
      deliveryAddress: true,
    },
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, data: orders });
});

router.get("/:id", authenticate, async (req: Request, res: Response) => {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, userId: req.user!.id },
    include: {
      items: { include: { options: true } },
      restaurant: true,
      deliveryAddress: true,
    },
  });
  res.json({ success: true, data: order });
});

export default router;
