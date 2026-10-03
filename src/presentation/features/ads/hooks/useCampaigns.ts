import { useQuery } from '@tanstack/react-query';
import { useDependencies } from '../../../../core/di/DependencyProvider';
import { queryKeys } from '../../../../core/query/queryKeys';
import { unwrap } from '../../../../core/query/unwrap';
import { useAdminMutation } from '../../../../core/query/useAdminMutation';
import type { AdRepository, Campaign } from '../../../../domain/repositories/AdRepository';

export type CampaignStatusUpdate = 'Active' | 'Paused' | 'Ended';

export const useCampaigns = (opts?: { enabled?: boolean }) => {
  const { repositories } = useDependencies();
  return useQuery({
    queryKey: queryKeys.ads.list,
    queryFn: () => repositories.adRepository.getAds().then(unwrap),
    staleTime: 30000,
    refetchInterval: 60000,
    refetchIntervalInBackground: false,
    enabled: opts?.enabled ?? true,
  });
};

const INVALIDATE = [queryKeys.ads.all, queryKeys.offers.all] as const;

export const useUpdateCampaignStatus = () => {
  const { repositories } = useDependencies();
  return useAdminMutation({
    mutationFn: ({ id, status }: { id: string; status: CampaignStatusUpdate }) =>
      repositories.adRepository.updateAdStatus(id, status).then(unwrap),
    invalidate: [...INVALIDATE],
    successKey: 'toast_campaign_saved',
  });
};

export const useUpdateCampaign = () => {
  const { repositories } = useDependencies();
  return useAdminMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<AdRepository['updateAd']>[1] }) =>
      repositories.adRepository.updateAd(id, data).then(unwrap),
    invalidate: [...INVALIDATE],
    successKey: 'toast_campaign_saved',
  });
};

export const useDeleteCampaign = () => {
  const { repositories } = useDependencies();
  return useAdminMutation({
    mutationFn: (id: string) => repositories.adRepository.deleteAd(id).then(unwrap),
    invalidate: [...INVALIDATE],
    successKey: 'toast_campaign_deleted',
  });
};

export type { Campaign };
