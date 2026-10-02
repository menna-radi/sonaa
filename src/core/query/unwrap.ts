import type { Result } from '../result/Result';

export function unwrap<T>(r: Result<T>): T {
  if (r.success) return r.data;
  throw r.error;
}
