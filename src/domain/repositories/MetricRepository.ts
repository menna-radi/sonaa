import { Metric } from '../entities/Metric';
import { Result } from '../../core/result/Result';

export interface CategoryVolume {
  nameKey: string;
  tasksCount: number;
  percentage: number;
  trendPercentage: number;
}

export interface PendingReport {
  id: string;
  typeKey: string;
  details: string;
  timeKey: string;
}

export interface VerificationSubmission {
  id: string;
  name: string;
  roleKey: string;
  timeKey: string;
  avatarUrl: string;
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
  getVerificationSubmissions(): Promise<Result<VerificationSubmission[]>>;
  getCohortData(): Promise<Result<CohortData[]>>;
}
