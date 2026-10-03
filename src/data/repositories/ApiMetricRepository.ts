import {
  MetricRepository,
  CategoryVolume,
  PendingReport,
  VerificationSubmission,
  VerificationSubmissions,
  CohortData,
  RevenueAnalytics,
  DashboardRange,
  OverviewBilling,
} from '../../domain/repositories/MetricRepository';
import { Metric } from '../../domain/entities/Metric';
import { Result, ok, fail } from '../../core/result/Result';
import { apiClient } from '../../core/network/apiClient';
import { API_ENDPOINTS } from '../../core/config/apiEndpoints';
import { AppError, UnknownError } from '../../core/errors/AppError';

interface RawMetrics {
  totalUsers?: number;
  activeCraftsmen?: number;
  onlineCraftsmenCount?: number;
  activeTasks?: number;
  revenueMtd?: number;
  emergencyReqs?: number;
  verificationReqs?: number;
}

interface RawCategory {
  category?: string;
  count?: number;
}

interface RawDispute {
  id?: string;
  title?: string;
  subtitle?: string;
  timeLabel?: string;
  createdAt?: string;
}

interface RawSubmission {
  id?: string;
  craftsmanProfile?: {
    firstName?: string;
    lastName?: string;
    title?: string;
    avatarUrl?: string;
  } | null;
  submittedAt?: string;
  createdAt?: string;
}

interface RawOverview {
  metrics?: RawMetrics;
  categories?: RawCategory[];
  disputes?: RawDispute[];
}

interface RawQueue {
  submissions?: RawSubmission[];
  queueCount?: number;
}

interface RawChartPoint {
  date?: string;
  revenue?: number;
}

interface RawBilling {
  pendingReceipts?: number;
  pendingCommissionPayments?: number;
  commissionDueTotal?: number;
  lockedCraftsmen?: number;
  activeSubscribers?: number;
  pendingWithdrawals?: number;
}

interface RawAnalytics {
  range?: string;
  gmv?: number;
  takeRate?: number;
  avgOrderValue?: number;
  disputeRate?: number;
  chartData?: RawChartPoint[];
  deltas?: { users?: number | null; tasks?: number | null; revenue?: number | null } | null;
}

const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
const str = (v: unknown): string | undefined => (typeof v === 'string' ? v : undefined);

