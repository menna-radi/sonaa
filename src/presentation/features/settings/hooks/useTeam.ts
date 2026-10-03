import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDependencies } from '../../../../core/di/DependencyProvider';
import { queryKeys } from '../../../../core/query/queryKeys';
import { unwrap } from '../../../../core/query/unwrap';
import { useAdminMutation } from '../../../../core/query/useAdminMutation';
import { useAuth } from '../../../context/AuthContext';
import type { InviteAdminInput, InviteAdminResult } from '../../../../domain/repositories/TeamRepository';

export const useTeam = () => {
  const { dependencies } = useDependencies();
  const { user } = useAuth();
  const result = useQuery({
    queryKey: queryKeys.team,
    queryFn: () => dependencies.teamRepository.list().then(unwrap),
    staleTime: 30000,
  });
  const members = useMemo(
    () => result.data?.map((m) => ({ ...m, isSelf: m.id === user?.id })) ?? null,
    [result.data, user?.id]
  );
  return {
    /** `null` = unsupported by the server (or not loaded yet, see `loading`). */
    members,
    unsupported: result.data === null,
    loading: result.isLoading,
    error: result.error,
    refetch: result.refetch,
  };
};

export const useInviteAdmin = (onSuccess?: (result: InviteAdminResult) => void) => {
  const { dependencies } = useDependencies();
  return useAdminMutation({
    mutationFn: (input: InviteAdminInput) => dependencies.teamRepository.invite(input).then(unwrap),
    invalidate: [queryKeys.team],
    successKey: 'team_toast_invited',
    onSuccess: (data) => onSuccess?.(data),
  });
};

export const useSetTeamMemberStatus = () => {
  const { dependencies } = useDependencies();
  return useAdminMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: 'ACTIVE' | 'SUSPENDED'; reason?: string }) =>
      dependencies.teamRepository.setStatus(id, status, reason).then(unwrap),
    invalidate: [queryKeys.team],
    successKey: 'team_toast_status_updated',
  });
};

export default useTeam;
