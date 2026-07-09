import { Result } from '../../core/result/Result';

export interface CampaignRecord {
  id: number;
  title: string;
  audience: string;
  status: 'Sent' | 'Scheduled' | 'Draft' | 'Failed';
  sendDate: string;
  recipients: string;
  openRate: string;
}

export interface BroadcastRepository {
  getBroadcasts(): Promise<Result<CampaignRecord[]>>;
  sendBroadcast(
    title: string,
    body: string,
    targetAudience: 'ALL' | 'CUSTOMER' | 'CRAFTSMAN',
    scheduleTime?: string
  ): Promise<Result<CampaignRecord>>;
}
