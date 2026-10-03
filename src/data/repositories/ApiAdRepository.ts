import { AdRepository, Campaign, PromotionOffer, AdCreativeDetails } from '../../domain/repositories/AdRepository';
import { Result, ok, fail } from '../../core/result/Result';
import { apiClient } from '../../core/network/apiClient';
import { API_ENDPOINTS } from '../../core/config/apiEndpoints';
import { AppError } from '../../core/errors/AppError';

interface ApiAdDTO {
  id: string;
  name: string;
  budget: number;
  spent?: number;
  status: 'ACTIVE' | 'PAUSED' | 'ENDED';
  placement?: string;
  impressions?: number;
  ctr?: number;
  conversions?: number;
  clicks?: number;
  imageUrl?: string;
  description?: string;
  ctaText?: string;
  targetType?: string;
  targetId?: string;
  targetUrl?: string;
  startDate?: string | null;
  endDate?: string | null;
}

type UiStatus = Campaign['status'];

const toUiStatus = (s: string | undefined): UiStatus => {
  if (s === 'PAUSED') return 'Paused';
  if (s === 'ENDED') return 'Ended';
  return 'Active';
};

const toApiStatus = (s: UiStatus): 'ACTIVE' | 'PAUSED' | 'ENDED' => {
  if (s === 'Paused') return 'PAUSED';
  if (s === 'Ended') return 'ENDED';
  return 'ACTIVE';
};

const num = (v: unknown): number => {
  const n = typeof v === 'string' || typeof v === 'number' ? Number(v) : NaN;
  return Number.isFinite(n) ? n : 0;
};

function mapCampaign(ad: ApiAdDTO): Campaign {
  const impressions = num(ad.impressions);
  const clicks = ad.clicks !== undefined ? num(ad.clicks) : num(ad.conversions);
  return {
    id: ad.id,
    name: ad.name,
    placement: ad.placement || 'Home Banner',
    status: toUiStatus(ad.status),
    impressions,
    clicks,
    ctr: ad.ctr !== undefined ? num(ad.ctr) : impressions > 0 ? (clicks / impressions) * 100 : 0,
    conversions: num(ad.conversions),
    budget: num(ad.budget),
    imageUrl: ad.imageUrl,
    description: ad.description,
    ctaText: ad.ctaText,
    targetType: ad.targetType,
    targetId: ad.targetId,
    targetUrl: ad.targetUrl,
    startDate: ad.startDate || null,
    endDate: ad.endDate || null,
  };
}

