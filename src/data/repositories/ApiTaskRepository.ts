import type {
  TaskRepository,
  TasksQuery,
  TasksResult,
} from '../../domain/repositories/TaskRepository';
import type { Task, TaskDetail, TaskFilter, TaskStatus } from '../../domain/entities/Task';
import { Result, ok, fail } from '../../core/result/Result';
import { apiClient } from '../../core/network/apiClient';
import { API_ENDPOINTS } from '../../core/config/apiEndpoints';
import { AppError, NotFoundError } from '../../core/errors/AppError';

const TASK_STATUSES: TaskStatus[] = [
  'PENDING',
  'ACCEPTED',
  'PRE_CHAT_PENDING',
  'CHAT_OPEN',
  'AGREEMENT_PENDING',
  'IN_PROGRESS',
  'WORK_SUBMITTED',
  'RATING_PENDING',
  'CLOSED',
  'COMPLETED',
  'CANCELLED',
  'REJECTED',
  'DISPUTED',
  'FROZEN',
];

const LIVE_STATUSES = ['ACCEPTED', 'PRE_CHAT_PENDING', 'CHAT_OPEN', 'AGREEMENT_PENDING', 'IN_PROGRESS', 'WORK_SUBMITTED'];

interface RawTask {
  id: string;
  displayId?: string;
  title?: string;
  status?: string;
  budgetAmount?: number | string;
  budgetType?: 'SPECIFIC' | 'OPEN';
  distributionType?: 'DIRECT' | 'BROADCAST';
  serviceType?: string;
  locationAddress?: string;
  customerProfile?: { firstName?: string; lastName?: string } | null;
  craftsmanProfile?: { firstName?: string; lastName?: string } | null;
  createdAt?: string;
  acceptedAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  freeTaskReserved?: boolean | null;
  cancelReason?: string | null;
  cancelNote?: string | null;
  dispute?: unknown | null;
  emergencyRequest?: { status?: string } | null;
  offersCount?: number;
  _count?: { offers?: number };
}

const num = (v: unknown): number => {
  const n = typeof v === 'string' || typeof v === 'number' ? Number(v) : NaN;
  return Number.isFinite(n) ? n : 0;
};

function mapTask(item: RawTask): Task {
  const rawStatus = (item.status || 'PENDING').toUpperCase();
  const status: TaskStatus = (TASK_STATUSES as string[]).includes(rawStatus) ? (rawStatus as TaskStatus) : 'PENDING';
  const customerName = item.customerProfile
    ? `${item.customerProfile.firstName ?? ''} ${item.customerProfile.lastName ?? ''}`.trim()
    : '';
  const craftsmanName = item.craftsmanProfile
    ? `${item.craftsmanProfile.firstName ?? ''} ${item.craftsmanProfile.lastName ?? ''}`.trim()
    : null;
  return {
    id: item.id,
    displayId: item.displayId || item.id.slice(0, 8),
    title: item.title || '',
    status,
    isEmergency: item.emergencyRequest?.status === 'ACTIVE' || item.serviceType === 'EMERGENCY',
    customerName: customerName || '',
    craftsmanName: craftsmanName || null,
    category: item.serviceType || '',
    address: item.locationAddress || '',
    amount: num(item.budgetAmount),
    budgetType: item.budgetType === 'OPEN' ? 'OPEN' : 'SPECIFIC',
    distributionType: item.distributionType === 'BROADCAST' ? 'BROADCAST' : 'DIRECT',
    createdAt: item.createdAt || '',
    acceptedAt: item.acceptedAt ?? undefined,
    startedAt: item.startedAt ?? undefined,
    completedAt: item.completedAt ?? undefined,
    freeTaskReserved: item.freeTaskReserved ?? null,
    cancelReason: item.cancelReason ?? null,
    cancelNote: item.cancelNote ?? null,
    hasDispute: item.dispute != null || status === 'DISPUTED',
    offersCount: item.offersCount ?? item._count?.offers,
  };
}

function statusParam(filter: TaskFilter): string | undefined {
  switch (filter) {
    case 'all':
      return undefined;
    case 'live':
      return LIVE_STATUSES.join(',');
    case 'emergency':
      // No EMERGENCY status exists server-side: fetch the page and filter client-side.
      return undefined;
    case 'disputed':
      return 'DISPUTED';
    case 'done':
      return 'RATING_PENDING,CLOSED,COMPLETED';
    case 'cancelled':
      return 'CANCELLED,REJECTED';
    case 'frozen':
      return 'FROZEN';
  }
}

interface RawListResponse {
  items?: RawTask[];
  total?: number;
  page?: number;
  limit?: number;
  counts?: { all: number; live: number; emergency: number; disputed: number; done: number; cancelled: number; frozen: number };
}

