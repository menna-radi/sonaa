import { BroadcastInput, BroadcastRepository, CampaignRecord } from '../../domain/repositories/BroadcastRepository';
import { Result, ok } from '../../core/result/Result';

export class MockBroadcastRepository implements BroadcastRepository {
  private campaigns: CampaignRecord[] = [
    { id: '1', title: 'May surge alert · Plumbing', body: 'Plumbing demand is up this week.', audience: 'CRAFTSMEN', targetCity: 'Jerusalem', status: 'SENT', at: '2026-05-28T09:00:00.000Z', recipients: 1842 },
    { id: '2', title: 'Welcome offer · 20% off first task', body: 'Get 20% off your first task.', audience: 'CUSTOMERS', status: 'SENT', at: '2026-05-26T10:15:00.000Z', recipients: 8421 },
    { id: '3', title: 'Weekly digest', body: 'Your weekly summary is ready.', audience: 'ALL', status: 'SCHEDULED', at: '2099-01-01T09:00:00.000Z', recipients: 0 },
  ];

  public async getBroadcasts(): Promise<Result<CampaignRecord[]>> {
    return ok(this.campaigns);
  }

  public async sendBroadcast(input: BroadcastInput): Promise<Result<CampaignRecord>> {
    const record: CampaignRecord = {
      id: String(Date.now()),
      title: input.title,
      body: input.body,
      audience: input.audience,
      targetCity: input.targetCity,
      imageUrl: input.imageUrl,
      deepLink: input.deepLink,
      status: input.scheduledAt ? 'SCHEDULED' : 'SENT',
      at: input.scheduledAt ?? new Date().toISOString(),
      recipients: 0,
    };
    this.campaigns = [record, ...this.campaigns];
    return ok(record);
  }

  public async deleteBroadcast(id: string): Promise<Result<boolean>> {
    this.campaigns = this.campaigns.filter((c) => c.id !== id);
    return ok(true);
  }
}
export default MockBroadcastRepository;
