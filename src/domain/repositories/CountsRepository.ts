import { Result } from '../../core/result/Result';

export interface AdminCounts {
  verification: number;
  reports: number;
  disputes: number;
  billing: number;
  payments: number;
  notifications: number;
}

export interface CountsRepository {
  getCounts(): Promise<Result<AdminCounts | null>>;
}

export default CountsRepository;
