import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDependencies } from '../../../../core/di/DependencyProvider';
import { queryKeys } from '../../../../core/query/queryKeys';
import { unwrap } from '../../../../core/query/unwrap';
import { LIVE_REFETCH_MS } from '../flags';

export const useLiveActivity = () => {
  const { dependencies } = useDependencies();
  const [isPaused, setIsPaused] = useState(false);

  const query = useQuery({
    queryKey: queryKeys.live,
    queryFn: () => dependencies.liveActivityRepository.getSnapshot().then(unwrap),
    refetchInterval: isPaused ? false : LIVE_REFETCH_MS,
    refetchIntervalInBackground: false,
  });

  const togglePause = useCallback(() => setIsPaused((prev) => !prev), []);
  const data = query.data;

  return {
    summary: data?.summary ?? null,
    feedEvents: data?.feedEvents ?? [],
    busyZones: data?.busyZones ?? [],
    activeJobs: data?.activeJobs ?? [],
    craftsmen: data?.craftsmen ?? [],
    suspiciousAlerts: data?.suspiciousAlerts ?? [],
    loading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    dataUpdatedAt: query.dataUpdatedAt,
    isPaused,
    togglePause,
    refetch: query.refetch,
  };
};

export default useLiveActivity;
