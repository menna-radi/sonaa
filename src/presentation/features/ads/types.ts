import { Campaign as DomainCampaign } from '../../../domain/repositories/AdRepository';

export type AdStatus = 'Active' | 'Paused' | 'Scheduled' | 'Expired';

export interface Campaign extends Omit<DomainCampaign, 'status'> {
  status: 'Active' | 'Paused' | 'Scheduled' | 'Expired';
}

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
