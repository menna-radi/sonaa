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
      // Parallel loading of all statistics using repository contracts
      const [
        metricsRes,
        categoriesRes,
        reportsRes,
        submissionsRes,
        cohortsRes
      ] = await Promise.all([
        this.metricRepository.getMetrics(),
        this.metricRepository.getCategoryVolumes(),
        this.metricRepository.getPendingReports(),
        this.metricRepository.getVerificationSubmissions(),
        this.metricRepository.getCohortData()
      ]);

      if (!metricsRes.success) return fail(metricsRes.error);
      if (!categoriesRes.success) return fail(categoriesRes.error);
      if (!reportsRes.success) return fail(reportsRes.error);
      if (!submissionsRes.success) return fail(submissionsRes.error);
      if (!cohortsRes.success) return fail(cohortsRes.error);

      return ok({
        metrics: metricsRes.data,
        categories: categoriesRes.data,
        reports: reportsRes.data,
        submissions: submissionsRes.data,
        cohortData: cohortsRes.data
      });
    } catch (error) {
      return fail(error as AppError);
    }
  }
}
