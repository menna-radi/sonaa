import { Campaign as DomainCampaign, PromotionOffer as DomainPromotionOffer } from '../../../domain/repositories/AdRepository';

export type AdStatus = 'Active' | 'Paused' | 'Scheduled' | 'Expired';

export interface Campaign extends Omit<DomainCampaign, 'status'> {
  status: 'Active' | 'Paused' | 'Scheduled' | 'Expired';
}

export type PromotionOffer = DomainPromotionOffer;

export interface CityTarget {
  name: string;
  nameAr: string;
  selected: boolean;
  reach: number;
}

export interface CategoryTarget {
  name: string;
  nameAr: string;
  selected: boolean;
}

export interface PromotionPackage {
  id: 'Basic' | 'Featured' | 'Premium';
  name: string;
  price: number;
  durationDays: number;
  reachText: string;
  visibilityBoost: string;
  features: string[];
  activeCount: number;
  mostPopular?: boolean;
}

export interface PromotionFeature {
  id: string;
  name: string;
  description: string;
  activeCount: number;
  enabled: boolean;
}
