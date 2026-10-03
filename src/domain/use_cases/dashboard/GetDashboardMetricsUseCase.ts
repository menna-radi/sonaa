import { MetricRepository, CategoryVolume, PendingReport, VerificationSubmission, CohortData, RevenueAnalytics, DashboardRange } from '../../repositories/MetricRepository';
import { Metric } from '../../entities/Metric';
import { Result, ok, fail } from '../../../core/result/Result';
import { AppError } from '../../../core/errors/AppError';

export interface DashboardDataSnapshot {
  metrics: Metric[];
  categories: CategoryVolume[];
  reports: PendingReport[];
  submissions: VerificationSubmission[];
  /** Full verification queue size (may exceed the previewed submissions). */
  verificationTotal: number;
  cohortData: CohortData[];
  revenueAnalytics: RevenueAnalytics | null;
}

export class GetDashboardMetricsUseCase {
  constructor(private readonly metricRepository: MetricRepository) {}

  public async execute(range?: DashboardRange): Promise<Result<DashboardDataSnapshot>> {
    try {
      // Parallel resilient loading of all statistics using repository contracts
      const [
        metricsRes,
        categoriesRes,
        reportsRes,
        submissionsRes,
        cohortsRes,
        revenueRes
      ] = await Promise.allSettled([
        this.metricRepository.getMetrics(),
        this.metricRepository.getCategoryVolumes(),
        this.metricRepository.getPendingReports(),
        this.metricRepository.getVerificationSubmissions(),
        this.metricRepository.getCohortData(),
        this.metricRepository.getRevenueAnalytics(range)
      ]);

      const metrics = (metricsRes.status === 'fulfilled' && metricsRes.value.success) ? metricsRes.value.data : [];
      const categories = (categoriesRes.status === 'fulfilled' && categoriesRes.value.success) ? categoriesRes.value.data : [];
      const reports = (reportsRes.status === 'fulfilled' && reportsRes.value.success) ? reportsRes.value.data : [];
      const submissionsPayload = (submissionsRes.status === 'fulfilled' && submissionsRes.value.success) ? submissionsRes.value.data : null;
      const submissions = submissionsPayload?.submissions || [];
      const verificationTotal = submissionsPayload?.total ?? submissions.length;
      const cohortData = (cohortsRes.status === 'fulfilled' && cohortsRes.value.success) ? cohortsRes.value.data : [];
      const revenueAnalytics = (revenueRes.status === 'fulfilled' && revenueRes.value.success) ? revenueRes.value.data : null;

      return ok({
        metrics,
        categories,
        reports,
        submissions,
        verificationTotal,
        cohortData,
        revenueAnalytics
      });
    } catch (error) {
      return fail(error as AppError);
    }
  }
}
