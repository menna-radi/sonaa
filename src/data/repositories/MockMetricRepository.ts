import { Metric, MetricStatus } from '../../domain/entities/Metric';
import { MetricMapper } from '../mappers/MetricMapper';
import type { 
  MetricRepository, 
  CategoryVolume, 
  PendingReport, 
  VerificationSubmission, 
  CohortData 
} from '../../domain/repositories/MetricRepository';
import { Result, ok, fail } from '../../core/result/Result';
import { NotFoundError, AppError } from '../../core/errors/AppError';

export class MockMetricRepository implements MetricRepository {
  private metrics: Metric[] = [
    { id: 'users', nameKey: 'metrics_total_users', value: 48392, unit: '', status: 'normal', history: [45000, 46000, 47200, 48000, 48392] },
    { id: 'craftsmen', nameKey: 'metrics_active_craftsmen', value: 6847, unit: '', status: 'normal', history: [6000, 6200, 6400, 6700, 6847] },
    { id: 'tasks', nameKey: 'metrics_active_tasks', value: 1238, unit: '', status: 'normal', history: [1000, 1100, 1150, 1200, 1238] },
    { id: 'revenue', nameKey: 'metrics_revenue_mtd', value: 842308, unit: 'ILS', status: 'normal', history: [750000, 780000, 810000, 830000, 842308] },
    { id: 'emergency', nameKey: 'metrics_emergency_reqs', value: 47, unit: '', status: 'normal', history: [30, 42, 38, 45, 47] },
    { id: 'verification', nameKey: 'metrics_verification_reqs', value: 129, unit: '', status: 'normal', history: [120, 125, 122, 128, 129] }
  ];

  private categories: CategoryVolume[] = [
    { nameKey: 'cat_plumbing', tasksCount: 2843, percentage: 28, trendPercentage: 14 },
    { nameKey: 'cat_electrical', tasksCount: 2104, percentage: 22, trendPercentage: 9 },
    { nameKey: 'cat_ac_repair', tasksCount: 1612, percentage: 18, trendPercentage: 22 },
    { nameKey: 'cat_painting', tasksCount: 982, percentage: 15, trendPercentage: 6 },
    { nameKey: 'cat_cleaning', tasksCount: 821, percentage: 12, trendPercentage: 11 }
  ];

  private reports: PendingReport[] = [
    { id: '1', typeKey: 'report_service_dispute', details: 'Saad Al-Dawsari vs Mohammed Al-Zahrani', timeKey: 'time_14m' },
    { id: '2', typeKey: 'report_payment_issue', details: 'Mona Al-Harbi - Transaction #SN-8472', timeKey: 'time_42m' },
    { id: '3', typeKey: 'report_quality_concern', details: 'Lina Al-Qahtani vs Khalid Al-Qahtani', timeKey: 'time_1h' },
    { id: '4', typeKey: 'report_no_show', details: 'Faisal Al-Shamil - Job #SN-1102', timeKey: 'time_2h' },
    { id: '5', typeKey: 'report_inappropriate_conduct', details: 'Omar Al-Ghamdi - Chat #C-2814', timeKey: 'time_3h' }
  ];

  private verifications: VerificationSubmission[] = [
    { id: '1', name: 'Ahmad A.', roleKey: 'role_electrician', timeKey: 'time_8m', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80' },
    { id: '2', name: 'Yousef A.', roleKey: 'role_plumber', timeKey: 'time_21m', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80' },
    { id: '3', name: 'Saif Al.', roleKey: 'role_ac_tech', timeKey: 'time_34m', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&q=80' },
    { id: '4', name: 'Bandar K.', roleKey: 'role_carpenter', timeKey: 'time_52m', avatarUrl: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=80&q=80' },
    { id: '5', name: 'Hassan M.', roleKey: 'role_painter', timeKey: 'time_1h', avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=80&q=80' }
  ];

  private cohortData: CohortData[] = [
    { week: 'W1', users: 40, craftsmen: 20, tasks: 30 },
    { week: 'W2', users: 45, craftsmen: 22, tasks: 35 },
    { week: 'W3', users: 50, craftsmen: 24, tasks: 42 },
    { week: 'W4', users: 55, craftsmen: 28, tasks: 48 },
    { week: 'W5', users: 60, craftsmen: 30, tasks: 52 },
    { week: 'W6', users: 70, craftsmen: 35, tasks: 60 },
    { week: 'W7', users: 80, craftsmen: 42, tasks: 75 }
  ];

  public async getMetrics(): Promise<Result<Metric[]>> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const copied = this.metrics.map(m => ({
      ...m,
      history: [...m.history]
    }));
    return ok(copied);
  }

  public async updateMetric(id: string, value: number): Promise<Result<Metric>> {
    const index = this.metrics.findIndex(m => m.id === id);
    if (index === -1) {
      return fail(new NotFoundError(`Metric with ID ${id} not found.`));
    }

    const current = this.metrics[index];
    const newHistory = [...current.history, value].slice(-12);
    const updated: Metric = {
      ...current,
      value,
      history: newHistory,
      status: MetricMapper.calculateStatus(current.nameKey, value)
    };

    this.metrics[index] = updated;
    return ok(updated);
  }

  public async getCategoryVolumes(): Promise<Result<CategoryVolume[]>> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return ok([...this.categories]);
  }

  public async getPendingReports(): Promise<Result<PendingReport[]>> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return ok([...this.reports]);
  }

  public async getVerificationSubmissions(): Promise<Result<VerificationSubmission[]>> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return ok([...this.verifications]);
  }

  public async getCohortData(): Promise<Result<CohortData[]>> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return ok([...this.cohortData]);
  }
}
export default MockMetricRepository;
