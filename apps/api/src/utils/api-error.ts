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

export const badRequest = (message = "Bad request", errors?: Record<string, string[]>) =>
  new ApiError(400, message, errors);

export const unauthorized = (message = "Unauthorized") =>
  new ApiError(401, message);

export const forbidden = (message = "Forbidden") =>
  new ApiError(403, message);

export const notFound = (message = "Not found") =>
  new ApiError(404, message);

export const conflict = (message = "Conflict") =>
  new ApiError(409, message);

export const internalError = (message = "Internal server error") =>
  new ApiError(500, message);
