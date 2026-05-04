/**
 * Ürün (product) modülü route tanımları.
 * Ürün listeleme ve detay görüntüleme endpoint'lerini sağlar.
 * Kimlik doğrulama gerektirmez — herkes ürünleri görebilir.
 *
 * Endpoint'ler:
 *   GET /     — Ürün listesi (filtre: categoryId, restaurantId, search)
 *   GET /:id  — Ürün detayı (options, restaurant, category bilgileri dahil)
 *
 * Listeleme sorgusu yalnızca isAvailable: true olan ürünleri döner.
 * Arama case-insensitive olarak ürün adında arar.
 */

import { Router, Request, Response } from "express";
import { prisma } from "../../libs/prisma";

const router = Router();

// GET / — list products with optional filters
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

// GET /:id — product detail with options, restaurant and category
router.get("/:id", async (req: Request, res: Response) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: { options: true, restaurant: true, category: true },
  });
  res.json({ success: true, data: product });
});

export default router;
