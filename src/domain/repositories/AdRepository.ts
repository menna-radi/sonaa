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
}

export interface AdRepository {
  getAds(): Promise<Result<Campaign[]>>;
  createAd(name: string, budget: number, placement?: string): Promise<Result<Campaign>>;
  updateAdStatus(id: string, status: 'Active' | 'Paused'): Promise<Result<Campaign>>;
}
