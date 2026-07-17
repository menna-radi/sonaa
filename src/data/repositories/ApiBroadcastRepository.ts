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
      const response = await apiClient.get<any[]>(API_ENDPOINTS.admin.broadcasts);
      
      const mapped: CampaignRecord[] = response.map((b, index) => {
        let status: CampaignRecord['status'] = 'Sent';
        if (b.status === 'scheduled') {
          status = 'Scheduled';
        } else if (b.status === 'draft') {
          status = 'Draft';
        } else if (b.status === 'failed') {
          status = 'Failed';
        }

        const audienceMap: Record<string, 'ALL' | 'CUSTOMER' | 'CRAFTSMAN'> = {
          'ALL': 'ALL',
          'CUSTOMERS': 'CUSTOMER',
          'CRAFTSMEN': 'CRAFTSMAN',
        };

        return {
          id: index + 1,
          title: b.title,
          audience: audienceMap[b.audience] || 'ALL',
          status,
          sendDate: b.sentAt ? new Date(b.sentAt).toLocaleString() : '—',
          recipients: b.reach !== undefined ? String(b.reach) : '—',
          openRate: '—',
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
      const audienceMap: Record<string, string> = {
        'ALL': 'ALL',
        'CUSTOMER': 'CUSTOMERS',
        'CRAFTSMAN': 'CRAFTSMEN',
      };

      const response = await apiClient.post<any>(API_ENDPOINTS.admin.sendBroadcast, {
        title,
        body,
        audience: audienceMap[targetAudience] || 'ALL',
        scheduleTime,
      });

      const record: CampaignRecord = {
        id: Date.now(),
        title: response.title,
        audience: targetAudience,
        status: 'Sent',
        sendDate: response.sentAt ? new Date(response.sentAt).toLocaleString() : new Date().toLocaleString(),
        recipients: response.reach !== undefined ? String(response.reach) : '—',
        openRate: '—',
      };

      return ok(record);
    } catch (error) {
      return fail(error as AppError);
    }
  }
}
export default ApiBroadcastRepository;
