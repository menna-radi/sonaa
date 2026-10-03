import { PaymentRepository } from '../../domain/repositories/PaymentRepository';
import {
  PaymentSummary,
  SubscriptionPlan,
  FailedTransaction,
  WithdrawalRequest,
  WithdrawalQuery,
  LegacyWithdrawalRequest,
} from '../../domain/entities/Payment';
import { Result, ok, fail } from '../../core/result/Result';
import { apiClient } from '../../core/network/apiClient';
import { API_ENDPOINTS } from '../../core/config/apiEndpoints';
import { toPage, type Page } from '../mappers/pageMapper';
import { AppError } from '../../core/errors/AppError';

interface RawSummary {
  gmvMtd?: number;
  gmvChangePct?: number | null;
  netRevenue?: number;
  revenueChangePct?: number | null;
  takeRate?: number;
  takeRateChangePct?: number | null;
  pendingPayouts?: number;
  pendingCraftsmenCount?: number;
  mrr?: number;
}

interface RawWithdrawal {
  id: string;
  amount?: number | string;
  status?: string;
  createdAt?: string;
  referenceId?: string | null;
  balance?: {
    craftsmanProfile?: { id?: string; firstName?: string; lastName?: string } | null;
  } | null;
  payoutAccount?: { bankName?: string | null; type?: string | null; mobileNumber?: string | null } | null;
}

const num = (v: unknown): number => {
  const n = typeof v === 'string' || typeof v === 'number' ? Number(v) : NaN;
  return Number.isFinite(n) ? n : 0;
};

const WITHDRAWAL_STATUS: Record<string, WithdrawalRequest['status']> = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
};

function mapWithdrawal(item: RawWithdrawal): WithdrawalRequest {
  const profile = item.balance?.craftsmanProfile;
  const name = `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`.trim() || 'Craftsman';
  const account = item.payoutAccount;
  const accType = account?.type || '';
  const method =
    accType.toUpperCase().includes('WALLET') && account?.mobileNumber
      ? account.mobileNumber
      : account?.bankName || accType || '';
  return {
    id: item.id,
    craftsmanName: name,
    craftsmanProfileId: profile?.id,
    method,
    amount: num(item.amount),
    status: WITHDRAWAL_STATUS[(item.status || '').toUpperCase()] ?? 'PENDING',
    createdAt: item.createdAt || '',
    referenceId: item.referenceId ?? undefined,
  };
}

