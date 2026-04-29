import { Router, Request, Response, NextFunction } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validation.middleware";
import { createAddressSchema } from "@garnish/shared";
import { prisma } from "../../libs/prisma";

const router = Router();

router.get("/", authenticate, async (req: Request, res: Response) => {
  const addresses = await prisma.address.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, data: addresses });
});

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
  }
);

router.delete("/:id", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.address.deleteMany({
      where: { id: req.params.id, userId: req.user!.id },
    });
    res.json({ success: true, message: "Address deleted" });
  } catch (error) {
    next(error);
  }
});

export default router;
