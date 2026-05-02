import { Router, Request, Response, NextFunction } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { prisma } from "../../libs/prisma";
import { updateUserSchema } from "@garnish/shared";
import { validate } from "../../middlewares/validation.middleware";
import { conflict } from "../../utils/api-error";

const router = Router();

// Get all users
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

// Get user profile by id
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

// Update user profile
router.patch(
  "/me",
  authenticate,
  validate({ body: updateUserSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
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
