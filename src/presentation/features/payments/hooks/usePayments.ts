import { useQuery } from '@tanstack/react-query';
import { useDependencies } from '../../../../core/di/DependencyProvider';
import { queryKeys } from '../../../../core/query/queryKeys';
import { unwrap } from '../../../../core/query/unwrap';
import { useAdminMutation } from '../../../../core/query/useAdminMutation';
import type { WithdrawalQuery } from '../../../../domain/entities/Payment';

export const usePaymentSummary = () => {
  const { repositories } = useDependencies();
  return useQuery({
    queryKey: queryKeys.payments.summary,
    queryFn: () => repositories.paymentRepository.getPaymentSummary().then(unwrap),
    staleTime: 30000,
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
  });
};

export const useWithdrawals = (q: WithdrawalQuery, opts?: { enabled?: boolean }) => {
  const { repositories } = useDependencies();
  return useQuery({
    queryKey: queryKeys.payments.withdrawals(q),
    queryFn: () => repositories.paymentRepository.getWithdrawals(q).then(unwrap),
    staleTime: 30000,
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
    enabled: opts?.enabled ?? true,
  });
};

const INVALIDATE = [queryKeys.payments.all, queryKeys.counts] as const;

export const useApproveWithdrawal = () => {
  const { repositories } = useDependencies();
  return useAdminMutation({
    mutationFn: (id: string) => repositories.paymentRepository.approveWithdrawal(id).then(unwrap),
    invalidate: [...INVALIDATE],
    successKey: 'toast_withdrawal_approved',
  });
};

export const useRejectWithdrawal = () => {
  const { repositories } = useDependencies();
  return useAdminMutation({
    mutationFn: (id: string) => repositories.paymentRepository.rejectWithdrawal(id).then(unwrap),
    invalidate: [...INVALIDATE],
    successKey: 'toast_withdrawal_rejected',
  });
};

export const useRetryWithdrawal = () => {
  const { repositories } = useDependencies();
  return useAdminMutation({
    mutationFn: (id: string) => repositories.paymentRepository.retryWithdrawal(id).then(unwrap),
    invalidate: [...INVALIDATE],
    successKey: 'toast_withdrawal_retried',
  });
};
