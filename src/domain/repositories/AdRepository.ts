import { Result } from '../../core/result/Result';

export interface Campaign {
  id: string;
  name: string;
  placement: string;
  status: 'Active' | 'Paused';
  impressions: number;
  ctr: number;
  conversions: number;
  budget: number;
  imageUrl?: string;
  description?: string;
  ctaText?: string;
  targetType?: string;
  targetId?: string;
  targetUrl?: string;
  startDate?: string | null;
  endDate?: string | null;
}

export interface PromotionOffer {
  id: string;
  title: string;
  subtitle: string;
  buttonText: string;
  imageUrl: string;
  bannerType: 'PROMO' | 'EMERGENCY_SOS';
  placement: 'TOP' | 'FEATURED';
  isActive: boolean;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
}

export interface AdCreativeDetails {
  imageUrl?: string;
  description?: string;
  ctaText?: string;
  targetType?: string;
  targetId?: string;
  targetUrl?: string;
  startDate?: string | null;
  endDate?: string | null;
  durationHours?: number;
}

export interface AdRepository {
  getAds(): Promise<Result<Campaign[]>>;
  createAd(name: string, budget: number, placement?: string, details?: AdCreativeDetails): Promise<Result<Campaign>>;
  updateAd(id: string, data: { name?: string; budget?: number; placement?: string; status?: 'Active' | 'Paused' } & AdCreativeDetails): Promise<Result<Campaign>>;
  updateAdStatus(id: string, status: 'Active' | 'Paused'): Promise<Result<Campaign>>;
  deleteAd(id: string): Promise<Result<boolean>>;
  getPromotions(): Promise<Result<PromotionOffer[]>>;
  createPromotion(data: { title: string; subtitle: string; imageUrl: string; bannerType?: string; placement?: string }): Promise<Result<PromotionOffer>>;
  togglePromotionStatus(id: string): Promise<Result<PromotionOffer>>;
  deletePromotion(id: string): Promise<Result<boolean>>;
}
