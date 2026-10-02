import { useQuery } from '@tanstack/react-query';
import { useDependencies } from '../../../../core/di/DependencyProvider';
import { ErrorToastMapper } from '../../../../core/errors/ErrorToastMapper';
import { useLanguage } from '../../../../presentation/context/LanguageContext';
import type { PaymentSummary } from '../../../../domain/entities/Payment';

export const useDashboard = () => {
  const { useCases, repositories } = useDependencies();
  const { getDashboardMetricsUseCase } = useCases;
  const { language } = useLanguage();

  // 1. TanStack Query for Caching & SLA validation
  const { data, error, isLoading, isFetching, dataUpdatedAt, refetch } = useQuery({
    queryKey: ['dashboardData'],
    queryFn: async () => {
      const result = await getDashboardMetricsUseCase.execute();
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
        return res.success ? res.data : null;
      } catch {
        return null;
      }
    },
    staleTime: 60 * 1000,
  });

  const metrics = data?.metrics || [];
  const categories = data?.categories || [];
  const reports = data?.reports || [];
  const submissions = data?.submissions || [];
  const verificationTotal = data?.verificationTotal ?? submissions.length;
  const cohortData = data?.cohortData || [];
  const revenueAnalytics = data?.revenueAnalytics || null;

  return {
    metrics,
    categories,
    reports,
    submissions,
    verificationTotal,
    cohortData,
    revenueAnalytics,
    paymentSummary: summaryQuery.data ?? null,
    loading: isLoading,
    isFetching,
    dataUpdatedAt,
    error: error instanceof Error ? error.message : null,
    refresh: refetch,
  };
};

export default useDashboard;
