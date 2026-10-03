import { useQuery } from '@tanstack/react-query';
import { useDependencies } from '../../../../core/di/DependencyProvider';
import { queryKeys } from '../../../../core/query/queryKeys';
import { unwrap } from '../../../../core/query/unwrap';
import { useAdminMutation } from '../../../../core/query/useAdminMutation';
import type { DisputeResolution, DisputeStatus } from '../../../../domain/entities/Dispute';

const LIMIT = 20;
export const DISPUTES_PAGE_SIZE = LIMIT;

export const useDisputes = (
  q: { status: DisputeStatus | 'ALL'; page?: number; limit?: number } = { status: 'PENDING', page: 1, limit: LIMIT }
) => {
  const { dependencies } = useDependencies();
  const page = q.page ?? 1;
  const limit = q.limit ?? LIMIT;
  const query = useQuery({
    queryKey: queryKeys.disputes.list({ status: q.status, page, limit }),
    queryFn: () =>
      dependencies.disputeRepository.getDisputes({ status: q.status, page, limit }).then(unwrap),
    staleTime: 30000,
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
  });

  return {
    rows: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    counts: query.data?.counts,
    loading: query.isLoading,
    isFetching: query.isFetching,
    dataUpdatedAt: query.dataUpdatedAt,
    error: query.error,
    refetch: query.refetch,
  };
};

export const useResolveDispute = () => {
  const { dependencies } = useDependencies();
  return useAdminMutation({
    mutationFn: ({ id, resolution, notes }: { id: string; resolution: DisputeResolution; notes?: string }) =>
      dependencies.disputeRepository.resolveDispute(id, resolution, notes).then(unwrap),
    invalidate: [queryKeys.disputes.all, queryKeys.tasks.all, queryKeys.dashboard.all],
    successKey: 'toast_dispute_resolved',
  });
};

export default useDisputes;
