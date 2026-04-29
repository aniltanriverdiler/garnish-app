import { Router, Request, Response } from "express";
import { prisma } from "../../libs/prisma";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const restaurants = await prisma.restaurant.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, data: restaurants });
});

router.get("/:id", async (req: Request, res: Response) => {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: req.params.id },
    include: { products: { where: { isAvailable: true } } },
  });
  res.json({ success: true, data: restaurant });
});

export default router;
