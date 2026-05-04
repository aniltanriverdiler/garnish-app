/**
 * Sepet (cart) modülü route tanımları ve iş mantığı.
 * Her kullanıcının tek bir kalıcı sepeti vardır (userId unique).
 * Sepet verisi backend'de saklanır — kullanıcı çıkış yapıp tekrar giriş yapsa bile korunur.
 *
 * Tüm endpoint'ler authenticate middleware'i gerektirir.
 *
 * Endpoint'ler:
 *   GET    /         — Kullanıcının sepetini getir (yoksa otomatik oluştur)
 *   POST   /add      — Sepete ürün ekle (varsa miktarını artır)
 *   PUT    /update   — Sepetteki ürünün miktarını güncelle
 *   DELETE /:productId — Sepetten belirli ürünü kaldır
 *   DELETE /         — Sepeti tamamen temizle
 *
 * getOrCreateCart yardımcı fonksiyonu upsert ile çalışır:
 * sepet yoksa oluşturur, varsa mevcut sepeti döner. Her endpoint sonunda
 * güncel sepet verisi product bilgileriyle birlikte döner.
 */

import { Router, Request, Response, NextFunction } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { prisma } from "../../libs/prisma";

const router = Router();

// Returns the user's cart (creates one if it doesn't exist)
async function getOrCreateCart(userId: string) {
  return prisma.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
    include: {
      items: {
        include: { product: true, options: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

// GET / — fetch cart
router.get("/", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cart = await getOrCreateCart(req.user!.id);
    res.json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
});

// POST /add — add item or increment quantity
router.post("/add", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, quantity = 1, options } = req.body;

    const cart = await getOrCreateCart(req.user!.id);

    const existingItem = cart.items.find((i) => i.productId === productId);

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      const newItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });

      // Attach selected options (toppings, sides) to the new cart item
      if (options && Array.isArray(options) && options.length > 0) {
        await prisma.cartItemOption.createMany({
          data: options.map((opt: { optionId: string; name: string; price: number; type: string }) => ({
            cartItemId: newItem.id,
            optionId: opt.optionId,
            name: opt.name,
            price: opt.price,
            type: opt.type as any,
          })),
        });
      }
    }

    const updated = await getOrCreateCart(req.user!.id);
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

// PUT /update — set quantity for an item (removes if quantity <= 0)
router.put("/update", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, quantity } = req.body;

    const cart = await getOrCreateCart(req.user!.id);
    const item = cart.items.find((i) => i.productId === productId);

    if (!item) {
      res.status(404).json({ success: false, message: "Item not found in cart" });
      return;
    }

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: item.id } });
    } else {
      await prisma.cartItem.update({
        where: { id: item.id },
        data: { quantity },
      });
    }

    const updated = await getOrCreateCart(req.user!.id);
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

// DELETE /:productId — remove a specific item from cart
router.delete("/:productId", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cart = await getOrCreateCart(req.user!.id);
    const item = cart.items.find((i) => i.productId === req.params.productId);

    if (!item) {
      res.status(404).json({ success: false, message: "Item not found in cart" });
      return;
    }

    await prisma.cartItem.delete({ where: { id: item.id } });

    const updated = await getOrCreateCart(req.user!.id);
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

// DELETE / — clear all items from cart
router.delete("/", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cart = await prisma.cart.findUnique({ where: { userId: req.user!.id } });

    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    const updated = await getOrCreateCart(req.user!.id);
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

export default router;
