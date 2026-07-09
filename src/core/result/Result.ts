import { AppError } from '../errors/AppError';

export type Result<T, E extends AppError = AppError> =
  | { success: true; data: T }
  | { success: false; error: E };

export const ok = <T>(data: T): Result<T, never> => ({
  success: true,
  data,
});

export const fail = <E extends AppError>(error: E): Result<never, E> => ({
  success: false,
  error,
});
