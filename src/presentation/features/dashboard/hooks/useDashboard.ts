import { useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useDependencies } from '../../../../core/di/DependencyProvider';
import { Metric } from '../../../../domain/entities/Metric';
import { MetricMapper } from '../../../../data/mappers/MetricMapper';
import { ErrorToastMapper } from '../../../../core/errors/ErrorToastMapper';
import { useLanguage } from '../../../../presentation/context/LanguageContext';

export const useDashboard = () => {
  const { useCases } = useDependencies();
  const { getDashboardMetricsUseCase, freezeTaskUseCase, unfreezeTaskUseCase } = useCases;
  const queryClient = useQueryClient();
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

  const updateLocalMetricInCache = useCallback((id: string, value: number) => {
    queryClient.setQueryData(['dashboardData'], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        metrics: old.metrics.map((m: Metric) => {
          if (m.id !== id) return m;
          const newHistory = [...m.history, value].slice(-12);
          return {
            ...m,
            value,
            history: newHistory,
            status: MetricMapper.calculateStatus(m.nameKey, value)
          };
        })
      };
    });
  }, [queryClient]);

  // 2. Real-time Telemetry Simulator Interval
  useEffect(() => {
    const timer = setInterval(() => {
      if (metrics.length > 0 && !error) {
        const randomIndex = Math.floor(Math.random() * metrics.length);
        const target = metrics[randomIndex];
        let newValue = target.value;

        switch (target.id) {
          case 'users':
            newValue = Math.max(1000, target.value + (Math.floor(Math.random() * 21) - 10));
            break;
          case 'craftsmen':
            newValue = Math.max(100, target.value + (Math.floor(Math.random() * 5) - 2));
            break;
          case 'tasks':
            newValue = Math.max(10, target.value + (Math.floor(Math.random() * 5) - 2));
            break;
          case 'revenue':
            newValue = Math.max(10000, target.value + (Math.floor(Math.random() * 501) - 200));
            break;
          case 'emergency':
            newValue = Math.max(0, target.value + (Math.floor(Math.random() * 3) - 1));
            break;
          case 'verification':
            newValue = Math.max(0, target.value + (Math.floor(Math.random() * 3) - 1));
            break;
        }

        updateLocalMetricInCache(target.id, newValue);
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [metrics, error, updateLocalMetricInCache]);

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
