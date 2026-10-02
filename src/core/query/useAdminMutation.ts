import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { useToast } from '../../presentation/components/ui/Toast';
import { useLanguage } from '../../presentation/context/LanguageContext';
import { errorMessage } from '../errors/errorMessage';

export function useAdminMutation<TVars, TData>(opts: {
  mutationFn: (vars: TVars) => Promise<TData>;
  invalidate?: QueryKey[];
  successKey?: string;
  onSuccess?: (data: TData, vars: TVars) => void;
  silentError?: boolean;
}) {
  const qc = useQueryClient();
  const { success, error } = useToast();
  const { t } = useLanguage();
  return useMutation<TData, Error, TVars>({
    mutationFn: opts.mutationFn,
    onSuccess: (data, vars) => {
      opts.invalidate?.forEach((k) => qc.invalidateQueries({ queryKey: k }));
      if (opts.successKey) success(t(opts.successKey));
      opts.onSuccess?.(data, vars);
    },
    onError: (e) => {
      if (!opts.silentError) error(errorMessage(e, t));
    },
  });
}
