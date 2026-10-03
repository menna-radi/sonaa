import { useQuery } from '@tanstack/react-query';
import { useDependencies } from '../../../../core/di/DependencyProvider';
import { queryKeys } from '../../../../core/query/queryKeys';
import { unwrap } from '../../../../core/query/unwrap';
import { useAdminMutation } from '../../../../core/query/useAdminMutation';
import { apiClient } from '../../../../core/network/apiClient';
import { API_ENDPOINTS } from '../../../../core/config/apiEndpoints';
import type { Audience, BroadcastInput } from '../../../../domain/repositories/BroadcastRepository';

export type { CampaignRecord } from '../../../../domain/repositories/BroadcastRepository';

export interface BroadcastDraft {
  title: string;
  body: string;
  audience: Audience;
  targetCity: string;
  imageUrl: string;
  deepLink: string;
  schedule: 'now' | 'later';
  /** `datetime-local` value (local time, no zone). */
  scheduledAt: string;
}

export const EMPTY_DRAFT: BroadcastDraft = {
  title: '',
  body: '',
  audience: 'ALL',
  targetCity: '',
  imageUrl: '',
  deepLink: '',
  schedule: 'now',
  scheduledAt: '',
};

export const useBroadcasts = () => {
  const { dependencies } = useDependencies();
  return useQuery({
    queryKey: queryKeys.broadcasts.list({}),
    queryFn: () => dependencies.broadcastRepository.getBroadcasts().then(unwrap),
    staleTime: 30000,
  });
};

export const useSendBroadcast = () => {
  const { dependencies } = useDependencies();
  return useAdminMutation({
    mutationFn: (input: BroadcastInput) => dependencies.broadcastRepository.sendBroadcast(input).then(unwrap),
    invalidate: [queryKeys.broadcasts.all],
  });
};

export const useDeleteBroadcast = () => {
  const { dependencies } = useDependencies();
  return useAdminMutation({
    mutationFn: (id: string) => dependencies.broadcastRepository.deleteBroadcast(id).then(unwrap),
    invalidate: [queryKeys.broadcasts.all],
    successKey: 'broadcast_toast_deleted',
  });
};

type UserRole = 'CUSTOMER' | 'CRAFTSMAN';

const countUsers = async (role: UserRole): Promise<number> => {
  const response = await apiClient.get<{ total?: number } | unknown[]>(API_ENDPOINTS.admin.users, { role, limit: 1 });
  if (Array.isArray(response)) throw new Error('total unavailable');
  if (typeof response.total !== 'number') throw new Error('total unavailable');
  return response.total;
};

/** Approximate audience size from the user directory; `data` stays undefined when it cannot be determined. */
export const useRecipientsEstimate = (audience: Audience) =>
  useQuery({
    queryKey: queryKeys.broadcasts.list({ estimate: audience }),
    queryFn: async () => {
      if (audience === 'CUSTOMERS') return countUsers('CUSTOMER');
      if (audience === 'CRAFTSMEN') return countUsers('CRAFTSMAN');
      const [customers, craftsmen] = await Promise.all([countUsers('CUSTOMER'), countUsers('CRAFTSMAN')]);
      return customers + craftsmen;
    },
    staleTime: 60000,
    retry: false,
  });
