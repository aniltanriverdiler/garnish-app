/**
 * Bu dosya, Prisma ORM istemcisinin (PrismaClient) singleton olarak yönetilmesini sağlar.
 * Development ortamında hot-reload (tsx watch) her dosya değişikliğinde modülleri yeniden yükler.
 * Bu durumda her seferinde yeni bir PrismaClient oluşturulur ve veritabanı bağlantı havuzu tükenir.
 * globalThis üzerinden referans tutarak bu sorun önlenir.
 *
 * ÖNEMLİ: Server çalışırken `prisma generate` komutu çalıştırılmamalıdır.
 * query_engine-windows.dll.node dosyası kilitli olacağından EPERM hatası alınır.
 * Önce sunucuyu durdurun, ardından `npm run db:generate` çalıştırın.
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// Reuse existing client in development to prevent connection pool exhaustion
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
