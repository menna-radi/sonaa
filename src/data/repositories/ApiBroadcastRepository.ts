import { BroadcastRepository, CampaignRecord } from '../../domain/repositories/BroadcastRepository';
import { Result, ok, fail } from '../../core/result/Result';
import { apiClient } from '../../core/network/apiClient';
import { API_ENDPOINTS } from '../../core/config/apiEndpoints';
import { AppError } from '../../core/errors/AppError';

interface ApiBroadcastDTO {
  id: string;
  title: string;
  body: string;
  targetAudience: 'ALL' | 'CUSTOMER' | 'CRAFTSMAN';
  scheduleTime?: string;
  status: string;
  createdAt: string;
}

export class ApiBroadcastRepository implements BroadcastRepository {
  public async getBroadcasts(): Promise<Result<CampaignRecord[]>> {
    try {
      const response = await apiClient.get<ApiBroadcastDTO[]>(API_ENDPOINTS.admin.broadcasts);
      
      const mapped: CampaignRecord[] = response.map((b, index) => {
        let status: CampaignRecord['status'] = 'Sent';
        if (b.status === 'scheduled' || b.scheduleTime) {
          status = 'Scheduled';
        } else if (b.status === 'draft') {
          status = 'Draft';
        } else if (b.status === 'failed') {
          status = 'Failed';
        }

        return {
          id: parseInt(b.id) || (index + 1),
          title: b.title,
          audience: b.targetAudience,
          status,
          sendDate: b.scheduleTime 
            ? new Date(b.scheduleTime).toLocaleString() 
            : new Date(b.createdAt).toLocaleString(),
          recipients: '—', // Missing field in backend API response
          openRate: '—', // Missing field in backend API response
        };
      });

      return ok(mapped);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async sendBroadcast(
    title: string,
    body: string,
    targetAudience: 'ALL' | 'CUSTOMER' | 'CRAFTSMAN',
    scheduleTime?: string
  ): Promise<Result<CampaignRecord>> {
    try {
      const response = await apiClient.post<ApiBroadcastDTO>(API_ENDPOINTS.admin.sendBroadcast, {
        title,
        body,
        targetAudience,
        scheduleTime,
      });

      let status: CampaignRecord['status'] = 'Sent';
      if (response.status === 'scheduled' || response.scheduleTime) {
        status = 'Scheduled';
      }

      const record: CampaignRecord = {
        id: parseInt(response.id) || Date.now(),
        title: response.title,
        audience: response.targetAudience,
        status,
        sendDate: response.scheduleTime 
          ? new Date(response.scheduleTime).toLocaleString() 
          : new Date(response.createdAt).toLocaleString(),
        recipients: '—',
        openRate: '—',
      };

      return ok(record);
    } catch (error) {
      return fail(error as AppError);
    }
  }
}
export default ApiBroadcastRepository;
