import {
  Audience,
  BroadcastInput,
  BroadcastRepository,
  BroadcastStatus,
  CampaignRecord,
} from '../../domain/repositories/BroadcastRepository';
import { Result, ok, fail } from '../../core/result/Result';
import { apiClient } from '../../core/network/apiClient';
import { API_ENDPOINTS } from '../../core/config/apiEndpoints';
import { AppError } from '../../core/errors/AppError';

interface ApiBroadcastDTO {
  id: string | number;
  title: string;
  body?: string | null;
  audience?: string | null;
  targetCity?: string | null;
  imageUrl?: string | null;
  deepLink?: string | null;
  status?: string | null;
  sentAt?: string | null;
  scheduledAt?: string | null;
  createdAt?: string | null;
  reach?: number | null;
}

const AUDIENCES: Audience[] = ['ALL', 'CUSTOMERS', 'CRAFTSMEN'];
const STATUSES: BroadcastStatus[] = ['SENT', 'SCHEDULED', 'CANCELLED'];

const toRecord = (b: ApiBroadcastDTO): CampaignRecord => {
  const status = (b.status || '').toUpperCase();
  const audience = (b.audience || '').toUpperCase();
  return {
    id: String(b.id),
    title: b.title,
    body: b.body || '',
    audience: (AUDIENCES as string[]).includes(audience) ? (audience as Audience) : 'ALL',
    targetCity: b.targetCity || undefined,
    imageUrl: b.imageUrl || undefined,
    deepLink: b.deepLink || undefined,
    status: (STATUSES as string[]).includes(status) ? (status as BroadcastStatus) : 'SENT',
    at: b.sentAt || b.scheduledAt || b.createdAt || '',
    recipients: b.reach ?? 0,
  };
};

export class ApiBroadcastRepository implements BroadcastRepository {
  public async getBroadcasts(): Promise<Result<CampaignRecord[]>> {
    try {
      const response = await apiClient.get<ApiBroadcastDTO[]>(API_ENDPOINTS.admin.broadcasts);
      return ok(response.map(toRecord));
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async sendBroadcast(input: BroadcastInput): Promise<Result<CampaignRecord>> {
    try {
      const response = await apiClient.post<ApiBroadcastDTO>(API_ENDPOINTS.admin.sendBroadcast, input);
      return ok(toRecord(response));
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async deleteBroadcast(id: string): Promise<Result<boolean>> {
    try {
      await apiClient.delete<unknown>(API_ENDPOINTS.admin.deleteBroadcast(id));
      return ok(true);
    } catch (error) {
      return fail(error as AppError);
    }
  }
}
export default ApiBroadcastRepository;
