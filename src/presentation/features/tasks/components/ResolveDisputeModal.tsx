import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { FormModal } from '../../../components/ui/FormModal';
import { TextArea } from '../../../components/ui/FormFields';
import { useToast } from '../../../components/ui/Toast';
import { errorMessage, fieldErrorsFrom } from '../../../../core/errors/errorMessage';
import { validate, tError } from '../../../../domain/validation';
import { disputeResolveSchema } from '../../../../domain/validation/ops';
import type { Dispute, DisputeResolution } from '../../../../domain/entities/Dispute';
import { useResolveDispute } from '../hooks/useDisputes';
import { formatMoney } from '../../../../core/utils/format';
import { Undo2, HandCoins } from 'lucide-react';

interface ResolveDisputeModalProps {
  dispute: Dispute | null;
  onClose: () => void;
}

export const ResolveDisputeModal: React.FC<ResolveDisputeModalProps> = ({ dispute, onClose }) => {
  const { t, language } = useLanguage();
  const toast = useToast();
  const resolve = useResolveDispute();
  const [resolution, setResolution] = useState<DisputeResolution>('REFUND_CLIENT');
  const [notes, setNotes] = useState('');
  const [fieldError, setFieldError] = useState<string | undefined>(undefined);

  const submit = () => {
    if (!dispute) return;
    const v = validate(disputeResolveSchema, { resolution, notes: notes || undefined });
    if (!v.ok) {
      setFieldError(tError(t, v.errors.resolution) ?? tError(t, v.errors.notes));
      return;
    }
    setFieldError(undefined);
    resolve.mutate(
      { id: dispute.id, resolution: v.data.resolution, notes: v.data.notes },
      {
        onSuccess: onClose,
        onError: (e: Error) => {
          const server = fieldErrorsFrom(e);
          const first = Object.values(server)[0];
          if (first) setFieldError(first);
          else toast.error(errorMessage(e, t));
        },
      }
    );
  };

  return (
    <FormModal
      isOpen={!!dispute}
      onClose={onClose}
      title={t('disputes_resolve_title')}
      submitLabel={t('disputes_resolve')}
      onSubmit={submit}
      pending={resolve.isPending}
    >
      <div className="ui-stack">
        {dispute && (
          <p className="ui-caption">
            {dispute.taskDisplayId} · {dispute.taskTitle} ·{' '}
            <bdi className="ui-num">{formatMoney(dispute.amount, 'ILS', language)}</bdi>
          </p>
        )}
        <div className="ui-stack ui-stack--tight" role="radiogroup" aria-label={t('disputes_resolve_title')}>
          <button
            type="button"
            role="radio"
            aria-checked={resolution === 'REFUND_CLIENT'}
            className={`dispute-radio${resolution === 'REFUND_CLIENT' ? ' is-selected' : ''}`}
            onClick={() => setResolution('REFUND_CLIENT')}
          >
            <Undo2 size={16} />
            <span>
              <span className="ui-text-strong">{t('disputes_refund_client')}</span>
              <br />
              <span className="ui-caption">{t('disputes_refund_consequence')}</span>
            </span>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={resolution === 'PAY_CRAFTSMAN'}
            className={`dispute-radio${resolution === 'PAY_CRAFTSMAN' ? ' is-selected' : ''}`}
            onClick={() => setResolution('PAY_CRAFTSMAN')}
          >
            <HandCoins size={16} />
            <span>
              <span className="ui-text-strong">{t('disputes_pay_craftsman')}</span>
              <br />
              <span className="ui-caption">{t('disputes_pay_consequence')}</span>
            </span>
          </button>
        </div>
        {fieldError ? <span className="ui-caption">{fieldError}</span> : ''}
        <TextArea
          label={t('disputes_notes')}
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            setFieldError(undefined);
          }}
          error={undefined}
        />
      </div>
    </FormModal>
  );
};

export default ResolveDisputeModal;
