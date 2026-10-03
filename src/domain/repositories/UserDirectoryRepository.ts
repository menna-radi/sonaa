import type { UserSummary, UserRole, UserAccountStatus } from '../entities/UserSummary';
import type { Result } from '../../core/result/Result';

export type { UserSummary };

export interface UsersQuery {
  q: string;
  role: UserRole | 'ALL';
  page: number;
  limit: number;
}

export interface UsersResult {
  items: UserSummary[];
  total: number;
}

export interface UserDirectoryRepository {
  getUsers(q: UsersQuery): Promise<Result<UsersResult>>;
  setUserStatus(id: string, status: UserAccountStatus, reason?: string): Promise<Result<boolean>>;
}
