import type { AuditLogPage, AuditLogQuery, AuditRepository } from '../../domain/repositories/AuditRepository';
import type { AuditLog } from '../../domain/entities/AuditLog';
import { Result, ok, fail } from '../../core/result/Result';
import { apiClient } from '../../core/network/apiClient';
import { API_ENDPOINTS } from '../../core/config/apiEndpoints';
import { AppError } from '../../core/errors/AppError';

interface RawAuditLog {
  id: string;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  before?: unknown;
  after?: unknown;
  createdAt: string;
  ipAddress?: string | null;
  actor?: { firstName?: string | null; lastName?: string | null; email?: string | null } | null;
}

interface RawAuditResponse {
  items?: RawAuditLog[];
  total?: number;
  filters?: { actions?: string[]; targetTypes?: string[] };
}

const FILTER_KEYS = ['actor', 'action', 'targetType', 'from', 'to', 'q'] as const;

function mapLog(r: RawAuditLog): AuditLog {
  const name = `${r.actor?.firstName ?? ''} ${r.actor?.lastName ?? ''}`.trim();
  return {
    id: r.id,
    action: r.action,
    ...(r.targetType ? { targetType: r.targetType } : {}),
    ...(r.targetId ? { targetId: r.targetId } : {}),
    before: r.before ?? null,
    after: r.after ?? null,
    createdAt: r.createdAt,
    actorName: name || r.actor?.email || '',
    ...(r.actor?.email ? { actorEmail: r.actor.email } : {}),
    ...(r.ipAddress ? { ipAddress: r.ipAddress } : {}),
  };
}

export class ApiAuditRepository implements AuditRepository {
  public async getLogs(q: AuditLogQuery): Promise<Result<AuditLogPage>> {
    try {
      const params: Record<string, unknown> = { page: q.page, limit: q.limit };
      FILTER_KEYS.forEach((k) => {
        if (q[k]) params[k] = q[k];
      });
      const raw = await apiClient.get<RawAuditResponse>(API_ENDPOINTS.admin.auditLogs, params);
      const items = (raw.items ?? []).map(mapLog);
      return ok({
        items,
        total: raw.total ?? items.length,
        ...(raw.filters
          ? { filters: { actions: raw.filters.actions ?? [], targetTypes: raw.filters.targetTypes ?? [] } }
          : {}),
        serverFiltering: 'filters' in raw,
      });
    } catch (error) {
      return fail(error as AppError);
    }
  }
}
export default ApiAuditRepository;
