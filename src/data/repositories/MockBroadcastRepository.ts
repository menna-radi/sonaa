import { BroadcastRepository, CampaignRecord } from '../../domain/repositories/BroadcastRepository';
import { Result, ok } from '../../core/result/Result';

export class MockBroadcastRepository implements BroadcastRepository {
  private campaigns: CampaignRecord[] = [
    { id: 1, title: 'May surge alert · Plumbing', audience: 'Craftsmen · Riyadh', status: 'Sent', sendDate: 'May 28, 9:00 AM', recipients: '1,842', openRate: '68%' },
    { id: 2, title: 'Pro+ upgrade · 30% off this week', audience: 'Pro Craftsmen', status: 'Sent', sendDate: 'May 26, 10:15 AM', recipients: '2,104', openRate: '54%' },
    { id: 3, title: 'Welcome offer · 20% off first task', audience: 'New customers', status: 'Scheduled', sendDate: 'Jun 4, 9:00 AM', recipients: '8,421', openRate: '—' },
    { id: 4, title: 'Weekly digest · Top earners', audience: 'All craftsmen', status: 'Scheduled', sendDate: 'Every Mon · Recurring', recipients: '6,847', openRate: '—' },
    { id: 5, title: 'Eid Al-Adha greeting', audience: 'All users', status: 'Draft', sendDate: '—', recipients: '15,280', openRate: '—' },
  ];

  public async getBroadcasts(): Promise<Result<CampaignRecord[]>> {
    return ok(this.campaigns);
  }

  public async sendBroadcast(
    title: string,
    _body: string,
    targetAudience: 'ALL' | 'CUSTOMER' | 'CRAFTSMAN',
    scheduleTime?: string
  ): Promise<Result<CampaignRecord>> {
    const record: CampaignRecord = {
      id: Date.now(),
      title,
      audience: targetAudience,
      status: scheduleTime ? 'Scheduled' : 'Sent',
      sendDate: scheduleTime ? new Date(scheduleTime).toLocaleString() : 'Just now',
      recipients: '—',
      openRate: '—',
    };
    this.campaigns = [record, ...this.campaigns];
    return ok(record);
  }
}
export default MockBroadcastRepository;
