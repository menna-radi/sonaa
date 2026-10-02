import { z } from 'zod';

export const req = (n = 1) => z.string().trim().min(n, n === 1 ? 'val_required' : `val_min_len|${n}`);

export const text = (min: number, max: number) =>
  z
    .string()
    .trim()
    .min(min, min <= 1 ? 'val_required' : `val_min_len|${min}`)
    .max(max, `val_max_len|${max}`);

export const httpUrl = z
  .string()
  .trim()
  .max(2000, 'val_max_len|2000')
  .transform((v) => (/^https?:\/\//i.test(v) ? v : `https://${v}`))
  .refine(
    (v) => {
      try {
        const u = new URL(v);
        return (u.protocol === 'http:' || u.protocol === 'https:') && u.hostname.includes('.');
      } catch {
        return false;
      }
    },
    'val_url'
  );

/** '' → null, otherwise a validated http(s) URL */
export const optionalHttpUrl = z.preprocess(
  (v) => (typeof v === 'string' && v.trim() === '' ? null : v),
  z.union([z.null(), httpUrl])
);

export const isoDateOrNull = z.preprocess(
  (v) => (v === '' || v == null ? null : v),
  z.union([z.null(), z.string().refine((s) => !Number.isNaN(Date.parse(s)), 'val_required')])
);

export const email = z.string().trim().toLowerCase().email('val_email');

export const phone = z.string().trim().regex(/^\+?[0-9 ()-]{7,20}$/, 'val_phone');
