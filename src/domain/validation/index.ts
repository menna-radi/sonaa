import type { ZodError, ZodTypeAny, z } from 'zod';

export type FieldErrors = Record<string, string>;

export function validate<S extends ZodTypeAny>(
  schema: S,
  data: unknown
): { ok: true; data: z.infer<S> } | { ok: false; errors: FieldErrors } {
  const r = schema.safeParse(data);
  if (r.success) return { ok: true, data: r.data };
  return { ok: false, errors: flatten(r.error) };
}

function flatten(e: ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const i of e.issues) {
    const k = i.path.join('.') || '_';
    if (!out[k]) out[k] = i.message;
  }
  return out;
}

/** 'val_min_len|3' → t('val_min_len').replace('{n}','3') */
export function tError(t: (k: string) => string, msg?: string): string | undefined {
  if (!msg) return undefined;
  const [key, param] = msg.split('|');
  const s = t(key);
  return param ? s.replace('{n}', param) : s;
}
