import { useQuery } from '@tanstack/react-query';
import { useDependencies } from '../../../../core/di/DependencyProvider';
import { ErrorToastMapper } from '../../../../core/errors/ErrorToastMapper';
import { useLanguage } from '../../../../presentation/context/LanguageContext';

export const useDashboard = () => {
  const { useCases } = useDependencies();
  const { getDashboardMetricsUseCase } = useCases;
  const { language } = useLanguage();

  // 1. TanStack Query for Caching & SLA validation
  const { data, error, isLoading, refetch } = useQuery({
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

  const metrics = data?.metrics || [];
  const categories = data?.categories || [];
  const reports = data?.reports || [];
  const submissions = data?.submissions || [];
  const cohortData = data?.cohortData || [];

  return {
    metrics,
    categories,
    reports,
    submissions,
    cohortData,
    loading: isLoading,
    error: error instanceof Error ? error.message : null,
    refresh: refetch,
  };
};

export default useDashboard;
