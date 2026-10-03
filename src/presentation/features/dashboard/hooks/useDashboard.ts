import { useQuery } from '@tanstack/react-query';
import { useDependencies } from '../../../../core/di/DependencyProvider';
import { ErrorToastMapper } from '../../../../core/errors/ErrorToastMapper';
import { useLanguage } from '../../../../presentation/context/LanguageContext';
import { queryKeys } from '../../../../core/query/queryKeys';
import { unwrap } from '../../../../core/query/unwrap';
import type { PaymentSummary } from '../../../../domain/entities/Payment';
import type { DashboardRange } from '../../../../domain/repositories/MetricRepository';

const DELTA_METRIC_IDS = ['users', 'tasks', 'revenue'] as const;

export const useDashboard = (range: DashboardRange = '30d') => {
  const { useCases, repositories } = useDependencies();
  const { getDashboardMetricsUseCase } = useCases;
  const { language } = useLanguage();

  // 1. TanStack Query for Caching & SLA validation
  const { data, error, isLoading, isFetching, dataUpdatedAt, refetch } = useQuery({
    queryKey: queryKeys.dashboard.overview(range),
    queryFn: async () => {
      const result = await getDashboardMetricsUseCase.execute(range);
      if (!result.success) {
        throw new Error(ErrorToastMapper.toMessage(result.error, language));
      }
      return result.data;
    },
    staleTime: 60 * 1000, // 1 minute stale time
  });

  // Payment summary for the revenue header (failure ⇒ null, never an error).
  const summaryQuery = useQuery({
    queryKey: ['dashboard', 'paymentSummary'],
    queryFn: async (): Promise<PaymentSummary | null> => {
      try {
        const res = await repositories.paymentRepository.getPaymentSummary();
        return unwrap(res);
      } catch {
        return null;
      }
    },
    staleTime: 60 * 1000,
  });

  const deltas = data?.revenueAnalytics?.deltas ?? null;
  const metrics = (data?.metrics || []).map((m) => {
    if ((DELTA_METRIC_IDS as readonly string[]).includes(m.id)) {
      const d = deltas?.[m.id as 'users' | 'tasks' | 'revenue'] ?? null;
      return { ...m, delta: d };
    }
    return m;
  });

  return {
    metrics,
    categories: data?.categories || [],
    reports: data?.reports || [],
    submissions: data?.submissions || [],
    verificationTotal: data?.verificationTotal ?? data?.submissions.length ?? 0,
    cohortData: data?.cohortData || [],
    revenueAnalytics: data?.revenueAnalytics || null,
    paymentSummary: summaryQuery.data ?? null,
    loading: isLoading,
    isFetching,
    dataUpdatedAt,
    error: error instanceof Error ? error.message : null,
    refresh: refetch,
  };
};

export default useDashboard;
