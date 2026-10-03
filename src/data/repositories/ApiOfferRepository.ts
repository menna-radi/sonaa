import type { Result } from '../../core/result/Result';
import { ok, fail } from '../../core/result/Result';
import type { AppError } from '../../core/errors/AppError';
import { apiClient } from '../../core/network/apiClient';
import { API_ENDPOINTS } from '../../core/config/apiEndpoints';
import type { OfferRepository } from '../../domain/repositories/OfferRepository';
import type { Offer, OfferInput } from '../../domain/entities/Offer';

interface RawOffer {
  id: string;
  title?: string;
  titleEn?: string;
  titleAr?: string;
  subtitle?: string;
  subtitleEn?: string;
  subtitleAr?: string;
  buttonText?: string;
  buttonTextEn?: string;
  buttonTextAr?: string;
  imageUrl: string;
  bannerType?: 'PROMO' | 'EMERGENCY_SOS';
  placement?: 'TOP' | 'FEATURED';
  targetType?: Offer['targetType'];
  targetId?: string | null;
  targetUrl?: string | null;
  isActive?: boolean;
  startDate?: string | null;
  endDate?: string | null;
  createdAt?: string;
}

function mapOffer(item: RawOffer): Offer {
  return {
    id: item.id,
    titleEn: item.titleEn ?? item.title ?? '',
    titleAr: item.titleAr ?? item.title ?? '',
    subtitleEn: item.subtitleEn ?? item.subtitle ?? '',
    subtitleAr: item.subtitleAr ?? item.subtitle ?? '',
    buttonTextEn: item.buttonTextEn ?? item.buttonText ?? '',
    buttonTextAr: item.buttonTextAr ?? item.buttonText ?? '',
    imageUrl: item.imageUrl,
    bannerType: item.bannerType === 'EMERGENCY_SOS' ? 'EMERGENCY_SOS' : 'PROMO',
    placement: item.placement === 'FEATURED' ? 'FEATURED' : 'TOP',
    targetType: item.targetType ?? 'NONE',
    targetId: item.targetId ?? undefined,
    targetUrl: item.targetUrl ?? undefined,
    isActive: item.isActive !== false,
    startDate: item.startDate ?? undefined,
    endDate: item.endDate ?? undefined,
    createdAt: item.createdAt ?? '',
  };
}

const isoOrNull = (v: string | undefined): string | null => {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

export class ApiOfferRepository implements OfferRepository {
  async list(): Promise<Result<Offer[]>> {
    try {
      const items = await apiClient.get<RawOffer[]>(API_ENDPOINTS.admin.promotions);
      return ok((Array.isArray(items) ? items : []).map(mapOffer));
    } catch (error) {
      return fail(error as AppError);
    }
  }

  async create(input: OfferInput): Promise<Result<Offer>> {
    try {
      const created = await apiClient.post<RawOffer>(API_ENDPOINTS.admin.promotions, {
        title: input.titleEn,
        subtitle: input.subtitleEn,
        buttonText: input.buttonTextEn,
        titleEn: input.titleEn,
        titleAr: input.titleAr,
        subtitleEn: input.subtitleEn,
        subtitleAr: input.subtitleAr,
        buttonTextEn: input.buttonTextEn,
        buttonTextAr: input.buttonTextAr,
        imageUrl: input.imageUrl,
        bannerType: input.bannerType,
        placement: input.placement,
        targetType: input.targetType,
        targetId: input.targetId,
        targetUrl: input.targetUrl ?? null,
        startDate: isoOrNull(input.startDate),
        endDate: isoOrNull(input.endDate),
      });
      return ok(mapOffer(created));
    } catch (error) {
      return fail(error as AppError);
    }
  }

  async update(id: string, patch: Partial<OfferInput>): Promise<Result<Offer>> {
    try {
      const body: Record<string, unknown> = {};
      if (patch.titleEn !== undefined) {
        body.title = patch.titleEn;
        body.titleEn = patch.titleEn;
      }
      if (patch.subtitleEn !== undefined) {
        body.subtitle = patch.subtitleEn;
        body.subtitleEn = patch.subtitleEn;
      }
      if (patch.buttonTextEn !== undefined) {
        body.buttonText = patch.buttonTextEn;
        body.buttonTextEn = patch.buttonTextEn;
      }
      if (patch.titleAr !== undefined) body.titleAr = patch.titleAr;
      if (patch.subtitleAr !== undefined) body.subtitleAr = patch.subtitleAr;
      if (patch.buttonTextAr !== undefined) body.buttonTextAr = patch.buttonTextAr;
      if (patch.imageUrl !== undefined) body.imageUrl = patch.imageUrl;
      if (patch.bannerType !== undefined) body.bannerType = patch.bannerType;
      if (patch.placement !== undefined) body.placement = patch.placement;
      if (patch.targetType !== undefined) body.targetType = patch.targetType;
      if (patch.targetId !== undefined) body.targetId = patch.targetId;
      if (patch.targetUrl !== undefined) body.targetUrl = patch.targetUrl;
      if (patch.startDate !== undefined) body.startDate = isoOrNull(patch.startDate);
      if (patch.endDate !== undefined) body.endDate = isoOrNull(patch.endDate);
      const updated = await apiClient.patch<RawOffer>(`${API_ENDPOINTS.admin.promotions}/${id}`, body);
      return ok(mapOffer(updated));
    } catch (error) {
      return fail(error as AppError);
    }
  }

  async toggle(id: string): Promise<Result<Offer>> {
    try {
      const toggled = await apiClient.put<RawOffer>(API_ENDPOINTS.admin.togglePromotion(id), {});
      return ok(mapOffer(toggled));
    } catch (error) {
      return fail(error as AppError);
    }
  }

  async remove(id: string): Promise<Result<boolean>> {
    try {
      await apiClient.delete(API_ENDPOINTS.admin.deletePromotion(id));
      return ok(true);
    } catch (error) {
      return fail(error as AppError);
    }
  }
}
export default ApiOfferRepository;
