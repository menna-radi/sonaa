import type { AuditLog } from '../entities/AuditLog';
import type { Result } from '../../core/result/Result';

export interface AuditLogQuery {
  page: number;
  limit: number;
  actor?: string;
  action?: string;
  targetType?: string;
  from?: string;
  to?: string;
  q?: string;
}

export interface AuditLogPage {
  items: AuditLog[];
  total: number;
  filters?: { actions: string[]; targetTypes: string[] };
  /** `true` when the server understood the filter params (`'filters' in response`). */
  serverFiltering: boolean;
}

export interface AuditRepository {
  getLogs(q: AuditLogQuery): Promise<Result<AuditLogPage>>;
}
