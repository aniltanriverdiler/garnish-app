/**
 * JWT (JSON Web Token) oluşturma ve doğrulama yardımcı fonksiyonları.
 *
 * Uygulama iki tür token kullanır:
 * - Access token (kısa ömürlü, varsayılan 15dk): Her API isteğinde Authorization header'da gönderilir.
 * - Refresh token (uzun ömürlü, varsayılan 7 gün): Sadece access token yenilemek için kullanılır.
 *
 * İki ayrı secret key kullanılır — birinin ele geçirilmesi diğerini etkilemez.
 * Token payload'ı yalnızca userId içerir, hassas veri taşımaz.
 *
 * Bu fonksiyonlar auth.service ve auth.middleware tarafından kullanılır.
 */

import jwt from "jsonwebtoken";
import { env } from "../config/env";

interface TokenPayload {
  userId: string;
}

// Generates access + refresh token pair for a user
export function generateTokens(userId: string) {
  const accessToken = jwt.sign({ userId } satisfies TokenPayload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });

  const refreshToken = jwt.sign({ userId } satisfies TokenPayload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });

  return { accessToken, refreshToken };
}

// Verifies and decodes an access token
export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}

// Verifies and decodes a refresh token
export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
}
