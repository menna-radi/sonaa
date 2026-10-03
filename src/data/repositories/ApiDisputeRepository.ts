import type {
  DisputeRepository,
  DisputesQuery,
  DisputesResult,
} from '../../domain/repositories/DisputeRepository';
import type { Dispute, DisputeReason, DisputeResolution } from '../../domain/entities/Dispute';
import { Result, ok, fail } from '../../core/result/Result';
import { apiClient } from '../../core/network/apiClient';
import { API_ENDPOINTS } from '../../core/config/apiEndpoints';
import { AppError } from '../../core/errors/AppError';

const REASONS: DisputeReason[] = ['SERVICE_QUALITY', 'OVERCHARGING', 'NO_SHOW', 'SAFETY_CONCERN', 'OTHER'];

interface RawDispute {
  id: string;
  taskId?: string;
  reason?: string;
  description?: string;
  status?: string;
  resolution?: string;
  adminNotes?: string | null;
  createdAt?: string;
  resolvedAt?: string | null;
  task?: {
    id?: string;
    displayId?: string;
    title?: string;
    budgetAmount?: number | string;
    customerProfile?: { firstName?: string; lastName?: string } | null;
    craftsmanProfile?: { firstName?: string; lastName?: string } | null;
  } | null;
}

const num = (v: unknown): number => {
  const n = typeof v === 'string' || typeof v === 'number' ? Number(v) : NaN;
  return Number.isFinite(n) ? n : 0;
};

function mapDispute(d: RawDispute): Dispute {
  const reason: DisputeReason = (REASONS as string[]).includes(d.reason || '')
    ? (d.reason as DisputeReason)
    : 'OTHER';
  const customer = d.task?.customerProfile
    ? `${d.task.customerProfile.firstName ?? ''} ${d.task.customerProfile.lastName ?? ''}`.trim()
    : '';
  const craftsman = d.task?.craftsmanProfile
    ? `${d.task.craftsmanProfile.firstName ?? ''} ${d.task.craftsmanProfile.lastName ?? ''}`.trim()
    : null;
  return {
    id: d.id,
    taskId: d.taskId || d.task?.id || '',
    taskDisplayId: d.task?.displayId || d.task?.id || d.id.slice(0, 8),
    taskTitle: d.task?.title || '',
    customerName: customer,
    craftsmanName: craftsman || null,
    reason,
    description: d.description || '',
    status: d.status === 'RESOLVED' ? 'RESOLVED' : 'PENDING',
    resolution:
      d.resolution === 'REFUND_CLIENT' || d.resolution === 'PAY_CRAFTSMAN'
        ? d.resolution
        : undefined,
    adminNotes: d.adminNotes ?? undefined,
    amount: num(d.task?.budgetAmount),
    createdAt: d.createdAt || '',
    resolvedAt: d.resolvedAt ?? undefined,
  };
}

export class ApiDisputeRepository implements DisputeRepository {
  public async getDisputes(q: DisputesQuery): Promise<Result<DisputesResult>> {
    try {
      const response = await apiClient.get<{
        items?: RawDispute[];
        total?: number;
        page?: number;
        limit?: number;
        counts?: { pending: number; resolved: number };
      }>(API_ENDPOINTS.admin.disputes, {
        page: q.page,
        limit: q.limit,
        ...(q.status === 'ALL' ? {} : { status: q.status }),
      });
      const rawItems = Array.isArray(response) ? (response as unknown as RawDispute[]) : response.items || [];
      let items = rawItems.map(mapDispute);
      if (q.status !== 'ALL') {
        items = items.filter((d) => d.status === q.status);
      }
      const total = Array.isArray(response) ? items.length : response.total ?? items.length;
      const counts = !Array.isArray(response) && response.counts ? response.counts : undefined;
      return ok({ items, total, counts });
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async resolveDispute(
    id: string,
    resolution: DisputeResolution,
    notes?: string
  ): Promise<Result<boolean>> {
    try {
      await apiClient.post(API_ENDPOINTS.admin.resolveDispute(id), {
        resolution,
        ...(notes ? { notes } : {}),
      });
      return ok(true);
    } catch (error) {
      return fail(error as AppError);
    }
  }
}
export default ApiDisputeRepository;
