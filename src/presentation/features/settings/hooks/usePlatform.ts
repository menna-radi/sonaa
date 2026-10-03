import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useDependencies } from '../../../../core/di/DependencyProvider';
import { queryKeys } from '../../../../core/query/queryKeys';
import { unwrap } from '../../../../core/query/unwrap';
import { useAdminMutation } from '../../../../core/query/useAdminMutation';
import type { PlatformSettings } from '../../../../domain/entities/Billing';

export const useAutoVerification = () => {
  const { repositories } = useDependencies();
  return useQuery({
    queryKey: queryKeys.settings.autoVerification,
    queryFn: () => repositories.billingRepository.getPlatformSettings().then(unwrap),
    staleTime: 30000,
  });
};

export const useSetAutoVerification = () => {
  const { repositories } = useDependencies();
  const qc = useQueryClient();
  return useAdminMutation<boolean, PlatformSettings>({
    mutationFn: (autoVerifyCraftsmen) =>
      repositories.billingRepository.updatePlatformSettings({ autoVerifyCraftsmen }).then(unwrap),
    invalidate: [queryKeys.billing.platform],
    successKey: 'settings_platform_toast_saved',
    onSuccess: (data) => qc.setQueryData(queryKeys.settings.autoVerification, data),
  });
};
