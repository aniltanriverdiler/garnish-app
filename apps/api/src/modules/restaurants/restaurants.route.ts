/**
 * Restoran (restaurant) modülü route tanımları.
 * Aktif restoranların listelenmesi ve detay görüntülenmesini sağlar.
 * Kimlik doğrulama gerektirmez.
 *
 * Endpoint'ler:
 *   GET /     — Aktif restoranları listele (en yeniden eskiye)
 *   GET /:id  — Restoran detayı (yalnızca uygun ürünlerle birlikte)
 */

import { Router, Request, Response } from "express";
import { prisma } from "../../libs/prisma";

const router = Router();

// GET / — list active restaurants
router.get("/", async (_req: Request, res: Response) => {
  const restaurants = await prisma.restaurant.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, data: restaurants });
});

// GET /:id — restaurant detail with available products
router.get("/:id", async (req: Request, res: Response) => {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: req.params.id },
    include: { products: { where: { isAvailable: true } } },
  });
  res.json({ success: true, data: restaurant });
});

export default router;
