import { z } from 'zod';
import { text, email, optionalHttpUrl } from './common';

export const loginSchema = z.object({
  identifier: z.string().trim().min(3, 'val_min_len|3'),
  password: z.string().min(6, 'val_min_len|6'),
});

export const moderationNotesSchema = (required: boolean) =>
  z.object({
    notes: required ? text(3, 500) : z.string().trim().max(500, 'val_max_len|500').optional(),
  });

export const disputeResolveSchema = z.object({
  resolution: z.enum(['REFUND_CLIENT', 'PAY_CRAFTSMAN']),
  notes: z.string().trim().max(500).optional(),
});

export const reportModerateSchema = z.object({
  action: z.enum(['dismiss', 'suspend', 'ban']),
  notes: z.string().trim().max(500).optional(),
});

export const suspendSchema = z.object({ reason: text(3, 300) });

export const broadcastSchema = z
  .object({
    title: text(3, 80),
    body: text(3, 500),
    audience: z.enum(['ALL', 'CUSTOMERS', 'CRAFTSMEN']),
    targetCity: z.string().trim().max(60).optional(),
    imageUrl: optionalHttpUrl,
    deepLink: z.string().trim().max(300).optional(),
    scheduledAt: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.scheduledAt && !(Date.parse(v.scheduledAt) > Date.now()))
      ctx.addIssue({ code: 'custom', path: ['scheduledAt'], message: 'val_future' });
  });

export const categorySchema = z.object({
  key: z.string().trim().toUpperCase().regex(/^[A-Z0-9_]{3,32}$/, 'val_key_format'),
  nameEn: text(3, 60),
  nameAr: text(3, 60),
  nameHe: z.string().trim().max(60).optional(),
});

export const subCategorySchema = z.object({
  nameEn: text(2, 60),
  nameAr: text(2, 60),
  nameHe: z.string().trim().max(60).optional(),
});

export const fieldSchema = z
  .object({
    label: text(2, 60),
    fieldKey: z.string().trim().regex(/^[a-z][a-zA-Z0-9_]{1,39}$/, 'val_key_format'),
    fieldType: z.enum(['text', 'number', 'select', 'textarea', 'image']),
    options: z.string().optional(),
    isRequired: z.boolean().default(false),
  })
  .superRefine((v, ctx) => {
    if (v.fieldType === 'select' && !(v.options ?? '').split('\n').map((s) => s.trim()).filter(Boolean).length)
      ctx.addIssue({ code: 'custom', path: ['options'], message: 'val_required' });
  });

export const newAdminSchema = z.object({
  firstName: text(2, 40),
  lastName: text(2, 40),
  email,
  title: text(2, 60),
});

export const userStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED', 'BLOCKED']),
  reason: z.string().trim().max(300).optional(),
});

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'val_required'),
    newPassword: z
      .string()
      .min(8, 'val_min_len|8')
      .regex(/[A-Za-z]/, 'val_letter')
      .regex(/[0-9]/, 'val_digit'),
    confirm: z.string(),
  })
  .refine((v) => v.newPassword === v.confirm, { path: ['confirm'], message: 'val_match' });
