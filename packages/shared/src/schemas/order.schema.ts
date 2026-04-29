import { z } from "zod";
import { OrderStatus, PaymentMethod } from "../enums";

export const createOrderSchema = z.object({
  restaurantId: z.string().min(1, "Restoran zorunludur"),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1, "Miktar en az 1 olmalıdır"),
        options: z
          .array(
            z.object({
              id: z.string(),
              name: z.string(),
              price: z.number(),
              type: z.string(),
            })
          )
          .optional(),
      })
    )
    .min(1, "Sipariş en az 1 ürün içermelidir"),
  deliveryAddressId: z.string().min(1, "Teslimat adresi zorunludur"),
  note: z.string().optional(),
  paymentMethod: z.nativeEnum(PaymentMethod),
});

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
