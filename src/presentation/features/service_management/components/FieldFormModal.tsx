import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { FormModal, TextField, TextArea, Select, Checkbox } from '../../../components/ui';
import { validate, tError, type FieldErrors } from '../../../../domain/validation';
import { fieldSchema } from '../../../../domain/validation/ops';
import { fieldErrorsFrom } from '../../../../core/errors/errorMessage';
import { useFieldActions } from '../hooks/useServiceMutations';

export interface FieldFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string;
}

const FIELD_TYPES = ['text', 'number', 'select', 'textarea', 'image'] as const;

interface FormState {
  label: string;
  fieldKey: string;
  fieldType: string;
  options: string;
  isRequired: boolean;
}

const EMPTY: FormState = { label: '', fieldKey: '', fieldType: 'text', options: '', isRequired: false };

const FieldForm: React.FC<FieldFormModalProps> = ({ isOpen, onClose, categoryId }) => {
  const { t } = useLanguage();
  const { add } = useFieldActions();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});

  const update = (patch: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(patch).forEach((k) => delete next[k]);
      return next;
    });
  };

  const submit = () => {
    const r = validate(fieldSchema, form);
    if (!r.ok) {
      setErrors(r.errors);
      return;
    }
    setErrors({});
    const options = (r.data.options ?? '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    add.mutate(
      {
        categoryId,
        input: {
          label: r.data.label,
          fieldKey: r.data.fieldKey,
          fieldType: r.data.fieldType,
          options: r.data.fieldType === 'select' ? options : undefined,
          isRequired: r.data.isRequired,
        },
      },
      {
        onSuccess: onClose,
        onError: (e) => setErrors(fieldErrorsFrom(e)),
      }
    );
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('fields_form_title')}
      onSubmit={submit}
      pending={add.isPending}
    >
      <div className="ui-form-grid">
        <TextField
          id="field-form-label"
          label={t('fields_field_label')}
          value={form.label}
          onChange={(e) => update({ label: e.target.value })}
          error={tError(t, errors.label)}
          required
          autoFocus
        />
        <TextField
          id="field-form-key"
          label={t('fields_field_key')}
          helperText={t('fields_key_help')}
          value={form.fieldKey}
          onChange={(e) => update({ fieldKey: e.target.value })}
          error={tError(t, errors.fieldKey)}
          dir="ltr"
          required
        />
        <Select
          id="field-form-type"
          label={t('fields_field_type')}
          options={FIELD_TYPES.map((v) => ({ value: v, label: t(`fields_type_${v}`) }))}
          value={form.fieldType}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => update({ fieldType: e.target.value })}
          error={tError(t, errors.fieldType)}
        />
        {form.fieldType === 'select' && (
          <TextArea
            id="field-form-options"
            label={t('fields_field_options')}
            value={form.options}
            onChange={(e) => update({ options: e.target.value })}
            error={tError(t, errors.options)}
            rows={4}
            required
          />
        )}
        <Checkbox
          checked={form.isRequired}
          onChange={(e) => update({ isRequired: e.target.checked })}
          label={t('fields_field_required')}
        />
      </div>
    </FormModal>
  );
};

/** Mounts the form only while open, so every opening starts empty. */
export const FieldFormModal: React.FC<FieldFormModalProps> = (props) =>
  props.isOpen ? <FieldForm {...props} /> : null;

export default FieldFormModal;
