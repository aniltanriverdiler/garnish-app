/**
 * Kategori (category) modülü route tanımları.
 * Ürün kategorilerinin listelenmesi ve detay görüntülenmesini sağlar.
 * Kimlik doğrulama gerektirmez.
 *
 * Endpoint'ler:
 *   GET /     — Tüm kategorileri listele (alfabetik sıra)
 *   GET /:id  — Kategori detayı (ilişkili ürünler dahil)
 */

import { Router, Request, Response } from "express";
import { prisma } from "../../libs/prisma";

const router = Router();

// GET / — list all categories
router.get("/", async (_req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
  res.json({ success: true, data: categories });
});

// GET /:id — category detail with products
router.get("/:id", async (req: Request, res: Response) => {
  const category = await prisma.category.findUnique({
    where: { id: req.params.id },
    include: { products: true },
  });
  res.json({ success: true, data: category });
});

export default router;