export class ApiMetricRepository implements MetricRepository {
  public async getMetrics(): Promise<Result<Metric[]>> {
    try {
      const response = await apiClient.get<RawOverview>(API_ENDPOINTS.admin.overviewStats);
      const m = response.metrics || {};
      const metrics: Metric[] = [
        { id: 'users', nameKey: 'metrics_total_users', value: num(m.totalUsers), unit: '', status: 'normal', history: [] },
        {
          id: 'craftsmen',
          nameKey: 'metrics_active_craftsmen',
          value: num(m.activeCraftsmen),
          unit: '',
          status: 'normal',
          history: [],
          onlineCount: num(m.onlineCraftsmenCount),
        },
        { id: 'tasks', nameKey: 'metrics_active_tasks', value: num(m.activeTasks), unit: '', status: 'normal', history: [] },
        { id: 'revenue', nameKey: 'metrics_revenue_mtd', value: num(m.revenueMtd), unit: 'ILS', status: 'normal', history: [] },
        { id: 'emergency', nameKey: 'metrics_emergency_reqs', value: num(m.emergencyReqs), unit: '', status: 'normal', history: [] },
        {
          id: 'verification',
          nameKey: 'metrics_verification_reqs',
          value: num(m.verificationReqs),
          unit: '',
          status: 'normal',
          history: [],
        },
      ];
      return ok(metrics);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async updateMetric(): Promise<Result<Metric>> {
    return fail(new UnknownError('Update metric endpoint not supported by backend.'));
  }

  public async getCategoryVolumes(): Promise<Result<CategoryVolume[]>> {
    try {
      const response = await apiClient.get<RawOverview>(API_ENDPOINTS.admin.overviewStats);
      const categoriesList = response.categories || [];
      const totalCount = categoriesList.reduce((sum, c) => sum + num(c.count), 0) || 1;
      const volumes: CategoryVolume[] = categoriesList.map((c) => ({
        nameKey: `cat_${(c.category || '').toLowerCase()}`,
        tasksCount: num(c.count),
        percentage: Math.round((num(c.count) / totalCount) * 100),
      }));
      return ok(volumes);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async getPendingReports(): Promise<Result<PendingReport[]>> {
    try {
      const response = await apiClient.get<RawOverview>(API_ENDPOINTS.admin.overviewStats);
      const reports: PendingReport[] = (response.disputes || []).map((d, i) => ({
        id: d.id ?? `dispute-${i}`,
        typeKey: 'report_service_dispute',
        details: d.subtitle ?? '',
        timeKey: d.timeLabel && d.timeLabel !== 'Recent' ? d.timeLabel : 'time_recent',
        title: str(d.title),
        subtitle: str(d.subtitle),
        createdAt: str(d.createdAt),
      }));
      return ok(reports);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async getVerificationSubmissions(): Promise<Result<VerificationSubmissions>> {
    try {
      const response = await apiClient.get<RawQueue>(API_ENDPOINTS.admin.verificationQueue);
      const mapped: VerificationSubmission[] = (response.submissions || []).slice(0, 5).map((r, i) => {
        const first = r.craftsmanProfile?.firstName ?? '';
        const last = r.craftsmanProfile?.lastName ?? '';
        const name = `${first} ${last}`.trim() || 'Unknown';
        const role = r.craftsmanProfile?.title || 'Craftsman';
        return {
          id: r.id ?? `submission-${i}`,
          name,
          roleKey: `role_${role.toLowerCase().replace(/[^a-z]/g, '_')}`,
          timeKey: 'time_recent',
          avatarUrl: r.craftsmanProfile?.avatarUrl || undefined,
          submittedAt: r.submittedAt || r.createdAt || undefined,
        };
      });
      return ok({
        submissions: mapped,
        total: typeof response.queueCount === 'number' ? response.queueCount : mapped.length,
      });
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async getCohortData(): Promise<Result<CohortData[]>> {
    try {
      const response = await apiClient.get<CohortData[]>('/admin/metrics/cohort');
      return ok(response);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async getRevenueAnalytics(range?: DashboardRange): Promise<Result<RevenueAnalytics>> {
    try {
      const url = range ? `${API_ENDPOINTS.admin.overviewStats}?range=${range}` : API_ENDPOINTS.admin.overviewStats;
      const response = await apiClient.get<{ analytics?: RawAnalytics; billing?: RawBilling; pendingDisputesCount?: number }>(url);
      const a = response.analytics || {};
      const series = Array.isArray(a.chartData)
        ? a.chartData.map((p) => {
            const rawDate = String(p.date || '');
            // ISO dates (B09) parse to Date; legacy labels print as-is.
            const date = /^\d{4}-\d{2}-\d{2}/.test(rawDate) ? new Date(rawDate).toISOString().slice(0, 10) : rawDate;
            return { date, revenue: num(p.revenue) };
          })
        : [];
      const b = response.billing;
      const billing: OverviewBilling | null = b
        ? {
            pendingReceipts: num(b.pendingReceipts),
            pendingCommissionPayments: num(b.pendingCommissionPayments),
            commissionDueTotal: num(b.commissionDueTotal),
            lockedCraftsmen: num(b.lockedCraftsmen),
            activeSubscribers: num(b.activeSubscribers),
            pendingWithdrawals: num(b.pendingWithdrawals),
          }
        : null;
      return ok({
        gmv: num(a.gmv),
        takeRate: num(a.takeRate),
        avgOrderValue: num(a.avgOrderValue),
        disputeRate: num(a.disputeRate),
        series,
        range: typeof a.range === 'string' ? a.range : undefined,
        deltas: a.deltas
          ? {
              users: a.deltas.users ?? null,
              tasks: a.deltas.tasks ?? null,
              revenue: a.deltas.revenue ?? null,
            }
          : undefined,
        billing,
        pendingDisputesCount: typeof response.pendingDisputesCount === 'number' ? response.pendingDisputesCount : undefined,
      });
    } catch (error) {
      return fail(error as AppError);
    }
  }
}
export default ApiMetricRepository;
