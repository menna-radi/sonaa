import { Metric } from '../entities/Metric';
import { Result } from '../../core/result/Result';

export interface CategoryVolume {
  nameKey: string;
  tasksCount: number;
  percentage: number;
  /** Week-over-week trend — only set when measured. Never fabricated. */
  trendPercentage?: number;
}

export interface PendingReport {
  id: string;
  typeKey: string;
  details: string;
  timeKey: string;
  /** Real dispute title from the backend (B09) when present. */
  title?: string;
  /** Real "A vs B" subtitle from the backend (B09) when present. */
  subtitle?: string;
  /** Real creation timestamp from the backend (B09) when present. */
  createdAt?: string;
}

export interface VerificationSubmission {
  id: string;
  name: string;
  roleKey: string;
  timeKey: string;
  avatarUrl?: string;
  /** Real submission timestamp from the queue endpoint (ISO string). */
  submittedAt?: string;
}

export interface VerificationSubmissions {
  submissions: VerificationSubmission[];
  /** Full queue size from the backend (may exceed the previewed submissions). */
  total: number;
}

export interface RevenuePoint {
  date: string;
  revenue: number;
}

/** Real revenue analytics from GET /admin/overview-stats → analytics. */
export interface RevenueAnalytics {
  gmv: number;
  takeRate: number;
  avgOrderValue: number;
  disputeRate: number;
  series: RevenuePoint[];
}

export interface CohortData {
  week: string;
  users: number;
  craftsmen: number;
  tasks: number;
}

export interface MetricRepository {
  getMetrics(): Promise<Result<Metric[]>>;
  updateMetric(id: string, value: number): Promise<Result<Metric>>;
  getCategoryVolumes(): Promise<Result<CategoryVolume[]>>;
  getPendingReports(): Promise<Result<PendingReport[]>>;
  getVerificationSubmissions(): Promise<Result<VerificationSubmissions>>;
  getCohortData(): Promise<Result<CohortData[]>>;
  getRevenueAnalytics(): Promise<Result<RevenueAnalytics>>;
}
