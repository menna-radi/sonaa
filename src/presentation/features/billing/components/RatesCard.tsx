import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { AlertBanner } from '../../../components/ui/AlertBanner';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { TextField } from '../../../components/ui/FormFields';
import { useToast } from '../../../components/ui/Toast';
import { errorMessage, fieldErrorsFrom } from '../../../../core/errors/errorMessage';
import { formatMoney } from '../../../../core/utils/format';
import { validate, tError, type FieldErrors } from '../../../../domain/validation';
import { platformSettingsSchema, percentToFraction, fractionToPercent } from '../../../../domain/validation/billing';
import { usePlatformSettings } from '../hooks/useBilling';
import { useSavePlatformSettings } from '../hooks/useBillingMutations';

export const RatesCard: React.FC = () => {
  const { t, language } = useLanguage();
  const toast = useToast();
  const loaded = usePlatformSettings();
  const save = useSavePlatformSettings();

  const savedFree = loaded.data ? String(loaded.data.freeTasksCount) : '';
  const savedPct = loaded.data ? String(fractionToPercent(loaded.data.commissionRate)) : '';
  const [free, setFree] = useState<string | null>(null);
  const [pct, setPct] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState<'free' | 'rate' | null>(null);

  const freeShown = free ?? savedFree;
  const pctShown = pct ?? savedPct;
  const freePristine = free === null || free === savedFree;
  const pctPristine = pct === null || pct === savedPct;

  const clearErr = (field: string) =>
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });

  const freeCheck = validate(platformSettingsSchema, { freeTasksCount: freeShown, commissionRatePercent: '1' });
  const freeInvalid = !freeCheck.ok && freeCheck.errors.freeTasksCount !== undefined;
  const pctNumLive = Number(pctShown);
  const rateInvalid = !Number.isFinite(pctNumLive) || pctNumLive < 0.1 || pctNumLive > 50;

  const submitFree = () => {
    setSubmitted('free');
    const v = validate(platformSettingsSchema, { freeTasksCount: freeShown, commissionRatePercent: '1' });
    if (!v.ok && v.errors.freeTasksCount) {
      setErrors({ freeTasksCount: v.errors.freeTasksCount });
      return;
    }
    clearErr('freeTasksCount');
    save.mutate(
      { freeTasksCount: Number(freeShown) },
      {
        onSuccess: () => {
          setFree(null);
          setSubmitted(null);
        },
        onError: (e: Error) => {
          const server = fieldErrorsFrom(e);
          if (server.freeTasksCount) setErrors((prev) => ({ ...prev, freeTasksCount: server.freeTasksCount }));
          else toast.error(errorMessage(e, t));
        },
      }
    );
  };

  const submitRate = () => {
    const pctNum = Number(pctShown);
    if (!Number.isFinite(pctNum) || pctNum < 0.1 || pctNum > 50) {
      setSubmitted('rate');
      setErrors((e) => ({ ...e, commissionRatePercent: 'val_range|0.1-50' }));
      return;
    }
    setSubmitted('rate');
    const v = validate(platformSettingsSchema, { freeTasksCount: freeShown || '0', commissionRatePercent: pctShown });
    if (!v.ok && v.errors.commissionRatePercent) {
      setErrors((e) => ({ ...e, commissionRatePercent: v.errors.commissionRatePercent }));
      return;
    }
    clearErr('commissionRatePercent');
    save.mutate(
      { commissionRate: percentToFraction(pctNum) },
      {
        onSuccess: () => {
          setPct(null);
          setSubmitted(null);
        },
        onError: (e: Error) => {
          const server = fieldErrorsFrom(e);
          if (server.commissionRate) setErrors((prev) => ({ ...prev, commissionRatePercent: server.commissionRate }));
          else toast.error(errorMessage(e, t));
        },
      }
    );
  };

  const err = (field: string): string | undefined => {
    if (!submitted) return undefined;
    return tError(t, errors[field]);
  };

  const exampleAmount = (() => {
    const n = Number(pctShown);
    if (!Number.isFinite(n) || n < 0.1 || n > 50) return null;
    return formatMoney(1000 * percentToFraction(n), 'ILS', language);
  })();

  return (
    <div className="ui-stack">
      <Card title={t('settings_free_tasks_title')} className="ov-card-fill">
        <div className="ui-stack">
          <TextField
            label={t('settings_free_count')}
            value={freeShown}
            onChange={(e) => setFree(e.target.value)}
            inputMode="numeric"
            error={err('freeTasksCount')}
            helperText={t('settings_free_help')}
          />
          <div className="ui-row ui-row--end">
            <Button
              variant="primary"
              size="sm"
              loading={save.isPending}
              disabled={freePristine || freeInvalid || save.isPending || loaded.isLoading}
              onClick={submitFree}
            >
              {t('btn_save')}
            </Button>
          </div>
        </div>
      </Card>
      <Card title={t('settings_commission_title')} className="ov-card-fill">
        <div className="ui-stack">
          <AlertBanner tone="warning" title={t('settings_commission_warning')} />
          <TextField
            label={t('settings_commission_rate')}
            value={pctShown}
            onChange={(e) => setPct(e.target.value)}
            inputMode="decimal"
            error={err('commissionRatePercent')}
            helperText={
              exampleAmount
                ? `${t('settings_commission_example')}: ${exampleAmount}`
                : undefined
            }
          />
          <div className="ui-row ui-row--end">
            <Button
              variant="primary"
              size="sm"
              loading={save.isPending}
              disabled={pctPristine || rateInvalid || save.isPending || loaded.isLoading}
              onClick={submitRate}
            >
              {t('btn_save')}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RatesCard;
