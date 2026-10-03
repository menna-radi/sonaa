import { useQuery } from '@tanstack/react-query';
import { useDependencies } from '../../../../core/di/DependencyProvider';
import { queryKeys } from '../../../../core/query/queryKeys';
import { unwrap } from '../../../../core/query/unwrap';
import type * as B from '../../../../domain/entities/Billing';

const POLL = 30000;

interface ListOpts {
  enabled?: boolean;
}

const listOpts = (o?: ListOpts) => ({
  enabled: o?.enabled ?? true,
  refetchInterval: POLL,
  refetchIntervalInBackground: false as const,
});

export const useBillingSummary = () => {
  const { repositories } = useDependencies();
  const repo = repositories.billingRepository;
  const summaryQ = useQuery({
    queryKey: queryKeys.billing.summary,
    queryFn: () => repo.getSummary().then(unwrap),
    staleTime: POLL,
  });
  const pending = summaryQ.data === null || summaryQ.data === undefined;
  const reqQ = useRequests({ status: 'PENDING_VERIFICATION', page: 1, limit: 1 }, { enabled: pending });
  const payQ = useCommissionPayments({ status: 'PENDING', page: 1, limit: 1 }, { enabled: pending });
  const lockQ = useSubscribers({ filter: 'locked', page: 1, limit: 1 }, { enabled: pending });

  if (summaryQ.data) {
    return { ...summaryQ.data, commissionDueTotal: summaryQ.data.commissionDueTotal as number | null, loading: false };
  }
  return {
    pendingReceipts: reqQ.data?.total ?? 0,
    pendingCommissionPayments: payQ.data?.total ?? 0,
    lockedCraftsmen: lockQ.data?.total ?? 0,
    commissionDueTotal: null as number | null,
    loading: summaryQ.isLoading || reqQ.isLoading || payQ.isLoading || lockQ.isLoading,
  };
};

export const usePlans = (o?: ListOpts) => {
  const { repositories } = useDependencies();
  return useQuery({
    queryKey: queryKeys.billing.plans,
    queryFn: () => repositories.billingRepository.getPlans().then(unwrap),
    staleTime: POLL,
    ...listOpts(o),
  });
};

export const useRequests = (q: B.ListQuery & { status: B.SubscriptionRequestStatus | 'ALL' }, o?: ListOpts) => {
  const { repositories } = useDependencies();
  return useQuery({
    queryKey: queryKeys.billing.requests(q),
    queryFn: () => repositories.billingRepository.getRequests(q).then(unwrap),
    staleTime: POLL,
    ...listOpts(o),
  });
};

export const useSubscribers = (
  q: B.ListQuery & { filter: 'all' | 'active' | 'free' | 'commission' | 'locked' | 'expired' },
  o?: ListOpts
) => {
  const { repositories } = useDependencies();
  return useQuery({
    queryKey: queryKeys.billing.subscribers(q),
    queryFn: () => repositories.billingRepository.getSubscribers(q).then(unwrap),
    staleTime: POLL,
    ...listOpts(o),
  });
};

export const useCommissionPayments = (
  q: B.ListQuery & { status: B.CommissionPaymentStatus | 'ALL' },
  o?: ListOpts
) => {
  const { repositories } = useDependencies();
  return useQuery({
    queryKey: queryKeys.billing.commissionPayments(q),
    queryFn: () => repositories.billingRepository.getCommissionPayments(q).then(unwrap),
    staleTime: POLL,
    ...listOpts(o),
  });
};

export const useCommissionLedger = (
  q: B.ListQuery & { status: B.CommissionLedgerStatus | 'ALL' },
  o?: ListOpts
) => {
  const { repositories } = useDependencies();
  return useQuery({
    queryKey: queryKeys.billing.ledger(q),
    queryFn: () => repositories.billingRepository.getCommissionLedger(q).then(unwrap),
    // Unsupported ledgers stay cached forever; supported ones poll while visible.
    staleTime: Infinity,
    refetchInterval: (d) => (d === null ? false : POLL),
    refetchIntervalInBackground: false as const,
    enabled: o?.enabled ?? true,
  });
};

export const useBitSettings = (o?: ListOpts) => {
  const { repositories } = useDependencies();
  return useQuery({
    queryKey: queryKeys.billing.bit,
    queryFn: () => repositories.billingRepository.getBitSettings().then(unwrap),
    staleTime: POLL,
    ...listOpts(o),
  });
};

export const usePlatformSettings = (o?: ListOpts) => {
  const { repositories } = useDependencies();
  return useQuery({
    queryKey: queryKeys.billing.platform,
    queryFn: () => repositories.billingRepository.getPlatformSettings().then(unwrap),
    staleTime: POLL,
    ...listOpts(o),
  });
};
