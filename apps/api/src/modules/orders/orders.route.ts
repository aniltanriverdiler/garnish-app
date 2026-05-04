/**
 * Sipariş (order) modülü route tanımları.
 * Sipariş oluşturma, listeleme ve detay görüntüleme endpoint'lerini sağlar.
 * Tüm endpoint'ler authenticate middleware'i gerektirir.
 *
 * Endpoint'ler:
 *   POST /     — Yeni sipariş oluştur (validation + fiyat hesaplama + ürün doğrulama)
 *   GET  /     — Kullanıcının siparişlerini listele (en yeniden eskiye)
 *   GET  /:id  — Sipariş detayı
 *
 * Sipariş oluşturma akışı:
 * 1. Teslimat adresi ve restoran doğrulanır
 * 2. Siparişteki ürünlerin varlığı ve uygunluğu kontrol edilir
 * 3. Tüm ürünlerin aynı restorana ait olduğu doğrulanır
 * 4. Ürün opsiyonları veritabanındaki fiyatlarla hesaplanır (client fiyatına güvenilmez)
 * 5. Toplam fiyat sunucu tarafında hesaplanır (güvenlik)
 * 6. Sipariş, kalemleri ve opsiyonları tek seferde oluşturulur (nested create)
 */

import { Router, Request, Response, NextFunction } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { prisma } from "../../libs/prisma";
import { createOrderSchema, type CreateOrderInput } from "@garnish/shared";
import { validate } from "../../middlewares/validation.middleware";
import { badRequest, notFound } from "../../utils/api-error";

const router = Router();

// POST / — create a new order with server-side price validation
router.post(
  "/",
  authenticate,
  validate({ body: createOrderSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = req.body as CreateOrderInput;

      // Verify delivery address belongs to the user
      const address = await prisma.address.findFirst({
        where: {
          id: input.deliveryAddressId,
          userId: req.user!.id,
        },
      });

      if (!address) throw notFound("Delivery address not found");

      const restaurant = await prisma.restaurant.findUnique({
        where: { id: input.restaurantId },
      });

      if (!restaurant) throw notFound("Restaurant not found");

      // Validate all products exist and are available
      const productIds = input.items.map((item) => item.productId);

      const products = await prisma.product.findMany({
        where: {
          id: { in: productIds },
          isAvailable: true,
        },
        include: { options: true },
      });

      if (products.length !== productIds.length) {
        throw badRequest("One or more products are not available");
      }

      const productMap = new Map(
        products.map((product) => [product.id, product]),
      );

      // Calculate line totals using DB prices (never trust client-side prices)
      const orderItems = input.items.map((item) => {
        const product = productMap.get(item.productId);
        if (!product) throw badRequest("Product not found");

        if (product.restaurantId !== input.restaurantId) {
          throw badRequest(
            "All products must belong to the selected restaurant",
          );
        }

        const selectedOptions = (item.options ?? []).map((option) => {
          const dbOption = product.options.find((o) => o.id === option.id);
          if (!dbOption) throw badRequest("Invalid product option");
          return dbOption;
        });

        const optionsTotal = selectedOptions.reduce(
          (sum, option) => sum + option.price,
          0,
        );
        const lineTotal = (product.price + optionsTotal) * item.quantity;

        return { item, product, selectedOptions, lineTotal };
      });

      const subTotal = orderItems.reduce(
        (sum, item) => sum + item.lineTotal,
        0,
      );
      const deliveryFee = restaurant.deliveryFee ?? 0;

      // Create order with items and options in a single nested write
      const order = await prisma.order.create({
        data: {
          userId: req.user!.id,
          restaurantId: input.restaurantId,
          deliveryAddressId: input.deliveryAddressId,
          paymentMethod: input.paymentMethod,
          note: input.note,
          deliveryFee,
          totalPrice: subTotal + deliveryFee,
          items: {
            create: orderItems.map(({ item, product, selectedOptions }) => ({
              productId: product.id,
              name: product.name,
              price: product.price,
              quantity: item.quantity,
              options: {
                create: selectedOptions.map((option) => ({
                  name: option.name,
                  price: option.price,
                  type: option.type,
                })),
              },
            })),
          },
        },
        include: {
          items: { include: { options: true } },
          restaurant: true,
          deliveryAddress: true,
        },
      });

      res
        .status(201)
        .json({
          success: true,
          data: order,
          message: "Order created successfully",
        });
    } catch (error) {
      next(error);
    }
  },
);

// GET / — list user's orders
router.get("/", authenticate, async (req: Request, res: Response) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user!.id },
    include: {
      items: { include: { options: true } },
      restaurant: true,
      deliveryAddress: true,
    },
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, data: orders });
});

// GET /:id — order detail
router.get("/:id", authenticate, async (req: Request, res: Response) => {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, userId: req.user!.id },
    include: {
      items: { include: { options: true } },
      restaurant: true,
      deliveryAddress: true,
    },
  });
  res.json({ success: true, data: order });
});

export default router;
