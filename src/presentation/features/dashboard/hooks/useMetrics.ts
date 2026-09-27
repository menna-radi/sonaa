import { useState, useEffect, useCallback } from 'react';
import { Metric } from '../../../../domain/entities/Metric';
import { useDependencies } from '../../../../core/di/DependencyProvider';

export const useMetrics = () => {
  const { dependencies } = useDependencies();
  const { metricRepository } = dependencies;

  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadMetrics = useCallback(async (showLoadingOverlay = true) => {
    if (showLoadingOverlay) {
      setLoading(true);
    }
    setError(null);
    try {
      const data = await metricRepository.getMetrics();
      if (data.success) {
        setMetrics(data.data);
      } else {
        const errResult = data as { success: false; error: { message: string } };
        setError(errResult.error.message || 'Failed to fetch telemetry metrics.');
      }
    } catch (err: unknown) {
      console.error('Failed to load metrics:', err);
      const errMsg = err instanceof Error ? err.message : 'Failed to fetch telemetry metrics.';
      setError(errMsg);
    } finally {
      if (showLoadingOverlay) {
        setLoading(false);
      }
    }
  }, [metricRepository]);

  const updateMetricValue = useCallback(async (id: string, value: number) => {
    try {
      const updatedMetric = await metricRepository.updateMetric(id, value);
      if (updatedMetric.success) {
        setMetrics(prev => prev.map(m => m.id === id ? updatedMetric.data : m));
      } else {
        const errResult = updatedMetric as { success: false; error: { message: string } };
        setError(errResult.error.message || 'Failed to update metric value.');
      }
    } catch (err: unknown) {
      console.error(`Failed to update metric ID ${id}:`, err);
      const errMsg = err instanceof Error ? err.message : 'Failed to update metric value.';
      setError(errMsg);
    }
  }, [metricRepository]);

  // Reload metrics when dependency provider flips (e.g. mock mode to live API mode)
  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      if (active) {
        await loadMetrics(true);
      }
    };
    fetchData();
    return () => {
      active = false;
    };
  }, [loadMetrics]);

  // Periodic telemetry refresh adhering to polling budget (30s, off in background)
  useEffect(() => {
    const timer = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      loadMetrics(false);
    }, 30000);

    return () => clearInterval(timer);
  }, [loadMetrics]);

  return {
    metrics,
    loading,
    error,
    refresh: () => loadMetrics(true),
    updateMetricValue
  };
};
export default useMetrics;
