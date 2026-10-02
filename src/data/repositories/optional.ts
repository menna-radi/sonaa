import { ok, type Result } from '../../core/result/Result';
import { NotFoundError } from '../../core/errors/AppError';

export async function optional<T, R>(
  call: () => Promise<T>,
  map: (raw: T) => Result<R | null>
): Promise<Result<R | null>> {
  try {
    return map(await call());
  } catch (e) {
    if (e instanceof NotFoundError) return ok(null);
    throw e;
  }
}
