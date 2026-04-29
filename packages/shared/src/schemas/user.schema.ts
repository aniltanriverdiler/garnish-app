import { z } from "zod";

export const updateUserSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  phone: z.string().optional(),
  avatar: z.string().optional(),
});

export const createAddressSchema = z.object({
  title: z.string().min(1, "Adres başlığı zorunludur"),
  address: z.string().min(1, "Adres zorunludur"),
  city: z.string().min(1, "Şehir zorunludur"),
  district: z.string().min(1, "İlçe zorunludur"),
  postalCode: z.string().optional(),
  isDefault: z.boolean().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateAddressInput = z.infer<typeof createAddressSchema>;
