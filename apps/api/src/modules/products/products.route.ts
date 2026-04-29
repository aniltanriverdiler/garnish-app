import { Router, Request, Response } from "express";
import { prisma } from "../../libs/prisma";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const { categoryId, restaurantId, search } = req.query;

  const products = await prisma.product.findMany({
    where: {
      isAvailable: true,
      ...(categoryId ? { categoryId: String(categoryId) } : {}),
      ...(restaurantId ? { restaurantId: String(restaurantId) } : {}),
      ...(search ? { name: { contains: String(search), mode: "insensitive" as const } } : {}),
    },
    include: { options: true },
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, data: products });
});

router.get("/:id", async (req: Request, res: Response) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: { options: true, restaurant: true, category: true },
  });
  res.json({ success: true, data: product });
});

export default router;
