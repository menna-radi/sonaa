import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { FormModal, TextField } from '../../../components/ui';
import { validate, tError, type FieldErrors } from '../../../../domain/validation';
import { categorySchema } from '../../../../domain/validation/ops';
import { fieldErrorsFrom } from '../../../../core/errors/errorMessage';
import type { Category } from '../../../../domain/entities/Category';
import { useCategoryActions } from '../hooks/useServiceMutations';

export interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** When set, the modal edits this category (the key is read-only). */
  category?: Category;
  onSaved?: () => void;
}

type FormKey = 'key' | 'nameEn' | 'nameAr' | 'nameHe';

const editSchema = categorySchema.omit({ key: true });

const CategoryForm: React.FC<CategoryFormModalProps> = ({ isOpen, onClose, category, onSaved }) => {
  const { t } = useLanguage();
  const { save } = useCategoryActions();
  const [form, setForm] = useState<Record<FormKey, string>>({
    key: category?.key ?? '',
    nameEn: category?.name ?? '',
    nameAr: category?.nameAr ?? '',
    nameHe: category?.nameHe ?? '',
  });
  const [errors, setErrors] = useState<FieldErrors>({});

  const set = (k: FormKey) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [k]: e.target.value }));
    setErrors((prev) => ({ ...prev, [k]: '' }));
  };

  const submit = () => {
    const r = category ? validate(editSchema, form) : validate(categorySchema, form);
    if (!r.ok) {
      setErrors(r.errors);
      return;
    }
    setErrors({});
    const input = {
      key: category ? (category.key ?? '') : form.key.trim().toUpperCase(),
      nameEn: r.data.nameEn,
      nameAr: r.data.nameAr,
      nameHe: r.data.nameHe || undefined,
    };
    save.mutate(
      { id: category?.id, input },
      {
        onSuccess: () => {
          onClose();
          onSaved?.();
        },
        onError: (e) => setErrors(fieldErrorsFrom(e)),
      }
    );
  };

  const field = (k: FormKey, label: string, extra?: Partial<React.ComponentProps<typeof TextField>>) => (
    <TextField
      id={`category-form-${k}`}
      label={label}
      value={form[k]}
      onChange={set(k)}
      error={tError(t, errors[k])}
      {...extra}
    />
  );

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={t(category ? 'categories_form_edit_title' : 'categories_form_create_title')}
      onSubmit={submit}
      pending={save.isPending}
    >
      <div className="ui-form-grid">
        {field('key', t('categories_field_key'), {
          disabled: !!category,
          required: !category,
          helperText: t(category ? 'categories_key_locked' : 'categories_key_help'),
          dir: 'ltr',
        })}
        {field('nameEn', t('categories_field_name_en'), { required: true })}
        {field('nameAr', t('categories_field_name_ar'), { required: true })}
        {field('nameHe', t('categories_field_name_he'))}
      </div>
    </FormModal>
  );
};

/** Mounts the form only while open, so every opening starts from the current values. */
export const CategoryFormModal: React.FC<CategoryFormModalProps> = (props) =>
  props.isOpen ? <CategoryForm {...props} /> : null;

export default CategoryFormModal;
