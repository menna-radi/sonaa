import { useDependencies } from '../../../../core/di/DependencyProvider';
import { queryKeys } from '../../../../core/query/queryKeys';
import { unwrap } from '../../../../core/query/unwrap';
import { useAdminMutation } from '../../../../core/query/useAdminMutation';
import { useToast } from '../../../components/ui/Toast';
import { useLanguage } from '../../../context/LanguageContext';
import type * as B from '../../../../domain/entities/Billing';

const INVALIDATE = [queryKeys.billing.all, queryKeys.counts] as const;

export const useApproveRequest = () => {
  const { repositories } = useDependencies();
  return useAdminMutation({
    mutationFn: (id: string) => repositories.billingRepository.approveRequest(id).then(unwrap),
    invalidate: [...INVALIDATE],
    successKey: 'toast_receipt_approved',
  });
};

export const useRejectRequest = () => {
  const { repositories } = useDependencies();
  return useAdminMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      repositories.billingRepository.rejectRequest(id, reason).then(unwrap),
    invalidate: [...INVALIDATE],
    successKey: 'toast_receipt_rejected',
  });
};

export const useExtendSubscriber = () => {
  const { repositories } = useDependencies();
  return useAdminMutation({
    mutationFn: ({ id, days }: { id: string; days: number }) =>
      repositories.billingRepository.extendSubscriber(id, days).then(unwrap),
    invalidate: [...INVALIDATE],
    successKey: 'toast_subscriber_extended',
  });
};

export const useCancelSubscriber = () => {
  const { repositories } = useDependencies();
  return useAdminMutation({
    mutationFn: (id: string) => repositories.billingRepository.cancelSubscriber(id).then(unwrap),
    invalidate: [...INVALIDATE],
    successKey: 'toast_subscriber_cancelled',
  });
};

export const useSetFreeTasks = () => {
  const { repositories } = useDependencies();
  return useAdminMutation({
    mutationFn: ({ id, freeTasksRemaining }: { id: string; freeTasksRemaining: number }) =>
      repositories.billingRepository.setFreeTasks(id, freeTasksRemaining).then(unwrap),
    invalidate: [...INVALIDATE],
    successKey: 'toast_free_tasks_updated',
  });
};

export const useApproveCommission = () => {
  const { repositories } = useDependencies();
  const { success } = useToast();
  const { t } = useLanguage();
  return useAdminMutation({
    mutationFn: (id: string) => repositories.billingRepository.approveCommissionPayment(id).then(unwrap),
    invalidate: [...INVALIDATE],
    onSuccess: (result) => success(t(result.unlocked ? 'toast_commission_unlocked' : 'toast_commission_approved')),
  });
};

export const useRejectCommission = () => {
  const { repositories } = useDependencies();
  return useAdminMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      repositories.billingRepository.rejectCommissionPayment(id, reason).then(unwrap),
    invalidate: [...INVALIDATE],
    successKey: 'toast_commission_rejected',
  });
};

export const useSavePlan = () => {
  const { repositories } = useDependencies();
  return useAdminMutation({
    mutationFn: ({ id, input }: { id?: string; input: B.PlanInput }) =>
      (id
        ? repositories.billingRepository.updatePlan(id, input)
        : repositories.billingRepository.createPlan(input)
      ).then(unwrap),
    invalidate: [...INVALIDATE],
    successKey: 'toast_plan_saved',
  });
};

export const useDeletePlan = () => {
  const { repositories } = useDependencies();
  return useAdminMutation({
    mutationFn: (id: string) => repositories.billingRepository.deletePlan(id).then(unwrap),
    invalidate: [...INVALIDATE],
    successKey: 'toast_plan_deleted',
  });
};

export const useTogglePlanActive = () => {
  const { repositories } = useDependencies();
  return useAdminMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      repositories.billingRepository.updatePlan(id, { isActive }).then(unwrap),
    invalidate: [...INVALIDATE],
    successKey: 'toast_plan_saved',
  });
};

export const useSaveBitSettings = () => {
  const { repositories } = useDependencies();
  return useAdminMutation({
    mutationFn: (s: B.BitSettings) => repositories.billingRepository.updateBitSettings(s).then(unwrap),
    invalidate: [...INVALIDATE],
    successKey: 'toast_settings_saved',
  });
};

export const useSavePlatformSettings = () => {
  const { repositories } = useDependencies();
  return useAdminMutation({
    mutationFn: (s: Partial<B.PlatformSettings>) =>
      repositories.billingRepository.updatePlatformSettings(s).then(unwrap),
    invalidate: [...INVALIDATE, queryKeys.settings.all],
    successKey: 'toast_settings_saved',
  });
};
