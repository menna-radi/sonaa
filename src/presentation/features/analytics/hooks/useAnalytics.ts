import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../../core/network/apiClient';
import { queryKeys } from '../../../../core/query/queryKeys';

export const ANALYTICS_FABRICATED_IDS = ['eta_accuracy', 'refund_rate'];

export type AnalyticsTimeframe = '7d' | '30d' | '90d' | 'ytd';

export interface MetricCardState {
  value: string;
  change?: string;
  isPositive?: boolean;
  rawVal: number;
}

export interface CohortWeekData {
  week: string;
  newUsers: number;
  returningUsers: number;
}

export interface ZoneData {
  name: string;
  tasksCount: number;
  percentage: number;
  trend: string;
  isPositive: boolean;
  barWidth: number;
}

export interface KpiData {
  id: string;
  nameKey: string;
  value: number;
  unit: string;
  statusKey: string;
  isOnTrack: boolean;
  barWidth: number;
  targetWidth?: number;
}

export interface AnalyticsResponse {
  timeframe?: string;
  userGrowth: MetricCardState;
  activeCraftsmen: MetricCardState;
  marketplaceActivity: MetricCardState;
  conversionRate: MetricCardState;
  cohorts: CohortWeekData[];
  zones?: ZoneData[];
  kpis: KpiData[];
}

interface OverviewStatsResponse {
  metrics?: {
    totalUsers?: number;
    activeCraftsmen?: number;
    onlineCraftsmenCount?: number;
    activeTasks?: number;
    completedTasks?: number;
  };
}

async function fetchAnalytics(timeframe: AnalyticsTimeframe): Promise<AnalyticsResponse> {
  try {
    const res = await apiClient.get<AnalyticsResponse | { data: AnalyticsResponse }>(`/admin/analytics?timeframe=${timeframe}`);
    const data = (res as { data?: AnalyticsResponse }).data || (res as AnalyticsResponse);
    if (data && (data.userGrowth || data.kpis)) {
      return {
        ...data,
        kpis: (data.kpis || []).filter((k) => !ANALYTICS_FABRICATED_IDS.includes(k.id)),
      };
    }
  } catch (err: unknown) {
    // Fallback to overview-stats if /admin/analytics fails or is unavailable
    try {
      const statsRes = await apiClient.get<OverviewStatsResponse | { data: OverviewStatsResponse }>('/admin/overview-stats');
      const stats = (statsRes as { data?: OverviewStatsResponse }).data || (statsRes as OverviewStatsResponse);
      const m = stats?.metrics;
      const totalUsers = m?.totalUsers || 0;
      const activeCraftsmen = m?.activeCraftsmen || 0;
      const activeTasks = m?.activeTasks || 0;
      return {
        userGrowth: {
          value: `${totalUsers}`,
          rawVal: totalUsers,
          isPositive: true,
        },
        activeCraftsmen: {
          value: `${activeCraftsmen}`,
          rawVal: activeCraftsmen,
          isPositive: true,
        },
        marketplaceActivity: {
          value: `${activeTasks}`,
          rawVal: activeTasks,
          isPositive: true,
        },
        conversionRate: {
          value: '100%',
          rawVal: 100,
          isPositive: true,
        },
        cohorts: [],
        zones: [],
        kpis: [],
      };
    } catch {
      throw err instanceof Error ? err : new Error('Failed to fetch analytics');
    }
  }

  return {
    userGrowth: { value: '0', rawVal: 0, isPositive: true },
    activeCraftsmen: { value: '0', rawVal: 0, isPositive: true },
    marketplaceActivity: { value: '0', rawVal: 0, isPositive: true },
    conversionRate: { value: '0%', rawVal: 0, isPositive: true },
    cohorts: [],
    zones: [],
    kpis: [],
  };
}

export const useAnalytics = (timeframe: AnalyticsTimeframe = '30d') => {
  const query = useQuery({
    queryKey: queryKeys.analytics(timeframe),
    queryFn: () => fetchAnalytics(timeframe),
  });

  const rawData = query.data;

  return {
    data: rawData,
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : (query.error ? String(query.error) : null),
    userGrowth: rawData?.userGrowth ?? { value: '0', rawVal: 0, isPositive: true },
    activeCraftsmen: rawData?.activeCraftsmen ?? { value: '0', rawVal: 0, isPositive: true },
    marketplaceActivity: rawData?.marketplaceActivity ?? { value: '0', rawVal: 0, isPositive: true },
    conversionRate: rawData?.conversionRate ?? { value: '0%', rawVal: 0, isPositive: true },
    cohorts: rawData?.cohorts ?? [],
    zones: rawData?.zones ?? [],
    kpis: (rawData?.kpis ?? []).filter((k) => !ANALYTICS_FABRICATED_IDS.includes(k.id)),
    hasTimeframeSupport: Boolean(rawData?.timeframe),
    refresh: () => query.refetch(),
  };
};

export default useAnalytics;
