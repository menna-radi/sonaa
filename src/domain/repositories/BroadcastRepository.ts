import { Result } from '../../core/result/Result';

export interface CampaignRecord {
  id: string | number;
  title: string;
  body?: string;
  audience: string;
  targetCity?: string;
  imageUrl?: string;
  deepLink?: string;
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
    options?: {
      targetCity?: string;
      imageUrl?: string;
      deepLink?: string;
      scheduleTime?: string;
    }
  ): Promise<Result<CampaignRecord>>;
  deleteBroadcast?(id: string | number): Promise<Result<boolean>>;
}
