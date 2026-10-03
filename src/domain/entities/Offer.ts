export type OfferState = 'ACTIVE' | 'PAUSED' | 'SCHEDULED' | 'ENDED';

export interface Offer {
  id: string;
  titleEn: string;
  titleAr: string;
  subtitleEn: string;
  subtitleAr: string;
  buttonTextEn: string;
  buttonTextAr: string;
  imageUrl: string;
  bannerType: 'PROMO' | 'EMERGENCY_SOS';
  placement: 'TOP' | 'FEATURED';
  targetType: 'NONE' | 'URL' | 'CRAFTSMAN' | 'CATEGORY' | 'TASK' | 'SERVICE';
  targetId?: string;
  targetUrl?: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

export type OfferInput = Omit<Offer, 'id' | 'createdAt' | 'isActive'>;
