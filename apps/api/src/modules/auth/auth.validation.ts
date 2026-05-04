/**
 * Auth modülü validasyon şemaları.
 * @garnish/shared paketinden Zod şemalarını ve tiplerini re-export eder.
 * Bu sayede validation middleware shared paketteki şemaları doğrudan kullanır.
 * Şema değişikliği tek yerden (shared) yapılır, frontend ve backend otomatik güncellenir.
 */

export { loginSchema, registerSchema } from "@garnish/shared";
export type { LoginInput, RegisterInput } from "@garnish/shared";