export class ApiAdRepository implements AdRepository {
  public async getAds(): Promise<Result<Campaign[]>> {
    try {
      const response = await apiClient.get<ApiAdDTO[]>(API_ENDPOINTS.admin.ads);
      return ok((Array.isArray(response) ? response : []).map(mapCampaign));
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async createAd(
    name: string,
    budget: number,
    placement?: string,
    details?: AdCreativeDetails
  ): Promise<Result<Campaign>> {
    try {
      const response = await apiClient.post<ApiAdDTO>(API_ENDPOINTS.admin.ads, {
        name,
        budget,
        placement: placement || 'Home Banner',
        ...details,
      });
      return ok({
        ...mapCampaign(response),
        placement: placement || response.placement || 'Home Banner',
        imageUrl: response.imageUrl || details?.imageUrl,
        description: response.description || details?.description,
        ctaText: response.ctaText || details?.ctaText,
        targetUrl: response.targetUrl || details?.targetUrl,
        startDate: response.startDate || details?.startDate || null,
        endDate: response.endDate || details?.endDate || null,
      });
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async updateAd(
    id: string,
    data: { name?: string; budget?: number; placement?: string; status?: UiStatus } & AdCreativeDetails
  ): Promise<Result<Campaign>> {
    try {
      const payload: Record<string, unknown> = { ...data };
      if (data.status) {
        payload.status = toApiStatus(data.status);
      }
      const response = await apiClient.put<ApiAdDTO>(`/admin/ads/${id}`, payload);
      return ok({
        ...mapCampaign(response),
        placement: response.placement || data.placement || 'Home Banner',
        imageUrl: response.imageUrl || data.imageUrl,
        description: response.description || data.description,
        ctaText: response.ctaText || data.ctaText,
        startDate: response.startDate || data.startDate || null,
        endDate: response.endDate || data.endDate || null,
      });
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async updateAdStatus(id: string, status: UiStatus): Promise<Result<Campaign>> {
    try {
      const response = await apiClient.put<ApiAdDTO>(API_ENDPOINTS.admin.updateAdStatus(id), {
        status: toApiStatus(status),
      });
      return ok(mapCampaign(response));
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async deleteAd(id: string): Promise<Result<boolean>> {
    try {
      await apiClient.delete(`/admin/ads/${id}`);
      return ok(true);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  /** @deprecated Removed in T-F051: use OfferRepository instead. */
  public async getPromotions(): Promise<Result<PromotionOffer[]>> {
    try {
      const response = await apiClient.get<Record<string, unknown>[]>('/admin/promotions');
      const str = (v: unknown): string | undefined => (typeof v === 'string' ? v : undefined);
      const mapped: PromotionOffer[] = (response || []).map((item) => ({
        id: str(item.id) || '',
        title: str(item.title) || str(item.titleEn) || '',
        subtitle: str(item.subtitle) || str(item.subtitleEn) || '',
        buttonText: str(item.buttonText) || 'Claim Offer',
        imageUrl: str(item.imageUrl) || '',
        bannerType: item.bannerType === 'EMERGENCY_SOS' ? 'EMERGENCY_SOS' : 'PROMO',
        placement: item.placement === 'FEATURED' ? 'FEATURED' : 'TOP',
        isActive: item.isActive !== false,
        createdAt: str(item.createdAt) || '',
      }));
      return ok(mapped);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  /** @deprecated Removed in T-F051: use OfferRepository instead. */
  public async createPromotion(data: { title: string; subtitle: string; imageUrl: string; bannerType?: string; placement?: string }): Promise<Result<PromotionOffer>> {
    try {
      const item = await apiClient.post<Record<string, unknown>>('/admin/promotions', data);
      const str = (v: unknown, fallback: string): string => (typeof v === 'string' && v ? v : fallback);
      return ok({
        id: str(item.id, ''),
        title: str(item.title, data.title),
        subtitle: str(item.subtitle, data.subtitle),
        buttonText: str(item.buttonText, 'Claim Offer'),
        imageUrl: str(item.imageUrl, data.imageUrl),
        bannerType: item.bannerType === 'EMERGENCY_SOS' ? 'EMERGENCY_SOS' : 'PROMO',
        placement: item.placement === 'FEATURED' ? 'FEATURED' : 'TOP',
        isActive: item.isActive !== false,
        createdAt: str(item.createdAt, ''),
      });
    } catch (error) {
      return fail(error as AppError);
    }
  }

  /** @deprecated Removed in T-F051: use OfferRepository instead. */
  public async togglePromotionStatus(id: string): Promise<Result<PromotionOffer>> {
    try {
      const item = await apiClient.put<Record<string, unknown>>(`/admin/promotions/${id}/toggle`, {});
      const str = (v: unknown, fallback: string): string => (typeof v === 'string' && v ? v : fallback);
      return ok({
        id: str(item.id, id),
        title: str(item.title, ''),
        subtitle: str(item.subtitle, ''),
        buttonText: str(item.buttonText, 'Claim Offer'),
        imageUrl: str(item.imageUrl, ''),
        bannerType: item.bannerType === 'EMERGENCY_SOS' ? 'EMERGENCY_SOS' : 'PROMO',
        placement: item.placement === 'FEATURED' ? 'FEATURED' : 'TOP',
        isActive: item.isActive !== false,
        createdAt: str(item.createdAt, ''),
      });
    } catch (error) {
      return fail(error as AppError);
    }
  }

  /** @deprecated Removed in T-F051: use OfferRepository instead. */
  public async deletePromotion(id: string): Promise<Result<boolean>> {
    try {
      await apiClient.delete(`/admin/promotions/${id}`);
      return ok(true);
    } catch (error) {
      return fail(error as AppError);
    }
  }
}
export default ApiAdRepository;
