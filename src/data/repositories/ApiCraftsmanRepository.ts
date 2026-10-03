import {
  CraftsmanRepository,
  CraftsmenQuery,
  CraftsmenResult,
} from '../../domain/repositories/CraftsmanRepository';
import { Craftsman, AccountStatus } from '../../domain/entities/Craftsman';
import { Result, ok, fail } from '../../core/result/Result';
import { apiClient } from '../../core/network/apiClient';
import { API_ENDPOINTS } from '../../core/config/apiEndpoints';
import { AppError } from '../../core/errors/AppError';

interface RawCraftsman {
  id: string;
  firstName?: string;
  lastName?: string;
  title?: string;
  avatarUrl?: string | null;
  rating?: number;
  completedTasksCount?: number;
  trustScore?: number;
  isAvailable?: boolean;
  isVerifiedId?: boolean;
  isVerifiedSelfie?: boolean;
  isVerifiedCert?: boolean;
  isVerifiedBankIban?: boolean;
  isVerifiedBackground?: boolean;
  isInsured?: boolean;
  responseTimeMinutes?: number;
  freeTasksRemaining?: number;
  billingModel?: 'SUBSCRIPTION' | 'COMMISSION' | null;
  commissionLocked?: boolean;
  subscriptionStatus?: 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  subscriptionExpiryDate?: string | null;
  user?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string | null;
    phoneNumber?: string | null;
    status?: AccountStatus;
    createdAt?: string;
  } | null;
  skills?: Array<{ id: string; name: string }>;
  verificationRequest?: { id: string; status: string } | null;
}

const num = (v: unknown, fallback = 0): number => {
  const n = typeof v === 'string' || typeof v === 'number' ? Number(v) : NaN;
  return Number.isFinite(n) ? n : fallback;
};

export function mapCraftsman(c: RawCraftsman): Craftsman {
  const first = c.user?.firstName || c.firstName || '';
  const last = c.user?.lastName || c.lastName || '';
  const accountStatus: AccountStatus = c.user?.status || 'ACTIVE';
  let status: Craftsman['status'] = c.isAvailable ? 'online' : 'offline';
  if (accountStatus === 'BLOCKED') status = 'banned';
  else if (accountStatus === 'SUSPENDED') status = 'suspended';
  return {
    id: c.id,
    name: `${first} ${last}`.trim() || 'Craftsman',
    trade: c.title || 'Craftsman',
    avatarUrl: c.avatarUrl || undefined,
    rating: num(c.rating, 0),
    reviewsCount: num(c.completedTasksCount),
    jobsCount: num(c.completedTasksCount),
    trustScore: c.trustScore !== undefined ? num(c.trustScore) : 1,
    status,
    accountStatus,
    billing: {
      freeTasksRemaining: typeof c.freeTasksRemaining === 'number' ? c.freeTasksRemaining : 0,
      billingModel: c.billingModel ?? null,
      commissionLocked: c.commissionLocked === true,
      subscriptionStatus: c.subscriptionStatus || 'EXPIRED',
      subscriptionExpiryDate: c.subscriptionExpiryDate ?? undefined,
    },
    isAvailable: c.isAvailable !== undefined ? !!c.isAvailable : true,
    isVerifiedId: !!c.isVerifiedId,
    joinedDate: c.user?.createdAt || '',
    idNumber: c.user?.phoneNumber || '',
    responseTimeMin: num(c.responseTimeMinutes, 15),
    verifications: {
      nationalId: !!c.isVerifiedId,
      selfieMatch: !!c.isVerifiedSelfie,
      tradeLicense: !!c.isVerifiedCert,
      bankIban: !!c.isVerifiedBankIban,
      backgroundCheck: !!c.isVerifiedBackground,
      insurance: !!c.isInsured,
    },
  };
}

export class ApiCraftsmanRepository implements CraftsmanRepository {
  public async getCraftsmen(q: CraftsmenQuery): Promise<Result<CraftsmenResult>> {
    try {
      const response = await apiClient.get<{
        items?: RawCraftsman[];
        total?: number;
        counts?: { all: number; verified: number; pending: number; suspended: number; banned?: number; locked?: number };
      }>(API_ENDPOINTS.craftsmen.list, {
        q: q.q || undefined,
        status: q.status === 'all' ? undefined : q.status,
        page: q.page,
        limit: q.limit,
      });
      const items = Array.isArray(response)
        ? (response as unknown as RawCraftsman[]).map(mapCraftsman)
        : (response.items || []).map(mapCraftsman);
      const total = Array.isArray(response) ? items.length : response.total ?? items.length;
      const serverCounts = Array.isArray(response) ? undefined : response.counts;
      const counts = {
        all: serverCounts?.all ?? total,
        verified: serverCounts?.verified ?? items.filter((c) => c.isVerifiedId).length,
        pending: serverCounts?.pending ?? items.filter((c) => !c.isVerifiedId).length,
        suspended:
          serverCounts?.suspended ?? items.filter((c) => c.accountStatus !== 'ACTIVE').length,
      };
      return ok({ items, total, counts });
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async suspendCraftsman(id: string, reason?: string): Promise<Result<boolean>> {
    try {
      await apiClient.put(API_ENDPOINTS.craftsmen.suspend(id), { reason });
      return ok(true);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async unsuspendCraftsman(id: string): Promise<Result<boolean>> {
    try {
      await apiClient.put(API_ENDPOINTS.craftsmen.unsuspend(id));
      return ok(true);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async banCraftsman(id: string): Promise<Result<boolean>> {
    try {
      await apiClient.put(API_ENDPOINTS.craftsmen.ban(id));
      return ok(true);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async toggleVerificationItem(
    id: string,
    itemKey: string,
    approved: boolean
  ): Promise<Result<boolean>> {
    try {
      await apiClient.post(API_ENDPOINTS.craftsmen.toggleVerificationItem(id), { itemKey, approved });
      return ok(true);
    } catch (error) {
      return fail(error as AppError);
    }
  }
}
export default ApiCraftsmanRepository;
