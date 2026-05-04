/**
 * Özelleştirilmiş API hata sınıfı ve factory fonksiyonları.
 * Route handler'lar ve service katmanı bu fonksiyonları kullanarak anlamlı HTTP hataları fırlatır.
 * Fırlatılan hatalar error.middleware tarafından yakalanır ve uygun HTTP yanıtına dönüştürülür.
 *
 * Factory fonksiyonları (badRequest, unauthorized, vb.) throw new ApiError(...) yerine
 * kısa ve okunabilir bir API sağlar: throw unauthorized("Token expired")
 */

// Custom error class with HTTP status code support
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errors?: Record<string, string[]>;

  constructor(
    statusCode: number,
    message: string,
    errors?: Record<string, string[]>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

// 400 Bad Request
export const badRequest = (message = "Bad request", errors?: Record<string, string[]>) =>
  new ApiError(400, message, errors);

// 401 Unauthorized
export const unauthorized = (message = "Unauthorized") =>
  new ApiError(401, message);

// 403 Forbidden
export const forbidden = (message = "Forbidden") =>
  new ApiError(403, message);

// 404 Not Found
export const notFound = (message = "Not found") =>
  new ApiError(404, message);

// 409 Conflict
export const conflict = (message = "Conflict") =>
  new ApiError(409, message);

// 500 Internal Server Error
export const internalError = (message = "Internal server error") =>
  new ApiError(500, message);
