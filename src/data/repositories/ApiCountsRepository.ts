import { CountsRepository, AdminCounts } from '../../domain/repositories/CountsRepository';
import { Result, ok, fail } from '../../core/result/Result';
import { apiClient } from '../../core/network/apiClient';
import { API_ENDPOINTS } from '../../core/config/apiEndpoints';
import { AppError, NotFoundError } from '../../core/errors/AppError';

interface RawCountsResponse {
  verification?: number;
  reports?: number;
  disputes?: number;
  billing?: number;
  payments?: number;
  notifications?: number;
  counts?: {
    verification?: number;
    reports?: number;
    disputes?: number;
    billing?: number;
    payments?: number;
    notifications?: number;
  };
}

export class ApiCountsRepository implements CountsRepository {
  public async getCounts(): Promise<Result<AdminCounts | null>> {
    try {
      const res = await apiClient.get<RawCountsResponse | { data: RawCountsResponse }>(API_ENDPOINTS.admin.counts);
      const data = (res as { data?: RawCountsResponse }).data || (res as RawCountsResponse);
      const c = data?.counts || data;
      if (!c) return ok(null);

      return ok({
        verification: Number(c.verification || 0),
        reports: Number(c.reports || 0),
        disputes: Number(c.disputes || 0),
        billing: Number(c.billing || 0),
        payments: Number(c.payments || 0),
        notifications: Number(c.notifications || 0),
      });
    } catch (err: unknown) {
      if (err instanceof NotFoundError || (err as { status?: number })?.status === 404) {
        return ok(null);
      }
      return fail(err as AppError);
    }
  }
}

export default ApiCountsRepository;
