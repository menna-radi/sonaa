import { AdRepository, Campaign } from '../../domain/repositories/AdRepository';
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
}
export default MockAdRepository;
