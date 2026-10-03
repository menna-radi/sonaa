import { Result } from '../../core/result/Result';

export type Audience = 'ALL' | 'CUSTOMERS' | 'CRAFTSMEN';
export type BroadcastStatus = 'SENT' | 'SCHEDULED' | 'CANCELLED';

export interface CampaignRecord {
  id: string;
  title: string;
  body: string;
  audience: Audience;
  targetCity?: string;
  imageUrl?: string;
  deepLink?: string;
  status: BroadcastStatus;
  /** ISO `sentAt` (or `scheduledAt` while still scheduled). */
  at: string;
  recipients: number;
}

export interface BroadcastInput {
  title: string;
  body: string;
  audience: Audience;
  targetCity?: string;
  imageUrl?: string;
  deepLink?: string;
  /** ISO timestamp; omitted = send immediately. */
  scheduledAt?: string;
}

export interface BroadcastRepository {
  getBroadcasts(): Promise<Result<CampaignRecord[]>>;
  sendBroadcast(input: BroadcastInput): Promise<Result<CampaignRecord>>;
  deleteBroadcast(id: string): Promise<Result<boolean>>;
}