interface RawDetail {
  task?: RawTask;
  customer?: { id: string; name: string; phone?: string } | null;
  craftsman?: { id: string; name: string; phone?: string; title?: string } | null;
  offers?: Array<{
    id: string;
    craftsman?: { id: string; name: string } | null;
    amount?: number | string;
    status?: string;
    note?: string | null;
    createdAt?: string;
  }>;
  agreement?: {
    id: string;
    finalPrice?: number | string;
    scope?: string;
    scheduledAt?: string;
    status?: string;
    customerConfirmed?: boolean;
    craftsmanConfirmed?: boolean;
    createdAt?: string;
  } | null;
  workProof?: { imageUrls?: string[]; submittedAt?: string } | null;
  dispute?: unknown | null;
  emergency?: unknown | null;
  commission?: { amount?: number | string; rate?: number | string; status?: string } | null;
  cancel?: { reason?: string | null; note?: string | null };
}

function mapDetail(raw: RawDetail, fallbackTask?: Task): TaskDetail {
  if (!raw.task && fallbackTask) {
    return {
      task: fallbackTask,
      customer: fallbackTask.customerName ? { id: '', name: fallbackTask.customerName } : null,
      craftsman: fallbackTask.craftsmanName ? { id: '', name: fallbackTask.craftsmanName } : null,
      offers: [],
      agreement: null,
      workProof: { imageUrls: [] },
      dispute: fallbackTask.hasDispute ? {} : null,
      emergency: fallbackTask.isEmergency ? {} : null,
      commission: null,
      cancel: { reason: fallbackTask.cancelReason ?? null, note: fallbackTask.cancelNote ?? null },
    };
  }
  const t = raw.task ? mapTask(raw.task) : (fallbackTask as Task);
  return {
    task: t,
    customer: raw.customer ?? null,
    craftsman: raw.craftsman ?? null,
    offers: (raw.offers || []).map((o) => ({
      id: o.id,
      craftsman: o.craftsman ?? null,
      amount: num(o.amount),
      status: o.status || '',
      note: o.note ?? null,
      createdAt: o.createdAt || '',
    })),
    agreement: raw.agreement
      ? {
          id: raw.agreement.id,
          finalPrice: num(raw.agreement.finalPrice),
          scope: raw.agreement.scope || '',
          scheduledAt: raw.agreement.scheduledAt || '',
          status: raw.agreement.status || '',
          customerConfirmed: raw.agreement.customerConfirmed === true,
          craftsmanConfirmed: raw.agreement.craftsmanConfirmed === true,
          createdAt: raw.agreement.createdAt || '',
        }
      : null,
    workProof: {
      imageUrls: Array.isArray(raw.workProof?.imageUrls) ? (raw.workProof?.imageUrls as string[]) : [],
      submittedAt: raw.workProof?.submittedAt,
    },
    dispute: raw.dispute ?? null,
    emergency: raw.emergency ?? null,
    commission: raw.commission
      ? { amount: num(raw.commission.amount), rate: num(raw.commission.rate), status: raw.commission.status || '' }
      : null,
    cancel: { reason: raw.cancel?.reason ?? null, note: raw.cancel?.note ?? null },
  };
}

export class ApiTaskRepository implements TaskRepository {
  public async getTasks(q: TasksQuery): Promise<Result<TasksResult>> {
    try {
      const status = statusParam(q.status);
      const response = await apiClient.get<RawListResponse>(API_ENDPOINTS.tasks.list, {
        ...(status ? { status } : {}),
        ...(q.q ? { q: q.q } : {}),
        page: q.page,
        limit: q.limit,
      });
      const rawItems = Array.isArray(response) ? (response as unknown as RawTask[]) : response.items || [];
      let items = rawItems.map(mapTask);
      if (q.status === 'emergency') {
        items = items.filter((t) => t.isEmergency);
      }
      const total = Array.isArray(response) ? items.length : response.total ?? items.length;
      const counts = !Array.isArray(response) && response.counts
        ? {
            all: response.counts.all,
            live: response.counts.live,
            emergency: response.counts.emergency,
            disputed: response.counts.disputed,
            done: response.counts.done,
            cancelled: response.counts.cancelled,
            frozen: response.counts.frozen,
          }
        : undefined;
      return ok({ items, total, counts });
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async getTask(id: string): Promise<Result<TaskDetail>> {
    try {
      const raw = await apiClient.get<RawDetail>(API_ENDPOINTS.admin.task(id));
      return ok(mapDetail(raw));
    } catch (error) {
      if (!(error instanceof NotFoundError)) return fail(error as AppError);
      try {
        const list = await this.getTasks({ status: 'all', page: 1, limit: 100 });
        if (!list.success) return fail(error as AppError);
        const row = list.data.items.find((t) => t.id === id);
        if (!row) return fail(error as AppError);
        return ok(mapDetail({}, row));
      } catch (fallbackError) {
        return fail(fallbackError as AppError);
      }
    }
  }

  public async freezeTask(id: string): Promise<Result<boolean>> {
    try {
      await apiClient.post(API_ENDPOINTS.tasks.freeze(id));
      return ok(true);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async unfreezeTask(id: string): Promise<Result<boolean>> {
    try {
      await apiClient.post(API_ENDPOINTS.tasks.unfreeze(id));
      return ok(true);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async dispatchBackup(id: string, craftsmanProfileId: string): Promise<Result<boolean>> {
    try {
      await apiClient.post(API_ENDPOINTS.admin.dispatchBackup(id), { craftsmanProfileId });
      return ok(true);
    } catch (error) {
      return fail(error as AppError);
    }
  }
}
export default ApiTaskRepository;
