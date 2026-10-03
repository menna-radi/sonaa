import { useDependencies } from '../../../../core/di/DependencyProvider';
import { unwrap } from '../../../../core/query/unwrap';
import { useAdminMutation } from '../../../../core/query/useAdminMutation';

export interface ChangePasswordVars {
  oldPassword: string;
  newPassword: string;
}

export const useChangePassword = (onDone: () => void) => {
  const { dependencies } = useDependencies();
  return useAdminMutation<ChangePasswordVars, void>({
    mutationFn: (v) => dependencies.authRepository.changePassword(v.oldPassword, v.newPassword).then(unwrap),
    successKey: 'settings_security_toast_changed',
    silentError: true,
    onSuccess: onDone,
  });
};
