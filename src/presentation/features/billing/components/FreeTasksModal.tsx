import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { FormModal } from '../../../components/ui/FormModal';
import { TextField } from '../../../components/ui/FormFields';
import { useToast } from '../../../components/ui/Toast';
import { errorMessage, fieldErrorsFrom } from '../../../../core/errors/errorMessage';
import { validate, tError } from '../../../../domain/validation';
import { freeTasksSchema } from '../../../../domain/validation/billing';
import type { Subscriber } from '../../../../domain/entities/Billing';
import { usePlatformSettings } from '../hooks/useBilling';
import { useSetFreeTasks } from '../hooks/useBillingMutations';

interface FreeTasksModalProps {
  subscriber: Subscriber | null;
  onClose: () => void;
}

export const FreeTasksModal: React.FC<FreeTasksModalProps> = ({ subscriber, onClose }) => {
  const { t } = useLanguage();
  const toast = useToast();
  const platform = usePlatformSettings();
  const setFree = useSetFreeTasks();
  const [value, setValue] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | undefined>(undefined);

  const shown = value ?? String(subscriber?.freeTasksRemaining ?? 0);
  const platformDefault = platform.data?.freeTasksCount;

  const submit = () => {
    if (!subscriber) return;
    const v = validate(freeTasksSchema, { freeTasksRemaining: shown });
    if (!v.ok) {
      setFieldError(tError(t, v.errors.freeTasksRemaining));
      return;
    }
    setFieldError(undefined);
    setFree.mutate(
      { id: subscriber.id, freeTasksRemaining: v.data.freeTasksRemaining },
      {
        onSuccess: onClose,
        onError: (e: Error) => {
          const server = fieldErrorsFrom(e).freeTasksRemaining;
          if (server) setFieldError(server);
          else toast.error(errorMessage(e, t));
        },
      }
    );
  };

  return (
    <FormModal
      isOpen={!!subscriber}
      onClose={onClose}
      title={t('subscribers_free_title')}
      onSubmit={submit}
      pending={setFree.isPending}
    >
      <TextField
        label={t('subscribers_free_count')}
        value={shown}
        onChange={(e) => {
          setValue(e.target.value);
          setFieldError(undefined);
        }}
        inputMode="numeric"
        error={fieldError}
        helperText={
          platformDefault !== undefined
            ? `${t('subscribers_free_default')}: ${platformDefault}`
            : undefined
        }
      />
    </FormModal>
  );
};

export default FreeTasksModal;
