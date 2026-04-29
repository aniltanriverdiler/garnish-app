import { z } from "zod";

export const getProductsSchema = z.object({
  categoryId: z.string().optional(),
  restaurantId: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(20).optional(),
});

export const createProductSchema = z.object({
  name: z.string().min(1, "Ürün adı zorunludur"),
  description: z.string().min(1, "Ürün açıklaması zorunludur"),
  price: z.number().positive("Fiyat pozitif olmalıdır"),
  image: z.string().min(1, "Ürün görseli zorunludur"),
  calories: z.number().optional(),
  protein: z.number().optional(),
  categoryId: z.string().min(1, "Kategori zorunludur"),
  restaurantId: z.string().min(1, "Restoran zorunludur"),
  isAvailable: z.boolean().default(true).optional(),
});

export type GetProductsInput = z.infer<typeof getProductsSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
