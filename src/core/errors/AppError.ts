export abstract class AppError extends Error {
  public abstract readonly code: string;
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NetworkError extends AppError {
  public readonly code = 'NETWORK_ERROR';
}

export class UnauthorizedError extends AppError {
  public readonly code = 'UNAUTHORIZED_ERROR';
}

export class ForbiddenError extends AppError {
  public readonly code = 'FORBIDDEN_ERROR';
}

export interface ValidationErrorDetail {
  field: string;
  message: string;
}

export class ValidationError extends AppError {
  public readonly code = 'VALIDATION_ERROR';
  public readonly details: ValidationErrorDetail[];

  constructor(message: string, details: ValidationErrorDetail[] = []) {
    super(message);
    this.details = details;
  }
}

export class NotFoundError extends AppError {
  public readonly code = 'NOT_FOUND_ERROR';
}

export class TimeoutError extends AppError {
  public readonly code = 'TIMEOUT_ERROR';
}

export class ServerError extends AppError {
  public readonly code = 'SERVER_ERROR';
  public readonly statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class UnknownError extends AppError {
  public readonly code = 'UNKNOWN_ERROR';
}
