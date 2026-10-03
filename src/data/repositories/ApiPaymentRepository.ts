import { PaymentRepository } from '../../domain/repositories/PaymentRepository';
import { PaymentSummary, WithdrawalRequest, WithdrawalQuery } from '../../domain/entities/Payment';
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
}
export default ApiPaymentRepository;
