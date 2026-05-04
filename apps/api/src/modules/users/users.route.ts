/**
 * Kullanıcı (user) modülü route tanımları.
 * Kullanıcı profili görüntüleme ve güncelleme endpoint'lerini sağlar.
 * Tüm endpoint'ler authenticate middleware'i gerektirir.
 *
 * Endpoint'ler:
 *   GET  /     — Tüm kullanıcıları listele (admin kullanımı)
 *   GET  /me   — Giriş yapan kullanıcının profili (adresler dahil)
 *   PATCH /me  — Profil güncelleme (e-posta benzersizlik kontrolü ile)
 *
 * Profil güncellemede req.body doğrudan Prisma update'e gönderilir
 * çünkü validate middleware'i updateUserSchema ile filtreleme yapar.
 */

import { Router, Request, Response, NextFunction } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { prisma } from "../../libs/prisma";
import { updateUserSchema } from "@garnish/shared";
import { validate } from "../../middlewares/validation.middleware";
import { conflict } from "../../utils/api-error";

const router = Router();

// GET / — list all users
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

// GET /me — current user's profile with addresses
router.get("/me", authenticate, async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      phone: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      addresses: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  res.json({ success: true, data: user });
});

// PATCH /me — update current user's profile
router.patch(
  "/me",
  authenticate,
  validate({ body: updateUserSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check email uniqueness if email is being changed
      if (req.body.email) {
        const existing = await prisma.user.findFirst({
          where: {
            email: req.body.email,
            id: { not: req.user!.id },
          },
        });

        if (existing) throw conflict("This email is already in use");
      }

      const user = await prisma.user.update({
        where: { id: req.user!.id },
        data: req.body,
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

      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
