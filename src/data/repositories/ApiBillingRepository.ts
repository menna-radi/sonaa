import type { Result } from '../../core/result/Result';
import { ok, fail } from '../../core/result/Result';
import type { AppError } from '../../core/errors/AppError';
import { NotFoundError } from '../../core/errors/AppError';
import { apiClient } from '../../core/network/apiClient';
import { API_ENDPOINTS } from '../../core/config/apiEndpoints';
import { toPage, type Page } from '../mappers/pageMapper';
import { optional } from './optional';
import type { BillingRepository } from '../../domain/repositories/BillingRepository';
import type * as B from '../../domain/entities/Billing';
import {
  mapPlan,
  mapRequest,
  mapSubscriber,
  mapCommissionPayment,
  mapLedger,
  mapBitSettings,
  mapBitPayload,
  mapPlatformSettings,
  type RawPlan,
  type RawRequest,
  type RawSubscriber,
  type RawCommissionPayment,
  type RawLedgerEntry,
} from '../mappers/BillingMapper';

type RequestQuery = B.ListQuery & { status: B.SubscriptionRequestStatus | 'ALL' };
type SubscriberQuery = B.ListQuery & { filter: 'all' | 'active' | 'free' | 'commission' | 'locked' | 'expired' };
type CommissionQuery = B.ListQuery & { status: B.CommissionPaymentStatus | 'ALL' };
type LedgerQuery = B.ListQuery & { status: B.CommissionLedgerStatus | 'ALL' };

const matchesSearch = (q: string | undefined, haystacks: Array<string | undefined>): boolean => {
  if (!q) return true;
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return haystacks.some((h) => (h || '').toLowerCase().includes(needle));
};

const isActiveSubscriber = (s: B.Subscriber): boolean =>
  s.subscriptionStatus === 'ACTIVE' && (!s.expiryDate || new Date(s.expiryDate).getTime() > Date.now());

export class ApiBillingRepository implements BillingRepository {
  async getPlans(): Promise<Result<B.SubscriptionPlan[]>> {
    try {
      const raw = await apiClient.get<RawPlan[]>(API_ENDPOINTS.admin.plans);
      return ok((Array.isArray(raw) ? raw : []).map(mapPlan));
    } catch (error) {
      return fail(error as AppError);
    }
  }

  async createPlan(input: B.PlanInput): Promise<Result<B.SubscriptionPlan>> {
    try {
      const { key, nameEn, nameAr, durationMonths, price, featuresEn, featuresAr, isPopular } = input;
      const created = await apiClient.post<RawPlan>(API_ENDPOINTS.admin.plans, {
        key,
        nameEn,
        nameAr,
        durationMonths,
        price,
        featuresEn,
        featuresAr,
        isPopular,
      });
      if (input.isActive === false) {
        const toggled = await apiClient.put<RawPlan>(`${API_ENDPOINTS.admin.plans}/${created.id}`, {
          isActive: false,
        });
        return ok(mapPlan(toggled));
      }
      return ok(mapPlan(created));
    } catch (error) {
      return fail(error as AppError);
    }
  }

  async updatePlan(id: string, input: Partial<B.PlanInput>): Promise<Result<B.SubscriptionPlan>> {
    try {
      const body: Record<string, unknown> = {};
      const keys = [
        'nameEn',
        'nameAr',
        'durationMonths',
        'price',
        'featuresEn',
        'featuresAr',
        'isPopular',
        'isActive',
      ] as const;
      for (const k of keys) {
        if (input[k] !== undefined) body[k] = input[k];
      }
      const updated = await apiClient.put<RawPlan>(`${API_ENDPOINTS.admin.plans}/${id}`, body);
      return ok(mapPlan(updated));
    } catch (error) {
      return fail(error as AppError);
    }
  }

