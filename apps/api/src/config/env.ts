/**
 * Ortam değişkenlerinin tip-güvenli doğrulamasını yapan dosya.
 * Uygulama başlatılırken .env dosyasındaki değerler Zod şeması ile parse edilir.
 * Eksik veya hatalı değişken varsa uygulama hemen durur — runtime'da sürpriz hata önlenir.
 * Tüm backend dosyaları env değerlerine bu modül üzerinden erişir.
 */

import { z } from "zod";

// Defines the expected shape and defaults for all environment variables
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  CORS_ORIGIN: z.string().default("*"),
});

// Fail fast if any required variable is missing
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
