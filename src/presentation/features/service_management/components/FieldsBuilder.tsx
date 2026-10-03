import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Category, FormField } from '../../../../domain/entities/Category';
import {
  DataTable,
  Column,
  Button,
  StatusPill,
  Switch,
  EmptyState,
  ErrorState,
  useConfirm,
} from '../../../components/ui';
import { Plus, Trash2, Smartphone, FormInput } from 'lucide-react';
import { useFieldActions } from '../hooks/useServiceMutations';
import { FieldFormModal } from './FieldFormModal';
import { localName } from './localName';
import '../service_management.css';

export interface FieldsBuilderProps {
  category: Category;
  fields: FormField[];
  loading: boolean;
  error: Error | null;
}

const PreviewInput: React.FC<{ field: FormField; placeholder: string }> = ({ field, placeholder }) => (
  <div
    className={`svc-preview__input${field.type === 'textarea' ? ' svc-preview__input--tall' : ''}`}
  >
    {field.type === 'select' ? (field.options?.[0] ?? placeholder) : null}
  </div>
);

export const FieldsBuilder: React.FC<FieldsBuilderProps> = ({ category, fields, loading, error }) => {
  const { t, language } = useLanguage();
  const confirm = useConfirm();
  const { toggleRequired, remove } = useFieldActions();
  const [adding, setAdding] = useState(false);

  const askDelete = async (field: FormField) => {
    const ok = await confirm({
      title: t('fields_delete_title'),
      body: t('fields_delete_body'),
      tone: 'danger',
      confirmLabel: t('fields_delete'),
    });
    if (ok) remove.mutate(field.id);
  };

  const columns: Column<FormField>[] = [
    {
      key: 'name',
      header: t('fields_col_label'),
      render: (row) => (
        <div className="svc-cell svc-cell--stack">
          <span className="ui-text-strong">{row.name}</span>
          {row.fieldKey && <span className="svc-mono">{row.fieldKey}</span>}
        </div>
      ),
    },
    {
      key: 'type',
      header: t('fields_col_type'),
      width: 130,
      render: (row) => <StatusPill variant="neutral" label={t(`fields_type_${row.type}`)} />,
    },
    {
      key: 'required',
      header: t('fields_col_required'),
      align: 'center',
      width: 110,
      render: (row) => <Switch checked={row.required} onChange={() => toggleRequired.mutate(row.id)} />,
    },
    {
      key: 'actions',
      header: t('fields_col_actions'),
      align: 'end',
      width: 80,
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          icon={<Trash2 size={14} />}
          onClick={() => askDelete(row)}
          aria-label={t('fields_delete')}
        />
      ),
    },
  ];

  if (error) return <ErrorState title={t('status_error')} message={error.message} />;

  return (
    <div className="ui-split ui-split--even">
      <div className="ui-stack">
        <div className="ui-row ui-row--between">
          <span className="ui-caption">{t('fields_hint')}</span>
          <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setAdding(true)}>
            {t('fields_add')}
          </Button>
        </div>
        <DataTable
          columns={columns}
          rows={fields}
          rowKey={(row) => row.id}
          loading={loading}
          empty={
            <EmptyState
              icon={<FormInput size={20} />}
              title={t('fields_empty_title')}
              body={t('fields_empty_desc')}
            />
          }
          mobile={(row) => (
            <div className="svc-card">
              <span className="ui-text-strong">{row.name}</span>
              <div className="ui-row ui-row--between">
                <Switch checked={row.required} onChange={() => toggleRequired.mutate(row.id)} />
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Trash2 size={14} />}
                  onClick={() => askDelete(row)}
                  aria-label={t('fields_delete')}
                />
              </div>
            </div>
          )}
        />
      </div>

      <div className="svc-preview">
        <div className="ui-row">
          <Smartphone size={16} />
          <span className="ui-text-strong">{t('fields_preview_title')}</span>
        </div>
        <span className="ui-caption">
          {t('fields_preview_for')} {localName(category, language)}
        </span>
        <div className="svc-preview__form">
          {fields.length === 0 ? (
            <span className="ui-caption">{t('fields_preview_empty')}</span>
          ) : (
            fields.map((f) => (
              <div key={f.id} className="svc-preview__field">
                <span className="svc-preview__label">
                  {f.name}
                  {f.required && <span className="svc-preview__req"> *</span>}
                </span>
                <PreviewInput field={f} placeholder={t('fields_preview_select')} />
              </div>
            ))
          )}
        </div>
      </div>

      <FieldFormModal isOpen={adding} onClose={() => setAdding(false)} categoryId={category.id} />
    </div>
  );
};
