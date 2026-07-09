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

  // Simulate real-time streaming telemetry updates for visual excitement
  useEffect(() => {
    const timer = setInterval(() => {
      // Only simulate updates if we successfully have metrics and are NOT in error state
      if (metrics.length > 0 && !error) {
        // Pick a random metric to update
        const randomIndex = Math.floor(Math.random() * metrics.length);
        const target = metrics[randomIndex];
        
        let newValue = target.value;

        switch (target.id) {
          case 'cpu':
            newValue = Math.max(10, Math.min(98, target.value + (Math.floor(Math.random() * 21) - 10)));
            break;
          case 'memory':
            newValue = Math.max(50, Math.min(92, target.value + (Math.floor(Math.random() * 5) - 2)));
            break;
          case 'network':
            newValue = Math.max(80, Math.min(1000, target.value + (Math.floor(Math.random() * 101) - 50)));
            break;
          case 'users':
            newValue = Math.max(100, Math.min(2000, target.value + (Math.floor(Math.random() * 11) - 5)));
            break;
        }

        updateMetricValue(target.id, newValue);
      }
    }, 4000); // Trigger update every 4 seconds

    return () => clearInterval(timer);
  }, [metrics, error, updateMetricValue]);

  return {
    metrics,
    loading,
    error,
    refresh: () => loadMetrics(true),
    updateMetricValue
  };
};
export default useMetrics;