export class ApiPaymentRepository implements PaymentRepository {
  public async getPaymentSummary(): Promise<Result<PaymentSummary>> {
    try {
      const response = await apiClient.get<RawSummary>(API_ENDPOINTS.payments.summary);
      return ok({
        gmvMtd: response.gmvMtd ?? 0,
        gmvChangePct: response.gmvChangePct ?? null,
        netRevenue: response.netRevenue ?? 0,
        revenueChangePct: response.revenueChangePct ?? null,
        takeRate: response.takeRate ?? 0,
        takeRateChangePct: response.takeRateChangePct ?? null,
        pendingPayouts: response.pendingPayouts ?? 0,
        pendingCraftsmenCount: response.pendingCraftsmenCount ?? 0,
        mrr: response.mrr ?? 0,
      });
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async getWithdrawals(q: WithdrawalQuery): Promise<Result<Page<WithdrawalRequest>>> {
    try {
      const response = await apiClient.get<{ items?: RawWithdrawal[]; total?: number }>(
        API_ENDPOINTS.payments.withdrawalRequests,
        { status: q.status, page: q.page, limit: q.limit }
      );
      return ok(
        toPage<RawWithdrawal, WithdrawalRequest>(response, q.page, q.limit, mapWithdrawal, (w) =>
          q.status === 'ALL' ? true : w.status === q.status
        )
      );
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async approveWithdrawal(id: string): Promise<Result<boolean>> {
    try {
      await apiClient.put(API_ENDPOINTS.payments.updateWithdrawalStatus(id), { status: 'approved' });
      return ok(true);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async rejectWithdrawal(id: string): Promise<Result<boolean>> {
    try {
      await apiClient.put(API_ENDPOINTS.payments.updateWithdrawalStatus(id), { status: 'rejected' });
      return ok(true);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async retryWithdrawal(id: string): Promise<Result<boolean>> {
    try {
      await apiClient.post(API_ENDPOINTS.payments.retryTransaction(id));
      return ok(true);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  /** @deprecated Removed in T-F040. */
  public async getSubscriptionPlans(): Promise<Result<SubscriptionPlan[]>> {
    try {
      const response = await apiClient.get<Record<string, unknown>[]>(API_ENDPOINTS.payments.plans);
      const get = (p: Record<string, unknown>, key: string): string =>
        typeof p[key] === 'string' ? (p[key] as string) : '';
      const plans: SubscriptionPlan[] = (response || []).map((p, idx) => ({
        id: typeof p.id === 'string' ? p.id : `p-${idx}`,
        name: get(p, 'nameEn') || get(p, 'nameAr') || get(p, 'key') || 'Pass Plan',
        price: num(p.price),
        subscribersCount: num(p.subscribersCount),
      }));
      return ok(plans);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  /** @deprecated Removed in T-F040. */
  public async createSubscriptionPlan(data: Record<string, unknown>): Promise<Result<SubscriptionPlan>> {
    try {
      const str = (v: unknown, fallback: string): string => (typeof v === 'string' && v ? v : fallback);
      const response = await apiClient.post<Record<string, unknown>>(API_ENDPOINTS.admin.plans, {
        nameEn: str(data.nameEn ?? data.name, 'Plan'),
        nameAr: str(data.nameAr ?? data.name, 'اشتراك'),
        durationMonths: num(data.durationMonths) || 1,
        price: num(data.price),
      });
      return ok({
        id: typeof response.id === 'string' ? response.id : `p-${Date.now()}`,
        name: str(response.nameEn, 'Plan'),
        price: num(response.price),
        subscribersCount: 0,
      });
    } catch (error) {
      return fail(error as AppError);
    }
  }

  /** @deprecated Removed in T-F040. */
  public async updateSubscriptionPlan(
    id: string,
    data: Record<string, unknown>
  ): Promise<Result<SubscriptionPlan>> {
    try {
      const response = await apiClient.put<Record<string, unknown>>(`${API_ENDPOINTS.admin.plans}/${id}`, data);
      return ok({
        id,
        name: typeof response.nameEn === 'string' ? response.nameEn : 'Plan',
        price: num(response.price),
        subscribersCount: num(response.subscribersCount),
      });
    } catch (error) {
      return fail(error as AppError);
    }
  }

  /** @deprecated Removed in T-F040. */
  public async deleteSubscriptionPlan(id: string): Promise<Result<boolean>> {
    try {
      await apiClient.delete(`${API_ENDPOINTS.admin.plans}/${id}`);
      return ok(true);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  /** @deprecated Removed in T-F040. */
  public async getSubscriptionRequests(
    statusFilter?: string
  ): Promise<Result<import('../../domain/repositories/PaymentRepository').SubscriptionRequestItem[]>> {
    try {
      const url = statusFilter
        ? `${API_ENDPOINTS.admin.subscriptionRequests}?status=${statusFilter}`
        : API_ENDPOINTS.admin.subscriptionRequests;
      const response = await apiClient.get<import('../../domain/repositories/PaymentRepository').SubscriptionRequestItem[]>(url);
      return ok(response || []);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  /** @deprecated Removed in T-F040. */
  public async approveSubscriptionRequest(requestId: string): Promise<Result<boolean>> {
    try {
      await apiClient.post(API_ENDPOINTS.admin.approveSubscriptionRequest(requestId));
      return ok(true);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  /** @deprecated Removed in T-F040. */
  public async rejectSubscriptionRequest(requestId: string, reason: string): Promise<Result<boolean>> {
    try {
      await apiClient.post(API_ENDPOINTS.admin.rejectSubscriptionRequest(requestId), { reason });
      return ok(true);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  /** @deprecated Removed in T-F040. */
  public async getBitSettings(): Promise<Result<Record<string, string>>> {
    try {
      const response = await apiClient.get<Record<string, string>>(API_ENDPOINTS.admin.bitSettings);
      return ok(response || {});
    } catch (error) {
      return fail(error as AppError);
    }
  }

  /** @deprecated Removed in T-F040. */
  public async updateBitSettings(settings: Record<string, string>): Promise<Result<Record<string, string>>> {
    try {
      const response = await apiClient.put<Record<string, string>>(API_ENDPOINTS.admin.bitSettings, settings);
      return ok(response || {});
    } catch (error) {
      return fail(error as AppError);
    }
  }

  /** @deprecated Removed in T-F040. */
  public async getSubscribers(): Promise<Result<import('../../domain/repositories/PaymentRepository').Subscriber[]>> {
    try {
      const response = await apiClient.get<import('../../domain/repositories/PaymentRepository').Subscriber[]>(
        '/admin/subscriptions/subscribers'
      );
      return ok(response || []);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  /** @deprecated Removed in T-F040. */
  public async cancelSubscriber(id: string): Promise<Result<boolean>> {
    try {
      await apiClient.post(`/admin/subscriptions/subscribers/${id}/cancel`);
      return ok(true);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  /** @deprecated Removed in T-F040. */
  public async extendSubscriber(id: string, days = 30): Promise<Result<boolean>> {
    try {
      await apiClient.post(`/admin/subscriptions/subscribers/${id}/extend`, { days });
      return ok(true);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  /** @deprecated Removed in T-F040. */
  public async getFailedTransactions(): Promise<Result<FailedTransaction[]>> {
    try {
      const response = await apiClient.get<{ items?: RawWithdrawal[] }>(API_ENDPOINTS.payments.failedTransactions);
      const items = response.items || [];
      const failed: FailedTransaction[] = items
        .filter((item) => (item.status || '').toUpperCase() === 'FAILED')
        .map((item) => {
          const profile = item.balance?.craftsmanProfile;
          const name = profile ? `${profile.firstName} ${profile.lastName}` : 'Craftsman';
          return {
            id: item.id,
            name,
            txId: item.referenceId || `#TX-${item.id.substring(0, 4)}`,
            bank: item.payoutAccount?.bankName || item.payoutAccount?.type || 'Bank Payout',
            timeAgo: item.createdAt || 'Recent',
            amount: num(item.amount),
            reasonKey: 'reason_bank_declined',
            retries: 0,
          };
        });
      return ok(failed);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  /** @deprecated Removed in T-F040. */
  public async retryTransaction(id: string): Promise<Result<boolean>> {
    try {
      await apiClient.post(API_ENDPOINTS.payments.retryTransaction(id));
      return ok(true);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  /** @deprecated Removed in T-F040. */
  public async getWithdrawalRequests(): Promise<Result<LegacyWithdrawalRequest[]>> {
    try {
      const response = await apiClient.get<{ items?: RawWithdrawal[] } | RawWithdrawal[]>(
        API_ENDPOINTS.payments.withdrawalRequests
      );
      const items = Array.isArray(response) ? response : response.items || [];
      return ok(
        items.map((item) => {
          const profile = item.balance?.craftsmanProfile;
          const name = profile ? `${profile.firstName} ${profile.lastName}` : 'Craftsman';
          const upper = (item.status || '').toUpperCase();
          return {
            id: item.id,
            name,
            bank: item.payoutAccount?.bankName || item.payoutAccount?.type || 'Bank Payout',
            timeAgo: item.createdAt || 'Recent',
            amount: num(item.amount),
            status: upper === 'COMPLETED' ? 'approved' : upper === 'FAILED' ? 'rejected' : 'pending',
          } as LegacyWithdrawalRequest;
        })
      );
    } catch (error) {
      return fail(error as AppError);
    }
  }

  /** @deprecated Removed in T-F040. */
  public async updateWithdrawalStatus(
    id: string,
    status: 'approved' | 'rejected'
  ): Promise<Result<LegacyWithdrawalRequest>> {
    try {
      const response = await apiClient.put<RawWithdrawal>(API_ENDPOINTS.payments.updateWithdrawalStatus(id), {
        status,
      });
      const profile = response.balance?.craftsmanProfile;
      const upper = (response.status || '').toUpperCase();
      return ok({
        id: response.id || id,
        name: profile ? `${profile.firstName} ${profile.lastName}` : 'Craftsman',
        bank: response.payoutAccount?.bankName || response.payoutAccount?.type || 'Bank Payout',
        timeAgo: response.createdAt || 'Recent',
        amount: num(response.amount),
        status: upper === 'COMPLETED' || upper === 'APPROVED' ? 'approved' : upper === 'FAILED' || upper === 'REJECTED' ? 'rejected' : status,
      });
    } catch (error) {
      return fail(error as AppError);
    }
  }
}
export default ApiPaymentRepository;
