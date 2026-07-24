import { AdRepository, Campaign, PromotionOffer } from '../../domain/repositories/AdRepository';
import { Result, ok } from '../../core/result/Result';

export class MockAdRepository implements AdRepository {
  private campaigns: Campaign[] = [
    { id: '1', name: 'Summer AC Repair Promo', placement: 'Home Banner', status: 'Active', impressions: 124000, ctr: 4.2, conversions: 842, budget: 5000 },
    { id: '2', name: 'Plumbing Emergency Boost', placement: 'Search Results', status: 'Active', impressions: 89000, ctr: 5.1, conversions: 612, budget: 3500 },
    { id: '3', name: 'New Craftsman Onboarding', placement: 'Popups', status: 'Paused', impressions: 45000, ctr: 2.8, conversions: 124, budget: 2000 },
    { id: '4', name: 'Riyadh Deep Cleaning', placement: 'Category Page', status: 'Active', impressions: 210000, ctr: 3.9, conversions: 1204, budget: 8000 },
    { id: '5', name: 'Jeddah Movers Special', placement: 'Home Banner', status: 'Active', impressions: 65000, ctr: 3.1, conversions: 340, budget: 4000 },
  ];

  public async getAds(): Promise<Result<Campaign[]>> {
    return ok(this.campaigns);
  }

  public async createAd(name: string, budget: number, placement?: string): Promise<Result<Campaign>> {
    const ad: Campaign = {
      id: String(this.campaigns.length + 1),
      name,
      placement: placement || 'Home Banner',
      status: 'Active',
      impressions: 0,
      ctr: 0.0,
      conversions: 0,
      budget,
    };
    this.campaigns = [...this.campaigns, ad];
    return ok(ad);
  }

  public async updateAdStatus(id: string, status: 'Active' | 'Paused'): Promise<Result<Campaign>> {
    const updated = this.campaigns.find(c => c.id === id);
    if (updated) {
      updated.status = status;
    }
    return ok(updated!);
  }

  public async deleteAd(id: string): Promise<Result<boolean>> {
    this.campaigns = this.campaigns.filter(c => c.id !== id);
    return ok(true);
  }

  public async getPromotions(): Promise<Result<PromotionOffer[]>> {
    return ok([
      {
        id: 'P-101',
        title: '30% Off First Maintenance Order',
        subtitle: 'Valid for all new customer signups in Riyadh',
        buttonText: 'Claim Discount',
        imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
        bannerType: 'PROMO',
        placement: 'TOP',
        isActive: true,
        createdAt: '2026-07-24'
      }
    ]);
  }

  public async createPromotion(data: { title: string; subtitle: string; imageUrl: string; bannerType?: string; placement?: string }): Promise<Result<PromotionOffer>> {
    const offer: PromotionOffer = {
      id: `P-${Date.now()}`,
      title: data.title,
      subtitle: data.subtitle,
      buttonText: 'Claim Offer',
      imageUrl: data.imageUrl,
      bannerType: (data.bannerType as any) || 'PROMO',
      placement: (data.placement as any) || 'TOP',
      isActive: true,
      createdAt: new Date().toLocaleDateString()
    };
    return ok(offer);
  }

  public async togglePromotionStatus(id: string): Promise<Result<PromotionOffer>> {
    return ok({
      id,
      title: '30% Off First Order',
      subtitle: 'Updated Status',
      buttonText: 'Claim Offer',
      imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
      bannerType: 'PROMO',
      placement: 'TOP',
      isActive: true,
      createdAt: 'Today'
    });
  }

  public async deletePromotion(_id: string): Promise<Result<boolean>> {
    return ok(true);
  }
}
export default MockAdRepository;
