import type { Dispute, DisputeResolution, DisputeStatus } from '../entities/Dispute';
import type { Result } from '../../core/result/Result';

export type { Dispute };

export interface DisputesQuery {
  status: DisputeStatus | 'ALL';
  page: number;
  limit: number;
}

export interface DisputesResult {
  items: Dispute[];
  total: number;
  counts?: { pending: number; resolved: number };
}

export interface DisputeRepository {
  getDisputes(q: DisputesQuery): Promise<Result<DisputesResult>>;
  resolveDispute(id: string, resolution: DisputeResolution, notes?: string): Promise<Result<boolean>>;
}
