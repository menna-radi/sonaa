import { AdRepository, Campaign, PromotionOffer } from '../../domain/repositories/AdRepository';
import { Result, ok, fail } from '../../core/result/Result';
import { apiClient } from '../../core/network/apiClient';
import { API_ENDPOINTS } from '../../core/config/apiEndpoints';
import { AppError } from '../../core/errors/AppError';

interface ApiAdDTO {
  id: string;
  name: string;
  budget: number;
  status: 'ACTIVE' | 'PAUSED';
  placement?: string;
  impressions?: number;
  ctr?: number;
  conversions?: number;
}

export class ApiAdRepository implements AdRepository {
  public async getAds(): Promise<Result<Campaign[]>> {
    try {
      const response = await apiClient.get<ApiAdDTO[]>(API_ENDPOINTS.admin.ads);
      
      const mapped: Campaign[] = response.map((ad) => ({
        id: ad.id,
        name: ad.name,
        placement: ad.placement || 'Home Banner', // Fallback for missing placement field
        status: ad.status === 'ACTIVE' ? 'Active' : 'Paused',
        impressions: ad.impressions || 0, // Fallback for missing analytics fields
        ctr: ad.ctr || 0.0,
        conversions: ad.conversions || 0,
        budget: ad.budget,
      }));

      return ok(mapped);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async createAd(name: string, budget: number, placement?: string): Promise<Result<Campaign>> {
    try {
      const response = await apiClient.post<ApiAdDTO>(API_ENDPOINTS.admin.ads, {
        name,
        budget,
      });

      const campaign: Campaign = {
        id: response.id,
        name: response.name,
        placement: placement || response.placement || 'Home Banner',
        status: response.status === 'ACTIVE' ? 'Active' : 'Paused',
        impressions: response.impressions || 0,
        ctr: response.ctr || 0.0,
        conversions: response.conversions || 0,
        budget: response.budget,
      };

      return ok(campaign);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async updateAdStatus(id: string, status: 'Active' | 'Paused'): Promise<Result<Campaign>> {
    try {
      const apiStatus = status === 'Active' ? 'ACTIVE' : 'PAUSED';
      const response = await apiClient.put<ApiAdDTO>(API_ENDPOINTS.admin.updateAdStatus(id), {
        status: apiStatus,
      });

      const campaign: Campaign = {
        id: response.id,
        name: response.name,
        placement: response.placement || 'Home Banner',
        status: response.status === 'ACTIVE' ? 'Active' : 'Paused',
        impressions: response.impressions || 0,
        ctr: response.ctr || 0.0,
        conversions: response.conversions || 0,
        budget: response.budget,
      };

      return ok(campaign);
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

  public async getPromotions(): Promise<Result<PromotionOffer[]>> {
    try {
      const response = await apiClient.get<any[]>('/admin/promotions');
      const mapped: PromotionOffer[] = (response || []).map((item) => ({
        id: item.id,
        title: item.title || item.titleEn || 'Special Offer',
        subtitle: item.subtitle || item.subtitleEn || 'Exclusive discount on Sonaa',
        buttonText: item.buttonText || 'Claim Offer',
        imageUrl: item.imageUrl,
        bannerType: item.bannerType === 'EMERGENCY_SOS' ? 'EMERGENCY_SOS' : 'PROMO',
        placement: item.placement === 'FEATURED' ? 'FEATURED' : 'TOP',
        isActive: item.isActive !== false,
        createdAt: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Today',
      }));
      return ok(mapped);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async createPromotion(data: { title: string; subtitle: string; imageUrl: string; bannerType?: string; placement?: string }): Promise<Result<PromotionOffer>> {
    try {
      const item = await apiClient.post<any>('/admin/promotions', data);
      const offer: PromotionOffer = {
        id: item.id,
        title: item.title || data.title,
        subtitle: item.subtitle || data.subtitle,
        buttonText: item.buttonText || 'Claim Offer',
        imageUrl: item.imageUrl || data.imageUrl,
        bannerType: item.bannerType === 'EMERGENCY_SOS' ? 'EMERGENCY_SOS' : 'PROMO',
        placement: item.placement === 'FEATURED' ? 'FEATURED' : 'TOP',
        isActive: item.isActive !== false,
        createdAt: new Date().toLocaleDateString(),
      };
      return ok(offer);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async togglePromotionStatus(id: string): Promise<Result<PromotionOffer>> {
    try {
      const item = await apiClient.put<any>(`/admin/promotions/${id}/toggle`, {});
      const offer: PromotionOffer = {
        id: item.id,
        title: item.title,
        subtitle: item.subtitle,
        buttonText: item.buttonText || 'Claim Offer',
        imageUrl: item.imageUrl,
        bannerType: item.bannerType === 'EMERGENCY_SOS' ? 'EMERGENCY_SOS' : 'PROMO',
        placement: item.placement === 'FEATURED' ? 'FEATURED' : 'TOP',
        isActive: item.isActive,
        createdAt: new Date(item.createdAt).toLocaleDateString(),
      };
      return ok(offer);
    } catch (error) {
      return fail(error as AppError);
    }
  }

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
