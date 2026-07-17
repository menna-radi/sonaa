import { MetricRepository, CategoryVolume, PendingReport, VerificationSubmission, CohortData } from '../../domain/repositories/MetricRepository';
import { Metric } from '../../domain/entities/Metric';
import { Result, ok, fail } from '../../core/result/Result';
import { apiClient } from '../../core/network/apiClient';
import { API_ENDPOINTS } from '../../core/config/apiEndpoints';
import { AppError, UnknownError } from '../../core/errors/AppError';

export class ApiMetricRepository implements MetricRepository {
  public async getMetrics(): Promise<Result<Metric[]>> {
    try {
      const response = await apiClient.get<any>(API_ENDPOINTS.admin.overviewStats);
      const m = response.metrics || {};
      const metrics: Metric[] = [
        { id: 'users', nameKey: 'metrics_total_users', value: m.totalUsers || 0, unit: '', status: 'normal', history: [] },
        { id: 'craftsmen', nameKey: 'metrics_active_craftsmen', value: m.activeCraftsmen || 0, unit: '', status: 'normal', history: [] },
        { id: 'tasks', nameKey: 'metrics_active_tasks', value: m.activeTasks || 0, unit: '', status: 'normal', history: [] },
        { id: 'revenue', nameKey: 'metrics_revenue_mtd', value: m.revenueMtd || 0, unit: 'SAR', status: 'normal', history: [] },
        { id: 'emergency', nameKey: 'metrics_emergency_reqs', value: m.emergencyReqs || 0, unit: '', status: 'normal', history: [] },
        { id: 'verification', nameKey: 'metrics_verification_reqs', value: m.verificationReqs || 0, unit: '', status: 'normal', history: [] }
      ];
      return ok(metrics);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async updateMetric(_id: string, _value: number): Promise<Result<Metric>> {
    return fail(new UnknownError('Update metric endpoint not supported by backend.'));
  }

  public async getCategoryVolumes(): Promise<Result<CategoryVolume[]>> {
    try {
      const response = await apiClient.get<any>(API_ENDPOINTS.admin.overviewStats);
      const categoriesList = response.categories || [];
      const totalCount = categoriesList.reduce((sum: number, c: any) => sum + (c.count || 0), 0) || 1;
      const volumes: CategoryVolume[] = categoriesList.map((c: any) => ({
        nameKey: `cat_${c.category.toLowerCase()}`,
        tasksCount: c.count || 0,
        percentage: Math.round(((c.count || 0) / totalCount) * 100),
        trendPercentage: 0
      }));
      return ok(volumes);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async getPendingReports(): Promise<Result<PendingReport[]>> {
    try {
      const response = await apiClient.get<any>(API_ENDPOINTS.admin.overviewStats);
      const reports: PendingReport[] = (response.disputes || []).map((d: any) => ({
        id: d.id,
        typeKey: 'report_service_dispute',
        details: d.subtitle,
        timeKey: d.timeLabel || 'Recent'
      }));
      return ok(reports);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async getVerificationSubmissions(): Promise<Result<VerificationSubmission[]>> {
    try {
      const response = await apiClient.get<any>(API_ENDPOINTS.admin.verificationQueue);
      const mapped: VerificationSubmission[] = (response.submissions || []).slice(0, 5).map((r: any) => {
        const name = r.craftsmanProfile ? `${r.craftsmanProfile.firstName} ${r.craftsmanProfile.lastName}` : 'Unknown';
        const role = r.craftsmanProfile?.title || 'Craftsman';
        return {
          id: r.id,
          name,
          roleKey: `role_${role.toLowerCase().replace(/[^a-z]/g, '_')}`,
          timeKey: 'Recent',
          avatarUrl: r.craftsmanProfile?.avatarUrl || undefined,
        };
      });
      return ok(mapped);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async getCohortData(): Promise<Result<CohortData[]>> {
    const mockCohort: CohortData[] = [
      { week: 'W1', users: 40, craftsmen: 20, tasks: 30 },
      { week: 'W2', users: 45, craftsmen: 22, tasks: 35 },
      { week: 'W3', users: 50, craftsmen: 24, tasks: 42 },
      { week: 'W4', users: 55, craftsmen: 28, tasks: 48 },
      { week: 'W5', users: 60, craftsmen: 30, tasks: 52 },
      { week: 'W6', users: 70, craftsmen: 35, tasks: 60 },
      { week: 'W7', users: 80, craftsmen: 42, tasks: 75 }
    ];
    return ok(mockCohort);
  }
}
export default ApiMetricRepository;

