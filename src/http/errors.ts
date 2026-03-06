/** Base error for all ProcessUnity SDK errors */
export class ProcessUnityError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly responseBody?: string,
  ) {
    super(message);
    this.name = "ProcessUnityError";
  }
}

/** Authentication / token errors (401, bad credentials) */
export class AuthError extends ProcessUnityError {
  constructor(message: string, statusCode?: number, responseBody?: string) {
    super(message, statusCode, responseBody);
    this.name = "AuthError";
  }
}

/** General API errors (4xx/5xx that aren't auth-related) */
export class ApiError extends ProcessUnityError {
  constructor(
    message: string,
    public readonly statusCode_: number,
    responseBody?: string,
  ) {
    super(message, statusCode_, responseBody);
    this.name = "ApiError";
  }
}

/** Validation errors from the PU envelope (HasError: true) */
export class ValidationError extends ProcessUnityError {
  constructor(
    message: string,
    public readonly puMessage: string | null,
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

/** Rate limit errors (429) */
export class RateLimitError extends ProcessUnityError {
  public readonly retryAfter?: number;

  constructor(message: string, retryAfter?: number, responseBody?: string) {
    super(message, 429, responseBody);
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
  }
}