  async deletePlan(id: string): Promise<Result<boolean>> {
    try {
      await apiClient.delete(`${API_ENDPOINTS.admin.plans}/${id}`);
      return ok(true);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  async getRequests(q: RequestQuery): Promise<Result<Page<B.SubscriptionRequest>>> {
    try {
      const raw = await apiClient.get<unknown>(API_ENDPOINTS.admin.subscriptionRequests, {
        page: q.page,
        limit: q.limit,
        status: q.status,
        ...(q.search ? { q: q.search } : {}),
      });
      return ok(
        toPage<RawRequest, B.SubscriptionRequest>(raw, q.page, q.limit, mapRequest, (r) =>
          matchesSearch(q.search, [r.userName, r.planTitle, r.userPhone])
        )
      );
    } catch (error) {
      return fail(error as AppError);
    }
  }

  async approveRequest(id: string): Promise<Result<boolean>> {
    try {
      await apiClient.post(API_ENDPOINTS.admin.approveSubscriptionRequest(id));
      return ok(true);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  async rejectRequest(id: string, reason: string): Promise<Result<boolean>> {
    try {
      await apiClient.post(API_ENDPOINTS.admin.rejectSubscriptionRequest(id), { reason });
      return ok(true);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  async getSubscribers(q: SubscriberQuery): Promise<Result<Page<B.Subscriber>>> {
    try {
      const raw = await apiClient.get<unknown>(API_ENDPOINTS.admin.subscribers, {
        page: q.page,
        limit: q.limit,
        filter: q.filter,
        ...(q.search ? { q: q.search } : {}),
      });
      return ok(
        toPage<RawSubscriber, B.Subscriber>(raw, q.page, q.limit, mapSubscriber, (s) => {
        if (q.filter === 'active' && !isActiveSubscriber(s)) return false;
        if (q.filter === 'free' && !(s.freeTasksRemaining > 0)) return false;
        if (q.filter === 'commission' && s.billingModel !== 'COMMISSION') return false;
        if (q.filter === 'locked' && !s.commissionLocked) return false;
        if (q.filter === 'expired' && isActiveSubscriber(s)) return false;
        return matchesSearch(q.search, [s.name, s.phone, s.email]);
        })
      );
    } catch (error) {
      return fail(error as AppError);
    }
  }

  async extendSubscriber(id: string, days: number): Promise<Result<boolean>> {
    try {
      await apiClient.post(`/admin/subscriptions/subscribers/${id}/extend`, { days });
      return ok(true);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  async cancelSubscriber(id: string): Promise<Result<boolean>> {
    try {
      await apiClient.post(`/admin/subscriptions/subscribers/${id}/cancel`, {});
      return ok(true);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  async setFreeTasks(id: string, freeTasksRemaining: number): Promise<Result<boolean>> {
    try {
      await apiClient.put(API_ENDPOINTS.admin.setFreeTasks(id), { freeTasksRemaining });
      return ok(true);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  async getCommissionPayments(q: CommissionQuery): Promise<Result<Page<B.CommissionPayment>>> {
    try {
      const raw = await apiClient.get<unknown>(API_ENDPOINTS.admin.commissionPayments, {
        page: q.page,
        limit: q.limit,
        status: q.status,
        ...(q.search ? { q: q.search } : {}),
      });
      return ok(
        toPage<RawCommissionPayment, B.CommissionPayment>(raw, q.page, q.limit, mapCommissionPayment, (p) =>
          matchesSearch(q.search, [p.craftsmanName, p.phone, p.email])
        )
      );
    } catch (error) {
      return fail(error as AppError);
    }
  }

  async approveCommissionPayment(id: string): Promise<Result<{ unlocked: boolean; settledEntries: number }>> {
    try {
      const res = await apiClient.post<{ unlocked?: boolean; settledEntries?: number }>(
        API_ENDPOINTS.admin.approveCommissionPayment(id)
      );
      return ok({ unlocked: res.unlocked === true, settledEntries: Number(res.settledEntries || 0) });
    } catch (error) {
      return fail(error as AppError);
    }
  }

  async rejectCommissionPayment(id: string, reason: string): Promise<Result<boolean>> {
    try {
      await apiClient.post(API_ENDPOINTS.admin.rejectCommissionPayment(id), { reason });
      return ok(true);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  async getCommissionLedger(q: LedgerQuery): Promise<Result<Page<B.CommissionLedgerEntry> | null>> {
    return optional(
      () =>
        apiClient.get<{
          items?: RawLedgerEntry[];
          total?: number;
          page?: number;
          limit?: number;
          totals?: { due?: number; paid?: number };
        }>(API_ENDPOINTS.admin.commissionLedger, { page: q.page, limit: q.limit, status: q.status }),
      (raw) => {
        const page = toPage<RawLedgerEntry, B.CommissionLedgerEntry>(raw, q.page, q.limit, mapLedger);
        const totals = raw && typeof raw === 'object' && 'totals' in raw ? raw.totals : undefined;
        if (totals) {
          page.totals = {
            due: Number(totals.due || 0),
            paid: Number(totals.paid || 0),
          };
        }
        return ok(page);
      }
    );
  }

  async getBitSettings(): Promise<Result<B.BitSettings>> {
    try {
      const raw = await apiClient.get<Record<string, string>>(API_ENDPOINTS.admin.bitSettings);
      return ok(mapBitSettings(raw || {}));
    } catch (error) {
      return fail(error as AppError);
    }
  }

  async updateBitSettings(s: B.BitSettings): Promise<Result<B.BitSettings>> {
    try {
      const raw = await apiClient.put<Record<string, string>>(API_ENDPOINTS.admin.bitSettings, mapBitPayload(s));
      return ok(mapBitSettings(raw || {}));
    } catch (error) {
      return fail(error as AppError);
    }
  }

  async getPlatformSettings(): Promise<Result<B.PlatformSettings>> {
    try {
      const raw = await apiClient.get<{
        freeTasksCount: number;
        commissionRate: number;
        autoVerifyCraftsmen: boolean;
      }>(API_ENDPOINTS.admin.platformSettings);
      return ok({
        freeTasksCount: raw.freeTasksCount,
        commissionRate: raw.commissionRate,
        autoVerifyCraftsmen: raw.autoVerifyCraftsmen,
      });
    } catch (error) {
      if (!(error instanceof NotFoundError)) return fail(error as AppError);
      try {
        const [settings, auto] = await Promise.all([
          apiClient.get<Record<string, string>>(API_ENDPOINTS.systemSettings),
          apiClient.get<{ enabled?: boolean }>(API_ENDPOINTS.admin.autoVerification),
        ]);
        return ok(mapPlatformSettings(settings || {}, auto.enabled === true));
      } catch (fallbackError) {
        return fail(fallbackError as AppError);
      }
    }
  }

  async updatePlatformSettings(s: Partial<B.PlatformSettings>): Promise<Result<B.PlatformSettings>> {
    try {
      const body: Record<string, string> = {};
      if (s.freeTasksCount !== undefined) body.FREE_TASKS_COUNT = String(s.freeTasksCount);
      if (s.commissionRate !== undefined) body.COMMISSION_RATE = String(s.commissionRate);
      if (Object.keys(body).length > 0) {
        await apiClient.put(API_ENDPOINTS.systemSettings, body);
      }
      if (s.autoVerifyCraftsmen !== undefined) {
        await apiClient.put(API_ENDPOINTS.admin.autoVerification, { enabled: s.autoVerifyCraftsmen });
      }
      return this.getPlatformSettings();
    } catch (error) {
      return fail(error as AppError);
    }
  }

  async getSummary(): Promise<Result<B.BillingSummary | null>> {
    return optional(
      () => apiClient.get<B.BillingSummary>(API_ENDPOINTS.admin.billingSummary),
      (raw) => ok(raw)
    );
  }
}
