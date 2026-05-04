/**
 * Adres (address) modülü route tanımları.
 * Kullanıcının teslimat adreslerinin CRUD işlemlerini sağlar.
 * Tüm endpoint'ler authenticate middleware'i gerektirir.
 * Adresler kullanıcıya bağlıdır — bir kullanıcı sadece kendi adreslerini görebilir/değiştirebilir.
 *
 * Endpoint'ler:
 *   GET    /      — Kullanıcının adreslerini listele
 *   POST   /      — Yeni adres ekle (body: createAddressSchema)
 *   PATCH  /:id   — Adresi güncelle (kısmi güncelleme)
 *   DELETE /:id   — Adresi sil
 *
 * updateMany ve deleteMany kullanılır — where koşulunda userId kontrolü
 * yapılarak başka kullanıcının adresine erişim engellenir (authorization).
 */

import { Router, Request, Response, NextFunction } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validation.middleware";
import { createAddressSchema } from "@garnish/shared";
import { prisma } from "../../libs/prisma";

const router = Router();

// GET / — list user's addresses
router.get("/", authenticate, async (req: Request, res: Response) => {
  const addresses = await prisma.address.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, data: addresses });
});

// POST / — create a new address
router.post(
  "/",
  authenticate,
  validate({ body: createAddressSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const address = await prisma.address.create({
        data: {
          ...req.body,
          userId: req.user!.id,
        },
      });
      res.status(201).json({ success: true, data: address });
    } catch (error) {
      next(error);
    }
  },
);

// PATCH /:id — update an address (partial)
router.patch(
  "/:id",
  authenticate,
  validate({ body: createAddressSchema.partial() }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const address = await prisma.address.updateMany({
        where: {
          id: req.params.id as string,
          userId: req.user!.id,
        },
        data: req.body,
      });

      res.json({ success: true, data: address });
    } catch (error) {
      next(error);
    }
  },
);

// DELETE /:id — delete an address
router.delete(
  "/:id",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await prisma.address.deleteMany({
        where: { id: req.params.id as string, userId: req.user!.id },
      });
      res.json({ success: true, message: "Address deleted" });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
