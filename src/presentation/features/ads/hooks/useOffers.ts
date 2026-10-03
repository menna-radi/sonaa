import { useQuery } from '@tanstack/react-query';
import { useDependencies } from '../../../../core/di/DependencyProvider';
import { queryKeys } from '../../../../core/query/queryKeys';
import { unwrap } from '../../../../core/query/unwrap';
import { useAdminMutation } from '../../../../core/query/useAdminMutation';
import type { OfferInput } from '../../../../domain/entities/Offer';

export const useOffers = (opts?: { enabled?: boolean }) => {
  const { repositories } = useDependencies();
  return useQuery({
    queryKey: queryKeys.offers.list,
    queryFn: () => repositories.offerRepository.list().then(unwrap),
    staleTime: 30000,
    refetchInterval: 60000,
    refetchIntervalInBackground: false,
    enabled: opts?.enabled ?? true,
  });
};

const INVALIDATE = [queryKeys.offers.all, queryKeys.ads.all] as const;

export const useCreateOffer = () => {
  const { repositories } = useDependencies();
  return useAdminMutation({
    mutationFn: (input: OfferInput) => repositories.offerRepository.create(input).then(unwrap),
    invalidate: [...INVALIDATE],
    successKey: 'toast_offer_saved',
  });
};

export const useUpdateOffer = () => {
  const { repositories } = useDependencies();
  return useAdminMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<OfferInput> }) =>
      repositories.offerRepository.update(id, patch).then(unwrap),
    invalidate: [...INVALIDATE],
    successKey: 'toast_offer_saved',
  });
};

export const useToggleOffer = () => {
  const { repositories } = useDependencies();
  return useAdminMutation({
    mutationFn: (id: string) => repositories.offerRepository.toggle(id).then(unwrap),
    invalidate: [...INVALIDATE],
    successKey: 'toast_offer_toggled',
  });
};

export const useDeleteOffer = () => {
  const { repositories } = useDependencies();
  return useAdminMutation({
    mutationFn: (id: string) => repositories.offerRepository.remove(id).then(unwrap),
    invalidate: [...INVALIDATE],
    successKey: 'toast_offer_deleted',
  });
};
