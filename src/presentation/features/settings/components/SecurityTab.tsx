import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Button, Card, TextField } from '../../../components/ui';
import { validate, tError, type FieldErrors } from '../../../../domain/validation';
import { changePasswordSchema } from '../../../../domain/validation/ops';
import { errorMessage, fieldErrorsFrom } from '../../../../core/errors/errorMessage';
import { useChangePassword } from '../hooks/useChangePassword';

type Field = 'oldPassword' | 'newPassword' | 'confirm';
const EMPTY: Record<Field, string> = { oldPassword: '', newPassword: '', confirm: '' };

export const SecurityTab: React.FC = () => {
  const { t } = useLanguage();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const change = useChangePassword(() => setForm(EMPTY));

  const set = (key: Field) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = validate(changePasswordSchema, form);
    if (!r.ok) {
      setErrors(r.errors);
      return;
    }
    setErrors({});
    change.mutate(
      { oldPassword: r.data.oldPassword, newPassword: r.data.newPassword },
      {
        onError: (err) => {
          const fields = fieldErrorsFrom(err);
          setErrors(Object.keys(fields).length ? fields : { oldPassword: errorMessage(err, t) });
        },
      }
    );
  };

  const field = (key: Field, label: string, autoComplete: string) => (
    <TextField
      id={`settings-pw-${key}`}
      type="password"
      label={label}
      value={form[key]}
      onChange={set(key)}
      error={tError(t, errors[key])}
      autoComplete={autoComplete}
      required
    />
  );

  return (
    <Card eyebrow={t('settings_tab_security')} title={t('settings_security_title')} subtitle={t('settings_security_subtitle')}>
      <form noValidate onSubmit={submit} className="ui-form-grid settings-pw-form">
        {field('oldPassword', t('settings_security_old'), 'current-password')}
        {field('newPassword', t('settings_security_new'), 'new-password')}
        {field('confirm', t('settings_security_confirm'), 'new-password')}
        <div className="ui-row">
          <Button type="submit" loading={change.isPending}>
            {t('settings_security_submit')}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default SecurityTab;
