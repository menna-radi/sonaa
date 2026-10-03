import { z } from 'zod';
import { text, phone } from './common';

const lines = (max: number) =>
  z.preprocess(
    (v) => (typeof v === 'string' ? v.split('\n').map((s) => s.trim()).filter(Boolean) : v),
    z.array(z.string().max(120, 'val_max_len|120')).max(max, `val_max_items|${max}`)
  );

export const planSchema = z.object({
  key: z.string().trim().toUpperCase().regex(/^[A-Z0-9_]{3,32}$/, 'val_key_format'),
  nameEn: text(3, 80),
  nameAr: text(3, 80),
  durationMonths: z.coerce
    .number({ message: 'val_int' })
    .int('val_int')
    .min(1, 'val_range|1-36')
    .max(36, 'val_range|1-36'),
  price: z.coerce
    .number({ message: 'val_positive' })
    .positive('val_positive')
    .max(100000, 'val_range|0-100000'),
  featuresEn: lines(10),
  featuresAr: lines(10),
  isPopular: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export type PlanFormValues = z.input<typeof planSchema>;

export const bitSettingsSchema = z.object({
  phoneNumber: phone,
  recipientName: text(2, 80),
  instructionsEn: text(10, 1000),
  instructionsAr: text(10, 1000),
});

export const rejectReasonSchema = z.object({ reason: text(3, 500) });

export const extendDaysSchema = z.object({
  days: z.coerce
    .number({ message: 'val_int' })
    .int('val_int')
    .min(1, 'val_range|1-3650')
    .max(3650, 'val_range|1-3650'),
});

export const freeTasksSchema = z.object({
  freeTasksRemaining: z.coerce
    .number({ message: 'val_int' })
    .int('val_int')
    .min(0, 'val_range|0-100')
    .max(100, 'val_range|0-100'),
});

export const platformSettingsSchema = z.object({
  freeTasksCount: z.coerce.number().int('val_int').min(0, 'val_range|0-100').max(100, 'val_range|0-100'),
  commissionRatePercent: z.coerce
    .number({ message: 'val_positive' })
    .gt(0, 'val_range|0.1-50')
    .max(50, 'val_range|0.1-50'),
});

/** UI shows percent; API stores a fraction with ≤4 decimals. */
export const percentToFraction = (p: number) => Math.round((p / 100) * 10000) / 10000;
export const fractionToPercent = (f: number) => Math.round(f * 10000) / 100;
