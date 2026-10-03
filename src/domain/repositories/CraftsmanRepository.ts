import { Craftsman } from '../entities/Craftsman';
import { Result } from '../../core/result/Result';

export type CraftsmanStatusFilter = 'all' | 'verified' | 'pending' | 'suspended';

export interface CraftsmenQuery {
  q?: string;
  status: CraftsmanStatusFilter;
  page: number;
  limit: number;
}

export interface CraftsmenCounts {
  all: number;
  verified: number;
  pending: number;
  suspended: number;
}

export interface CraftsmenResult {
  items: Craftsman[];
  total: number;
  counts: CraftsmenCounts;
}

export interface CraftsmanRepository {
  getCraftsmen(q: CraftsmenQuery): Promise<Result<CraftsmenResult>>;
  suspendCraftsman(id: string, reason?: string): Promise<Result<boolean>>;
  unsuspendCraftsman(id: string): Promise<Result<boolean>>;
  banCraftsman(id: string): Promise<Result<boolean>>;
  toggleVerificationItem(id: string, itemKey: string, approved: boolean): Promise<Result<boolean>>;
}
