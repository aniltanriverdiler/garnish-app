/**
 * Global hata yakalama middleware'i.
 * Express'in 4 parametreli error handler formatını kullanır — route'lardan throw edilen
 * veya next(error) ile iletilen tüm hatalar buraya düşer.
 *
 * Hata tiplerine göre uygun HTTP yanıtı üretir:
 * - ApiError: Uygulama içinde bilinçli fırlatılan hatalar (400, 401, 403, 404, 409)
 * - ZodError: Validasyon hataları → alan bazlı hata mesajları (400)
 * - PrismaClientKnownRequestError: Veritabanı kısıt ihlalleri
 *   - P2002: Unique constraint violation → 409 Conflict
 *   - P2025: Kayıt bulunamadı → 404 Not Found
 * - Diğer: Production'da genel mesaj, development'ta detaylı hata (500)
 *
 * Bu middleware app.ts'de en son register edilmelidir,
 * aksi halde route'lardan gelen hatalar yakalanamaz.
 */

import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { ApiError } from "../utils/api-error";

// Catches all errors and returns appropriate HTTP response
export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Known application errors
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
    return;
  }

  // Zod validation errors — flatten into field-level messages
  if (err instanceof ZodError) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of err.issues) {
      const path = issue.path.join(".");
      if (!fieldErrors[path]) {
        fieldErrors[path] = [];
      }
      fieldErrors[path].push(issue.message);
    }

    res.status(400).json({
      success: false,
      message: "Validation error",
      errors: fieldErrors,
    });
    return;
  }

  // Prisma database constraint errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002": {
        const target = (err.meta?.target as string[]) ?? [];
        res.status(409).json({
          success: false,
          message: `A record with this ${target.join(", ")} already exists`,
        });
        return;
      }
      case "P2025":
        res.status(404).json({
          success: false,
          message: "Record not found",
        });
        return;
      default:
        res.status(400).json({
          success: false,
          message: "Database error",
        });
        return;
    }
  }

  // Unhandled errors — hide details in production
  console.error("Unhandled error:", err);

  res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
}
