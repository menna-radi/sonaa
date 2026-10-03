import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { FormModal } from '../../../components/ui/FormModal';
import { TextField } from '../../../components/ui/FormFields';
import { useToast } from '../../../components/ui/Toast';
import { formatDate } from '../../../../core/utils/format';
import { errorMessage, fieldErrorsFrom } from '../../../../core/errors/errorMessage';
import { validate, tError } from '../../../../domain/validation';
import { extendDaysSchema } from '../../../../domain/validation/billing';
import type { Subscriber } from '../../../../domain/entities/Billing';
import { useExtendSubscriber } from '../hooks/useBillingMutations';

const PRESETS = [30, 90, 180, 365];

interface ExtendModalProps {
  subscriber: Subscriber | null;
  onClose: () => void;
}

export const ExtendModal: React.FC<ExtendModalProps> = ({ subscriber, onClose }) => {
  const { t, language } = useLanguage();
  const toast = useToast();
  const extend = useExtendSubscriber();
  const [days, setDays] = useState('30');
  const [fieldError, setFieldError] = useState<string | undefined>(undefined);
  const [now] = useState(() => Date.now());

  const expiryBase =
    subscriber?.expiryDate && new Date(subscriber.expiryDate).getTime() > now
      ? new Date(subscriber.expiryDate)
      : new Date(now);
  const daysNum = Number(days);
  const resultDate =
    subscriber && Number.isFinite(daysNum) && daysNum > 0
      ? new Date(expiryBase.getTime() + daysNum * 86400000)
      : null;

  const submit = () => {
    if (!subscriber) return;
    const v = validate(extendDaysSchema, { days });
    if (!v.ok) {
      setFieldError(tError(t, v.errors.days));
      return;
    }
    setFieldError(undefined);
    extend.mutate(
      { id: subscriber.id, days: v.data.days },
      {
        onSuccess: onClose,
        onError: (e: Error) => {
          const server = fieldErrorsFrom(e).days;
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
      title={t('subscribers_extend_title')}
      onSubmit={submit}
      pending={extend.isPending}
    >
      <div className="ui-stack">
        <div className="ui-row">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              className={`billing-chip${days === String(p) ? ' billing-chip--active' : ''}`}
              onClick={() => {
                setDays(String(p));
                setFieldError(undefined);
              }}
            >
              <bdi className="ui-num">{p}</bdi>
            </button>
          ))}
        </div>
        <TextField
          label={t('subscribers_extend_days')}
          value={days}
          onChange={(e) => {
            setDays(e.target.value);
            setFieldError(undefined);
          }}
          inputMode="numeric"
          error={fieldError}
          helperText={
            resultDate
              ? `${t('subscribers_extend_result')}: ${formatDate(resultDate, language)}`
              : undefined
          }
        />
      </div>
    </FormModal>
  );
};

export default ExtendModal;
