import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { FormModal, TextField } from '../../../components/ui';
import { validate, tError, type FieldErrors } from '../../../../domain/validation';
import { newAdminSchema } from '../../../../domain/validation/ops';
import { fieldErrorsFrom } from '../../../../core/errors/errorMessage';
import type { InviteAdminInput, InviteAdminResult } from '../../../../domain/repositories/TeamRepository';
import { useInviteAdmin } from '../hooks/useTeam';

export interface InviteAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvited: (result: InviteAdminResult) => void;
}

const EMPTY: InviteAdminInput = { firstName: '', lastName: '', email: '', title: '' };

const InviteAdminForm: React.FC<InviteAdminModalProps> = ({ isOpen, onClose, onInvited }) => {
  const { t } = useLanguage();
  const [form, setForm] = useState<InviteAdminInput>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const invite = useInviteAdmin((result) => {
    onClose();
    onInvited(result);
  });

  const set = (key: keyof InviteAdminInput) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const submit = () => {
    const r = validate(newAdminSchema, form);
    if (!r.ok) {
      setErrors(r.errors);
      return;
    }
    setErrors({});
    invite.mutate(r.data, {
      onError: (e) => setErrors(fieldErrorsFrom(e)),
    });
  };

  const field = (key: keyof InviteAdminInput, label: string, type = 'text') => (
    <TextField
      id={`team-invite-${key}`}
      label={label}
      type={type}
      value={form[key]}
      onChange={set(key)}
      error={tError(t, errors[key])}
      required
    />
  );

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('team_invite_title')}
      onSubmit={submit}
      pending={invite.isPending}
      submitLabel={t('team_invite_submit')}
    >
      <div className="ui-form-grid ui-form-grid--2">
        {field('firstName', t('team_field_first_name'))}
        {field('lastName', t('team_field_last_name'))}
        {field('email', t('team_field_email'), 'email')}
        {field('title', t('team_field_title'))}
      </div>
    </FormModal>
  );
};

/** Mounts the form only while open, so every opening starts with empty fields. */
export const InviteAdminModal: React.FC<InviteAdminModalProps> = (props) =>
  props.isOpen ? <InviteAdminForm {...props} /> : null;

export default InviteAdminModal;
