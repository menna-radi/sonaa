import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { FormModal, TextField } from '../../../components/ui';
import { validate, tError, type FieldErrors } from '../../../../domain/validation';
import { subCategorySchema } from '../../../../domain/validation/ops';
import { optionalHttpUrl } from '../../../../domain/validation/common';
import { fieldErrorsFrom } from '../../../../core/errors/errorMessage';
import type { Subcategory } from '../../../../domain/entities/Category';
import { useSubcategoryActions } from '../hooks/useServiceMutations';

export interface SubcategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string;
  /** When set, the modal renames / re-images this subcategory (needs the optional endpoint). */
  subcategory?: Subcategory;
}

type FormKey = 'nameEn' | 'nameAr' | 'nameHe' | 'imageUrl';

const schema = subCategorySchema.extend({ imageUrl: optionalHttpUrl });

const SubcategoryForm: React.FC<SubcategoryFormModalProps> = ({ isOpen, onClose, categoryId, subcategory }) => {
  const { t } = useLanguage();
  const { add, editSubcategory, editPending } = useSubcategoryActions();
  const [form, setForm] = useState<Record<FormKey, string>>({
    nameEn: subcategory?.name ?? '',
    nameAr: subcategory?.nameAr ?? '',
    nameHe: subcategory?.nameHe ?? '',
    imageUrl: subcategory?.imageUrl ?? '',
  });
  const [errors, setErrors] = useState<FieldErrors>({});

  const set = (k: FormKey) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [k]: e.target.value }));
    setErrors((prev) => ({ ...prev, [k]: '' }));
  };

  const submit = async () => {
    const r = validate(schema, form);
    if (!r.ok) {
      setErrors(r.errors);
      return;
    }
    setErrors({});
    const input = {
      nameEn: r.data.nameEn,
      nameAr: r.data.nameAr,
      nameHe: r.data.nameHe || undefined,
      imageUrl: r.data.imageUrl ?? undefined,
    };
    if (subcategory) {
      if (await editSubcategory(subcategory.id, input)) onClose();
      return;
    }
    add.mutate(
      { categoryId, input },
      { onSuccess: onClose, onError: (e) => setErrors(fieldErrorsFrom(e)) }
    );
  };

  const field = (k: FormKey, label: string, required = false) => (
    <TextField
      id={`subcategory-form-${k}`}
      label={label}
      value={form[k]}
      onChange={set(k)}
      error={tError(t, errors[k])}
      required={required}
    />
  );

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={t(subcategory ? 'subcats_form_edit_title' : 'subcats_form_add_title')}
      onSubmit={submit}
      pending={add.isPending || editPending}
    >
      <div className="ui-form-grid">
        {field('nameEn', t('categories_field_name_en'), true)}
        {field('nameAr', t('categories_field_name_ar'), true)}
        {field('nameHe', t('categories_field_name_he'))}
        {subcategory && field('imageUrl', t('subcats_field_image'))}
      </div>
    </FormModal>
  );
};

/** Mounts the form only while open, so every opening starts from the current values. */
export const SubcategoryFormModal: React.FC<SubcategoryFormModalProps> = (props) =>
  props.isOpen ? <SubcategoryForm {...props} /> : null;

export default SubcategoryFormModal;
