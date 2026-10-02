import { z } from 'zod';
import { text, optionalHttpUrl, isoDateOrNull } from './common';

export const OFFER_TARGETS = ['NONE', 'URL', 'CRAFTSMAN', 'CATEGORY', 'TASK', 'SERVICE'] as const;

export const offerSchema = z
  .object({
    titleEn: text(3, 80),
    titleAr: text(3, 80),
    subtitleEn: text(3, 160),
    subtitleAr: text(3, 160),
    buttonTextEn: text(1, 30),
    buttonTextAr: text(1, 30),
    imageUrl: z.string().trim().min(5, 'val_required'),
    bannerType: z.enum(['PROMO', 'EMERGENCY_SOS']),
    placement: z.enum(['TOP', 'FEATURED']),
    targetType: z.enum(OFFER_TARGETS),
    targetId: z.string().trim().optional(),
    targetUrl: optionalHttpUrl,
    startDate: isoDateOrNull,
    endDate: isoDateOrNull,
  })
  .superRefine((v, ctx) => {
    if (v.targetType === 'URL' && !v.targetUrl)
      ctx.addIssue({ code: 'custom', path: ['targetUrl'], message: 'val_required' });
    if (['CRAFTSMAN', 'CATEGORY', 'TASK', 'SERVICE'].includes(v.targetType) && !v.targetId)
      ctx.addIssue({ code: 'custom', path: ['targetId'], message: 'val_required' });
    if (v.startDate && v.endDate && Date.parse(v.endDate) <= Date.parse(v.startDate))
      ctx.addIssue({ code: 'custom', path: ['endDate'], message: 'val_date_order' });
  });

export const adCampaignSchema = z
  .object({
    name: text(3, 80),
    budget: z.coerce
      .number({ invalid_type_error: 'val_positive' })
      .positive('val_positive')
      .max(10_000_000, 'val_range|0-10000000'),
    placement: z.enum(['Home Banner', 'Featured Slots']),
    imageUrl: z.string().trim().optional(),
    description: z.string().trim().max(160, 'val_max_len|160').optional(),
    ctaText: z.string().trim().max(30, 'val_max_len|30').optional(),
    targetUrl: optionalHttpUrl,
    startDate: isoDateOrNull,
    endDate: isoDateOrNull,
    durationHours: z.coerce.number().positive('val_positive').optional(),
  })
  .superRefine((v, ctx) => {
    if (v.startDate && v.endDate && Date.parse(v.endDate) <= Date.parse(v.startDate))
      ctx.addIssue({ code: 'custom', path: ['endDate'], message: 'val_date_order' });
  });
