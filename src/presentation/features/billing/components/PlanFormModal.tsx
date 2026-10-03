import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { FormModal } from '../../../components/ui/FormModal';
import { TextField, TextArea } from '../../../components/ui/FormFields';
import { useToast } from '../../../components/ui/Toast';
import { errorMessage, fieldErrorsFrom } from '../../../../core/errors/errorMessage';
import { validate, tError, type FieldErrors } from '../../../../domain/validation';
import { planSchema } from '../../../../domain/validation/billing';
import type { PlanInput, SubscriptionPlan } from '../../../../domain/entities/Billing';
import { useSavePlan } from '../hooks/useBillingMutations';
import { PlanCard } from './PlanCard';

interface PlanFormModalProps {
  plan: SubscriptionPlan | null;
  onClose: () => void;
}

const toLines = (arr: string[]): string => arr.join('\n');

export const PlanFormModal: React.FC<PlanFormModalProps> = ({ plan, onClose }) => {
  const { t } = useLanguage();
  const toast = useToast();
  const save = useSavePlan();
  const editing = !!plan;

  const [key, setKey] = useState(plan?.key ?? '');
  const [nameEn, setNameEn] = useState(plan?.nameEn ?? '');
  const [nameAr, setNameAr] = useState(plan?.nameAr ?? '');
  const [durationMonths, setDurationMonths] = useState(String(plan?.durationMonths ?? 3));
  const [price, setPrice] = useState(plan ? String(plan.price) : '');
  const [featuresEn, setFeaturesEn] = useState(toLines(plan?.featuresEn ?? []));
  const [featuresAr, setFeaturesAr] = useState(toLines(plan?.featuresAr ?? []));
  const [isPopular, setIsPopular] = useState(plan?.isPopular ?? false);
  const [isActive, setIsActive] = useState(plan?.isActive ?? true);
  const [errors, setErrors] = useState<FieldErrors>({});

  const err = (field: string): string | undefined => tError(t, errors[field]);

  const submit = () => {
    const v = validate(planSchema, {
      key: editing ? (plan?.key ?? key) : key,
      nameEn,
      nameAr,
      durationMonths,
      price,
      featuresEn,
      featuresAr,
      isPopular,
      isActive,
    });
    if (!v.ok) {
      setErrors(v.errors);
      const first = Object.values(v.errors)[0];
      if (first) toast.error(tError(t, first) ?? t('err_generic'));
      return;
    }
    setErrors({});
    const input: PlanInput = {
      key: v.data.key,
      nameEn: v.data.nameEn,
      nameAr: v.data.nameAr,
      durationMonths: v.data.durationMonths,
      price: v.data.price,
      featuresEn: v.data.featuresEn,
      featuresAr: v.data.featuresAr,
      isPopular: v.data.isPopular,
      isActive: v.data.isActive,
    };
    save.mutate(
      { id: plan?.id, input },
      {
        onSuccess: onClose,
        onError: (e: Error) => {
          const server = fieldErrorsFrom(e);
          if (Object.keys(server).length) setErrors(server);
          else toast.error(errorMessage(e, t));
        },
      }
    );
  };

  const preview: SubscriptionPlan = {
    id: plan?.id ?? 'preview',
    key: key.toUpperCase() || 'PREVIEW',
    nameEn: nameEn || '…',
    nameAr: nameAr || '…',
    durationMonths: Number(durationMonths) || 1,
    price: Number(price) || 0,
    currency: 'ILS',
    featuresEn: featuresEn.split('\n').map((s) => s.trim()).filter(Boolean),
    featuresAr: featuresAr.split('\n').map((s) => s.trim()).filter(Boolean),
    isPopular,
    isActive,
  };

  const noop = () => undefined;

  return (
    <FormModal
      isOpen={true}
      onClose={onClose}
      title={editing ? t('plans_edit') : t('plans_new')}
      onSubmit={submit}
      pending={save.isPending}
      size="lg"
    >
      <div className="billing-plan-form">
        <div className="ui-stack">
          <TextField
            label={t('plans_key')}
            value={key}
            onChange={(e) => setKey(e.target.value.toUpperCase())}
            disabled={editing}
            error={err('key')}
          />
          <TextField label={t('plans_name_en')} value={nameEn} onChange={(e) => setNameEn(e.target.value)} error={err('nameEn')} />
          <TextField label={t('plans_name_ar')} value={nameAr} onChange={(e) => setNameAr(e.target.value)} error={err('nameAr')} />
          <TextField
            label={t('plans_duration')}
            value={durationMonths}
            onChange={(e) => setDurationMonths(e.target.value)}
            inputMode="numeric"
            error={err('durationMonths')}
          />
          <TextField
            label={t('plans_price')}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            inputMode="decimal"
            error={err('price')}
          />
          <TextArea
            label={t('plans_features_en')}
            value={featuresEn}
            onChange={(e) => setFeaturesEn(e.target.value)}
            error={err('featuresEn')}
          />
          <TextArea
            label={t('plans_features_ar')}
            value={featuresAr}
            onChange={(e) => setFeaturesAr(e.target.value)}
            error={err('featuresAr')}
          />
          <label className="billing-switch">
            <input type="checkbox" checked={isPopular} onChange={(e) => setIsPopular(e.target.checked)} />
            <span className="billing-switch__track" aria-hidden="true" />
            <span>{t('plans_popular')}</span>
          </label>
          <label className="billing-switch">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            <span className="billing-switch__track" aria-hidden="true" />
            <span>{t('plans_active')}</span>
          </label>
        </div>
        <div className="billing-plan-preview">
          <PlanCard plan={preview} onEdit={noop} onToggleActive={noop} onDelete={noop} busy={true} />
        </div>
      </div>
    </FormModal>
  );
};

export default PlanFormModal;
