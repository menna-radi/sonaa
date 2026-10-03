import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useDependencies } from '../../../../core/di/DependencyProvider';
import { queryKeys } from '../../../../core/query/queryKeys';
import { unwrap } from '../../../../core/query/unwrap';
import { useAdminMutation } from '../../../../core/query/useAdminMutation';
import type { TaskFilter } from '../../../../domain/entities/Task';

const LIMIT = 20;
export const TASKS_PAGE_SIZE = LIMIT;

export const useTasks = (initialFilter: TaskFilter = 'all') => {
  const { dependencies } = useDependencies();
  const { taskRepository } = dependencies;
  const qc = useQueryClient();

  const [filter, setFilterState] = useState<TaskFilter>(initialFilter);
  const [page, setPage] = useState(1);
  const [search, setSearchState] = useState('');

  const query = useQuery({
    queryKey: queryKeys.tasks.list({ status: filter, page, search }),
    queryFn: () =>
      taskRepository.getTasks({ status: filter, q: search || undefined, page, limit: LIMIT }).then(unwrap),
    staleTime: 30000,
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
  });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: queryKeys.tasks.all });
    void qc.invalidateQueries({ queryKey: queryKeys.disputes.all });
    void qc.invalidateQueries({ queryKey: queryKeys.counts });
  };

  const setFilter = (next: TaskFilter) => {
    setFilterState(next);
    setPage(1);
  };

  const setSearch = (next: string) => {
    setSearchState(next);
    setPage(1);
  };

  const freezeMutation = useAdminMutation({
    mutationFn: (id: string) => taskRepository.freezeTask(id).then(unwrap),
    invalidate: [queryKeys.tasks.all, queryKeys.disputes.all, queryKeys.counts],
    successKey: 'toast_task_frozen',
  });
  const unfreezeMutation = useAdminMutation({
    mutationFn: (id: string) => taskRepository.unfreezeTask(id).then(unwrap),
    invalidate: [queryKeys.tasks.all, queryKeys.disputes.all, queryKeys.counts],
    successKey: 'toast_task_unfrozen',
  });
  const dispatchMutation = useAdminMutation({
    mutationFn: ({ id, craftsmanProfileId }: { id: string; craftsmanProfileId: string }) =>
      taskRepository.dispatchBackup(id, craftsmanProfileId).then(unwrap),
    invalidate: [queryKeys.tasks.all, queryKeys.disputes.all, queryKeys.counts],
    successKey: 'toast_backup_dispatched',
  });

  return {
    rows: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    counts: query.data?.counts,
    loading: query.isLoading,
    isFetching: query.isFetching,
    dataUpdatedAt: query.dataUpdatedAt,
    error: query.error,
    refetch: () => {
      invalidate();
      return query.refetch();
    },
    filter,
    setFilter,
    page,
    setPage,
    search,
    setSearch,
    mutations: {
      freeze: freezeMutation,
      unfreeze: unfreezeMutation,
      dispatchBackup: dispatchMutation,
    },
  };
};

export default useTasks;
