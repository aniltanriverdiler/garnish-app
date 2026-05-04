/**
 * JWT kimlik doğrulama (authentication) ve rol yetkilendirme (authorization) middleware'leri.
 *
 * authenticate: Gelen request'teki Authorization header'dan Bearer token'ı çıkarır,
 * JWT olarak doğrular, token içindeki userId ile veritabanından kullanıcıyı çeker
 * ve req.user objesine atar. Auth gerektiren tüm route'larda kullanılır.
 *
 * requireRole: authenticate'den sonra çalışır. Kullanıcının rolünü kontrol eder,
 * yeterli yetkisi yoksa 403 Forbidden döner. Admin paneli gibi kısıtlı route'lar için.
 *
 * Ayrıca Express Request arayüzünü global olarak genişleterek req.user tipini tanımlar.
 */

import { Request, Response, NextFunction } from "express";
import { UserRole } from "@prisma/client";
import { prisma } from "../libs/prisma";
import { verifyAccessToken } from "../utils/jwt";
import { unauthorized, forbidden } from "../utils/api-error";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

// Extend Express Request to include user property
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

// Verifies JWT token and attaches user to request
export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw unauthorized("Missing or invalid authorization header");
    }

    const token = authHeader.slice(7);
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      throw unauthorized("User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    // Map specific JWT errors to user-friendly messages
    next(error instanceof Error && error.name === "JsonWebTokenError"
      ? unauthorized("Invalid token")
      : error instanceof Error && error.name === "TokenExpiredError"
        ? unauthorized("Token expired")
        : error);
  }
}

// Checks if authenticated user has one of the required roles
export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(unauthorized());
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(forbidden("Insufficient permissions"));
      return;
    }

    next();
  };
}
