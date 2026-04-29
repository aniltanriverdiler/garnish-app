import { Router, Request, Response } from "express";
import { prisma } from "../../libs/prisma";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
  res.json({ success: true, data: categories });
});

router.get("/:id", async (req: Request, res: Response) => {
  const category = await prisma.category.findUnique({
    where: { id: req.params.id },
    include: { products: true },
  });
  res.json({ success: true, data: category });
});

export default router;
