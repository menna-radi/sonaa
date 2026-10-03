import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { TextField, TextArea } from '../../../components/ui/FormFields';
import { useToast } from '../../../components/ui/Toast';
import { errorMessage, fieldErrorsFrom } from '../../../../core/errors/errorMessage';
import { validate, tError, type FieldErrors } from '../../../../domain/validation';
import { bitSettingsSchema } from '../../../../domain/validation/billing';
import type { BitSettings } from '../../../../domain/entities/Billing';
import { useBitSettings } from '../hooks/useBilling';
import { useSaveBitSettings } from '../hooks/useBillingMutations';
import { BitPreview } from './BitPreview';

const same = (a: BitSettings, b: BitSettings): boolean =>
  a.phoneNumber === b.phoneNumber &&
  a.recipientName === b.recipientName &&
  a.instructionsEn === b.instructionsEn &&
  a.instructionsAr === b.instructionsAr;

export const BitSettingsCard: React.FC = () => {
  const { t } = useLanguage();
  const toast = useToast();
  const loaded = useBitSettings();
  const save = useSaveBitSettings();

  const saved: BitSettings = loaded.data ?? { phoneNumber: '', recipientName: '', instructionsEn: '', instructionsAr: '' };
  const [draft, setDraft] = useState<BitSettings | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const form = draft ?? saved;
  const pristine = same(form, saved);
  const live = validate(bitSettingsSchema, form);
  const invalid = !live.ok;

  const set = (patch: Partial<BitSettings>) => setDraft({ ...form, ...patch });

  const submit = () => {
    setSubmitted(true);
    const v = validate(bitSettingsSchema, form);
    if (!v.ok) {
      setErrors(v.errors);
      return;
    }
    setErrors({});
    save.mutate(v.data, {
      onSuccess: () => {
        setDraft(null);
        setSubmitted(false);
      },
      onError: (e: Error) => {
        const server = fieldErrorsFrom(e);
        if (Object.keys(server).length) setErrors(server);
        else toast.error(errorMessage(e, t));
      },
    });
  };

  const err = (field: string): string | undefined => {
    if (!submitted && !errors[field]) return undefined;
    return tError(t, errors[field]);
  };

  return (
    <div className="ui-split ui-split--even">
      <Card title={t('settings_bit_title')} className="ov-card-fill">
        <div className="ui-stack">
          <TextField
            label={t('settings_bit_phone')}
            value={form.phoneNumber}
            onChange={(e) => set({ phoneNumber: e.target.value })}
            error={err('phoneNumber')}
            dir="ltr"
          />
          <TextField
            label={t('settings_bit_recipient')}
            value={form.recipientName}
            onChange={(e) => set({ recipientName: e.target.value })}
            error={err('recipientName')}
          />
          <TextArea
            label={t('settings_bit_instructions_en')}
            value={form.instructionsEn}
            onChange={(e) => set({ instructionsEn: e.target.value })}
            error={err('instructionsEn')}
          />
          <TextArea
            label={t('settings_bit_instructions_ar')}
            value={form.instructionsAr}
            onChange={(e) => set({ instructionsAr: e.target.value })}
            error={err('instructionsAr')}
          />
          <div className="ui-row ui-row--end">
            <Button
              variant="primary"
              size="sm"
              loading={save.isPending}
              disabled={pristine || invalid || save.isPending || loaded.isLoading}
              onClick={submit}
            >
              {t('btn_save')}
            </Button>
          </div>
        </div>
      </Card>
      <BitPreview settings={form} />
    </div>
  );
};

export default BitSettingsCard;
