/**
 * Şifre hashleme ve doğrulama yardımcı fonksiyonları.
 * bcrypt kullanılır — adaptive hash fonksiyonu olduğundan brute-force saldırılara karşı dayanıklıdır.
 * SALT_ROUNDS değeri hash hesaplama maliyetini belirler (12 = güvenli + kabul edilebilir hız).
 * Düz metin şifre asla veritabanına yazılmaz.
 */

import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

// Hashes a plain-text password with bcrypt
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// Compares a plain-text password against a bcrypt hash
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
