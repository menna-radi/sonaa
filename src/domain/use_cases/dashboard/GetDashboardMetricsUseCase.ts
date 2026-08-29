import { MetricRepository, CategoryVolume, PendingReport, VerificationSubmission, CohortData } from '../../repositories/MetricRepository';
import { Metric } from '../../entities/Metric';
import { Result, ok, fail } from '../../../core/result/Result';
import { AppError } from '../../../core/errors/AppError';

export interface DashboardDataSnapshot {
  metrics: Metric[];
  categories: CategoryVolume[];
  reports: PendingReport[];
  submissions: VerificationSubmission[];
  cohortData: CohortData[];
}

export class GetDashboardMetricsUseCase {
  constructor(private readonly metricRepository: MetricRepository) {}

  public async execute(): Promise<Result<DashboardDataSnapshot>> {
    try {
      // Parallel resilient loading of all statistics using repository contracts
      const [
        metricsRes,
        categoriesRes,
        reportsRes,
        submissionsRes,
        cohortsRes
      ] = await Promise.allSettled([
        this.metricRepository.getMetrics(),
        this.metricRepository.getCategoryVolumes(),
        this.metricRepository.getPendingReports(),
        this.metricRepository.getVerificationSubmissions(),
        this.metricRepository.getCohortData()
      ]);

      const metrics = (metricsRes.status === 'fulfilled' && metricsRes.value.success) ? metricsRes.value.data : [];
      const categories = (categoriesRes.status === 'fulfilled' && categoriesRes.value.success) ? categoriesRes.value.data : [];
      const reports = (reportsRes.status === 'fulfilled' && reportsRes.value.success) ? reportsRes.value.data : [];
      const submissions = (submissionsRes.status === 'fulfilled' && submissionsRes.value.success) ? submissionsRes.value.data : [];
      const cohortData = (cohortsRes.status === 'fulfilled' && cohortsRes.value.success) ? cohortsRes.value.data : [];

      return ok({
        metrics,
        categories,
        reports,
        submissions,
        cohortData
      });
    } catch (error) {
      return fail(error as AppError);
    }
  }
}
