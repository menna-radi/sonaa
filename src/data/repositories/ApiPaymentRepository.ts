import { PaymentRepository } from '../../domain/repositories/PaymentRepository';
import {
  PaymentSummary,
  SubscriptionPlan,
  FailedTransaction,
  WithdrawalRequest
} from '../../domain/entities/Payment';
import { Result, ok, fail } from '../../core/result/Result';
import { apiClient } from '../../core/network/apiClient';
import { API_ENDPOINTS } from '../../core/config/apiEndpoints';
import { ApiResponse } from '../../core/network/ApiResponse';
import { AppError } from '../../core/errors/AppError';

export class ApiPaymentRepository implements PaymentRepository {
  public async getPaymentSummary(): Promise<Result<PaymentSummary>> {
    try {
      const response = await apiClient.get<any>(API_ENDPOINTS.payments.summary);
      
      // Map properties with safe fallbacks
      const summary: PaymentSummary = {
        gmvMtd: response.gmvMtd || 0,
        gmvChangePct: 0,
        netRevenue: response.netRevenue || 0,
        revenueChangePct: 0,
        takeRate: response.takeRate || 20.0,
        takeRateChangePct: 0,
        pendingPayouts: 0,
        pendingCraftsmenCount: 0,
        mrr: response.mrr || 0,
      };
      return ok(summary);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async getSubscriptionPlans(): Promise<Result<any[]>> {
    try {
      const response = await apiClient.get<any[]>(API_ENDPOINTS.payments.plans);
      const plans = (response || []).map((p, idx) => ({
        id: p.id || `p-${idx}`,
        key: p.key || `PLAN_${p.durationMonths || 1}M`,
        name: p.nameEn || p.nameAr || p.key || 'Pass Plan',
        nameEn: p.nameEn || p.name || 'Pass Plan',
        nameAr: p.nameAr || p.name || 'خطة الاشتراك',
        durationMonths: Number(p.durationMonths || 1),
        price: Number(p.priceMonthly || p.price || 0),
        featuresEn: Array.isArray(p.featuresEn) ? p.featuresEn : typeof p.featuresEn === 'string' ? JSON.parse(p.featuresEn) : ['Full Jerusalem Task Access'],
        featuresAr: Array.isArray(p.featuresAr) ? p.featuresAr : typeof p.featuresAr === 'string' ? JSON.parse(p.featuresAr) : ['وصول كامل للمهام في القدس'],
        isPopular: Boolean(p.isPopular),
        subscribersCount: Number(p.subscribersCount || 0),
      }));
      return ok(plans);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async createSubscriptionPlan(data: any): Promise<Result<any>> {
    try {
      const response = await apiClient.post<any>(API_ENDPOINTS.admin.plans, {
        key: data.key || `PLAN_${data.durationMonths || 1}M_${Date.now().toString().slice(-4)}`,
        nameEn: data.nameEn || data.name || 'Plan',
        nameAr: data.nameAr || data.name || 'اشتراك',
        durationMonths: Number(data.durationMonths) || 1,
        price: Number(data.price) || 0,
        featuresEn: Array.isArray(data.featuresEn) ? data.featuresEn : (data.featuresEn || '').split('\n').filter(Boolean),
        featuresAr: Array.isArray(data.featuresAr) ? data.featuresAr : (data.featuresAr || '').split('\n').filter(Boolean),
        isPopular: Boolean(data.isPopular),
      });
      return ok(response);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async updateSubscriptionPlan(id: string, data: any): Promise<Result<any>> {
    try {
      const response = await apiClient.put<any>(`${API_ENDPOINTS.admin.plans}/${id}`, {
        nameEn: data.nameEn || data.name,
        nameAr: data.nameAr || data.name,
        durationMonths: Number(data.durationMonths) || 1,
        price: Number(data.price) || 0,
        featuresEn: Array.isArray(data.featuresEn) ? data.featuresEn : (data.featuresEn || '').split('\n').filter(Boolean),
        featuresAr: Array.isArray(data.featuresAr) ? data.featuresAr : (data.featuresAr || '').split('\n').filter(Boolean),
        isPopular: Boolean(data.isPopular),
      });
      return ok(response);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async deleteSubscriptionPlan(id: string): Promise<Result<boolean>> {
    try {
      await apiClient.delete<any>(`${API_ENDPOINTS.admin.plans}/${id}`);
      return ok(true);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async getSubscriptionRequests(statusFilter?: string): Promise<Result<any[]>> {
    try {
      const url = statusFilter ? `${API_ENDPOINTS.admin.subscriptionRequests}?status=${statusFilter}` : API_ENDPOINTS.admin.subscriptionRequests;
      const response = await apiClient.get<any[]>(url);
      return ok(response || []);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async approveSubscriptionRequest(requestId: string): Promise<Result<boolean>> {
    try {
      await apiClient.post<any>(API_ENDPOINTS.admin.approveSubscriptionRequest(requestId));
      return ok(true);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async rejectSubscriptionRequest(requestId: string, reason: string): Promise<Result<boolean>> {
    try {
      await apiClient.post<any>(API_ENDPOINTS.admin.rejectSubscriptionRequest(requestId), { reason });
      return ok(true);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async getBitSettings(): Promise<Result<Record<string, string>>> {
    try {
      const response = await apiClient.get<Record<string, string>>(API_ENDPOINTS.admin.bitSettings);
      return ok(response || {});
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async updateBitSettings(settings: Record<string, string>): Promise<Result<Record<string, string>>> {
    try {
      const response = await apiClient.put<Record<string, string>>(API_ENDPOINTS.admin.bitSettings, settings);
      return ok(response || {});
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async getSubscribers(): Promise<Result<any[]>> {
    try {
      const response = await apiClient.get<any[]>('/admin/subscriptions/subscribers');
      return ok(response || []);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async cancelSubscriber(id: string): Promise<Result<boolean>> {
    try {
      await apiClient.post<any>(`/admin/subscriptions/subscribers/${id}/cancel`);
      return ok(true);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async extendSubscriber(id: string, days: number = 30): Promise<Result<boolean>> {
    try {
      await apiClient.post<any>(`/admin/subscriptions/subscribers/${id}/extend`, { days });
      return ok(true);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async getFailedTransactions(): Promise<Result<FailedTransaction[]>> {
    try {
      const response = await apiClient.get<any>(API_ENDPOINTS.payments.failedTransactions);
      const items = response.items || [];
      const failed = items
        .filter((item: any) => item.status === 'FAILED' && item.type === 'WITHDRAWAL')
        .map((item: any) => {
          const profile = item.balance?.craftsmanProfile;
          const name = profile ? `${profile.firstName} ${profile.lastName}` : 'Craftsman';
          return {
            id: item.id,
            name,
            txId: item.referenceId || `#TX-${item.id.substring(0, 4)}`,
            bank: item.payoutAccount?.bankName || item.payoutAccount?.type || 'Bank Payout',
            timeAgo: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent',
            amount: Number(item.amount || 0),
            reasonKey: 'reason_bank_declined',
            retries: 0,
          };
        });
      return ok(failed);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async retryTransaction(id: string): Promise<Result<boolean>> {
    try {
      await apiClient.post<any>(API_ENDPOINTS.payments.retryTransaction(id));
      return ok(true);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async getWithdrawalRequests(): Promise<Result<WithdrawalRequest[]>> {
    try {
      const response = await apiClient.get<any>(API_ENDPOINTS.payments.withdrawalRequests);
      const items = response.items || [];
      const mapped = items.map((item: any) => {
        const profile = item.balance?.craftsmanProfile;
        const name = profile ? `${profile.firstName} ${profile.lastName}` : 'Craftsman';
        let status: WithdrawalRequest['status'] = 'pending';
        if (item.status === 'COMPLETED') {
          status = 'approved';
        } else if (item.status === 'FAILED') {
          status = 'rejected';
        }
        return {
          id: item.id,
          name,
          bank: item.payoutAccount?.bankName || item.payoutAccount?.type || 'Bank Payout',
          timeAgo: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent',
          amount: Number(item.amount || 0),
          status,
        };
      });
      return ok(mapped);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async updateWithdrawalStatus(id: string, status: 'approved' | 'rejected'): Promise<Result<WithdrawalRequest>> {
    try {
      const response = await apiClient.put<any>(
        API_ENDPOINTS.payments.updateWithdrawalStatus(id),
        { status }
      );
      
      const profile = response.balance?.craftsmanProfile;
      const name = profile ? `${profile.firstName} ${profile.lastName}` : 'Craftsman';
      
      let mappedStatus: WithdrawalRequest['status'] = 'pending';
      if (response.status === 'COMPLETED') {
        mappedStatus = 'approved';
      } else if (response.status === 'FAILED') {
        mappedStatus = 'rejected';
      }
      
      return ok({
        id: response.id,
        name,
        bank: response.payoutAccount?.bankName || response.payoutAccount?.type || 'Bank Payout',
        timeAgo: response.createdAt ? new Date(response.createdAt).toLocaleDateString() : 'Recent',
        amount: Number(response.amount || 0),
        status: mappedStatus,
      });
    } catch (error) {
      return fail(error as AppError);
    }
  }
}
export default ApiPaymentRepository;
