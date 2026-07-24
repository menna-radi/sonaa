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
      
      const mapped: CampaignRecord[] = response.map((b) => {
        let status: CampaignRecord['status'] = 'Sent';
        if (b.status === 'SCHEDULED' || b.status === 'scheduled') {
          status = 'Scheduled';
        } else if (b.status === 'DRAFT' || b.status === 'draft') {
          status = 'Draft';
        } else if (b.status === 'FAILED' || b.status === 'failed') {
          status = 'Failed';
        }

        const audienceMap: Record<string, string> = {
          'ALL': 'ALL',
          'CUSTOMERS': 'CUSTOMER',
          'CRAFTSMEN': 'CRAFTSMAN',
        };

        return {
          id: b.id,
          title: b.title,
          body: b.body,
          audience: audienceMap[b.audience] || b.audience || 'ALL',
          targetCity: b.targetCity || undefined,
          imageUrl: b.imageUrl || undefined,
          deepLink: b.deepLink || undefined,
          status,
          sendDate: b.sentAt ? new Date(b.sentAt).toLocaleString() : (b.scheduledAt ? new Date(b.scheduledAt).toLocaleString() : '—'),
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
    options?: {
      targetCity?: string;
      imageUrl?: string;
      deepLink?: string;
      scheduleTime?: string;
    }
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
        targetCity: options?.targetCity,
        imageUrl: options?.imageUrl,
        deepLink: options?.deepLink,
        scheduledAt: options?.scheduleTime,
      });

      const record: CampaignRecord = {
        id: response.id || String(Date.now()),
        title: response.title,
        body: response.body,
        audience: targetAudience,
        targetCity: response.targetCity,
        imageUrl: response.imageUrl,
        deepLink: response.deepLink,
        status: response.status === 'SCHEDULED' ? 'Scheduled' : 'Sent',
        sendDate: response.sentAt ? new Date(response.sentAt).toLocaleString() : new Date().toLocaleString(),
        recipients: response.reach !== undefined ? String(response.reach) : '—',
        openRate: '—',
      };

      return ok(record);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async deleteBroadcast(id: string | number): Promise<Result<boolean>> {
    try {
      await apiClient.delete<any>(`${API_ENDPOINTS.admin.broadcasts}/${id}`);
      return ok(true);
    } catch (error) {
      return fail(error as AppError);
    }
  }
}
export default ApiBroadcastRepository;
