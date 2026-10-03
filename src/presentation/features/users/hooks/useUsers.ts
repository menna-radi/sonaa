import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useDependencies } from '../../../../core/di/DependencyProvider';
import { queryKeys } from '../../../../core/query/queryKeys';
import { unwrap } from '../../../../core/query/unwrap';
import { useAdminMutation } from '../../../../core/query/useAdminMutation';
import type { UserAccountStatus, UserRole } from '../../../../domain/entities/UserSummary';

export const USERS_PAGE_SIZE = 20;

export const useUsers = (q: { q: string; role: UserRole | 'ALL'; page: number }) => {
  const { dependencies } = useDependencies();
  const query = { q: q.q, role: q.role, page: q.page, limit: USERS_PAGE_SIZE };
  const result = useQuery({
    queryKey: queryKeys.users.list(query),
    queryFn: () => dependencies.userDirectoryRepository.getUsers(query).then(unwrap),
    staleTime: 30000,
    placeholderData: keepPreviousData,
  });
  const rows = result.data?.items ?? [];
  return {
    rows,
    total: result.data?.total ?? 0,
    hasStatus: rows.some((u) => u.status !== undefined),
    loading: result.isLoading,
    error: result.error,
    refetch: result.refetch,
  };
};

export const useSetUserStatus = () => {
  const { dependencies } = useDependencies();
  return useAdminMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: UserAccountStatus; reason?: string }) =>
      dependencies.userDirectoryRepository.setUserStatus(id, status, reason).then(unwrap),
    invalidate: [queryKeys.users.all],
    successKey: 'users_toast_status_updated',
  });
};

export default useUsers;
