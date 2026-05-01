import { Router, Request, Response, NextFunction } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { prisma } from "../../libs/prisma";
import { createOrderSchema, type CreateOrderInput } from "@garnish/shared";
import { validate } from "../../middlewares/validation.middleware";
import { badRequest, notFound } from "../../utils/api-error";

const router = Router();

router.post(
  "/",
  authenticate,
  validate({ body: createOrderSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = req.body as CreateOrderInput;

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
