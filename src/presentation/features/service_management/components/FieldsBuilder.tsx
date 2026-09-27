import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Category, FormField } from '../../../../domain/entities/Category';
import {
  Card,
  DataTable,
  Column,
  Button,
  StatusPill,
  Switch,
  Modal,
  TextField,
  Select,
  Checkbox,
} from '../../../components/ui';
import { Plus, Trash2, Smartphone, FormInput } from 'lucide-react';

export interface FieldsBuilderProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
  fields: FormField[];
  onCreateField: (
    categoryId: string,
    name: string,
    type: string,
    config?: { options?: string[] }
  ) => Promise<void>;
  onDeleteField: (id: string, categoryId: string) => Promise<void>;
  onToggleRequired: (id: string, categoryId: string) => Promise<void>;
}

export const FieldsBuilder: React.FC<FieldsBuilderProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  fields,
  onCreateField,
  onDeleteField,
  onToggleRequired,
}) => {
  const { isRtl } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [type, setType] = useState('text');
  const [optionsStr, setOptionsStr] = useState('');
  const [required, setRequired] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectedCategory =
    categories.find((c) => c.id === selectedCategoryId) || categories[0];

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: isRtl ? c.nameAr || c.name : c.name,
  }));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !selectedCategoryId) return;

    setSubmitting(true);
    try {
      const parsedOptions =
        type === 'select'
          ? optionsStr
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined;

      await onCreateField(
        selectedCategoryId,
        name.trim(),
        type,
        parsedOptions ? { options: parsedOptions } : undefined
      );

      setName('');
      setNameAr('');
      setType('text');
      setOptionsStr('');
      setRequired(false);
      setIsModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<FormField>[] = [
    {
      key: 'name',
      header: isRtl ? 'اسم الحقل' : 'Field Name',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 600, color: 'var(--on-surface)' }}>
            {isRtl ? row.nameAr || row.name : row.name}
          </span>
          <span style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--on-surface-subtle)' }}>
            {row.type}
          </span>
        </div>
      ),
    },
    {
      key: 'type',
      header: isRtl ? 'نوع الإدخال' : 'Input Type',
      width: 120,
      render: (row) => (
        <StatusPill variant="neutral" label={row.type.toUpperCase()} />
      ),
    },
    {
      key: 'required',
      header: isRtl ? 'مطلوب إجباري' : 'Required',
      align: 'center',
      width: 110,
      render: (row) => (
        <Switch
          checked={Boolean(row.required)}
          onChange={() => onToggleRequired(row.id, selectedCategoryId)}
        />
      ),
    },
    {
      key: 'actions',
      header: isRtl ? 'حذف' : 'Delete',
      align: 'end',
      width: 80,
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDeleteField(row.id, selectedCategoryId)}
          aria-label={isRtl ? 'حذف الحقل' : 'Delete field'}
        >
          <Trash2 size={14} style={{ color: 'var(--danger)' }} />
        </Button>
      ),
    },
  ];

  return (
    <Card>
      <div style={{ marginBottom: 'var(--sp-4)' }}>
        <h3 style={{ margin: 0, fontSize: 'var(--font-md)', fontWeight: 600, color: 'var(--on-surface)' }}>
          {isRtl ? 'مُنشئ حقول نموذج طلب الخدمة' : 'Service Order Form Field Schema'}
        </h3>
        <p style={{ margin: '4px 0 0', fontSize: 'var(--font-xs)', color: 'var(--on-surface-subtle)' }}>
          {isRtl
            ? 'تخصيص الحقول والمعلومات التي يدخلها العميل في تطبيق الهاتف عند طلب خدمة معينة'
            : 'Configure dynamic input fields and step requirements collected from customers.'}
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr minmax(280px, 320px)',
          gap: 'var(--sp-4)',
          alignItems: 'start',
        }}
      >
        {/* Left: Category Selector & Fields Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--sp-3)',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', minWidth: 240 }}>
              <span style={{ fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--on-surface-subtle)', whiteSpace: 'nowrap' }}>
                {isRtl ? 'الفئة المستهدفة:' : 'Selected Category:'}
              </span>
              <div style={{ flex: 1 }}>
                <Select
                  options={categoryOptions}
                  value={selectedCategoryId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onSelectCategory(e.target.value)}
                />
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              icon={<Plus size={14} />}
            >
              {isRtl ? 'إضافة حقل جديد' : 'Add Custom Field'}
            </Button>
          </div>

          <DataTable
            columns={columns}
            rows={fields}
            rowKey={(row) => row.id}
          />
        </div>

        {/* Right: Mobile Form Live Preview */}
        <div
          style={{
            background: 'var(--surface-sunken)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            padding: 'var(--sp-4)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--sp-3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
            <Smartphone size={16} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--on-surface)' }}>
              {isRtl ? 'معاينة شاشة العميل' : 'Mobile App Form Preview'}
            </span>
          </div>

          <p style={{ margin: 0, fontSize: 'var(--font-xs)', color: 'var(--on-surface-subtle)' }}>
            {isRtl
              ? `هكذا يظهر نموذج طلب (${selectedCategory ? selectedCategory.nameAr || selectedCategory.name : ''}) في تطبيق صُنّاع`
              : `Live customer booking preview for ${selectedCategory ? selectedCategory.name : ''}`}
          </p>

          <div
            style={{
              background: 'var(--surface-base)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              padding: 'var(--sp-3)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--sp-3)',
            }}
          >
            {fields.length === 0 ? (
              <span style={{ fontSize: 'var(--font-xs)', color: 'var(--on-surface-subtle)', textAlign: 'center', padding: 'var(--sp-3)' }}>
                {isRtl ? 'لا توجد حقول مخصصة لهذه الفئة' : 'No custom fields configured'}
              </span>
            ) : (
              fields.map((f) => (
                <div key={f.id} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--on-surface)' }}>
                    {isRtl ? f.nameAr || f.name : f.name}
                    {f.required && <span style={{ color: 'var(--danger)', marginInlineStart: 2 }}>*</span>}
                  </label>

                  {f.type === 'textarea' ? (
                    <div
                      style={{
                        height: 48,
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--surface-sunken)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    />
                  ) : f.type === 'select' ? (
                    <div
                      style={{
                        height: 32,
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--surface-sunken)',
                        border: '1px solid var(--border-subtle)',
                        padding: '0 8px',
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: 'var(--font-xs)',
                        color: 'var(--on-surface-subtle)',
                      }}
                    >
                      {f.options?.[0] || (isRtl ? 'اختر خياراً...' : 'Select option...')}
                    </div>
                  ) : (
                    <div
                      style={{
                        height: 32,
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--surface-sunken)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Custom Field Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isRtl ? 'إضافة حقل طلب جديد' : 'Add Custom Form Field'}
        size="md"
      >
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
          <TextField
            label={isRtl ? 'عنوان الحقل (بالإنجليزية)' : 'Field Label (English)'}
            placeholder="e.g. Pipe Material"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />

          <TextField
            label={isRtl ? 'عنوان الحقل (بالعربية)' : 'Field Label (Arabic)'}
            placeholder="مثال: نوع الأنابيب"
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
          />

          <Select
            label={isRtl ? 'نوع الحقل' : 'Field Type'}
            options={[
              { value: 'text', label: isRtl ? 'نص قصير' : 'Short Text' },
              { value: 'number', label: isRtl ? 'رقم' : 'Number' },
              { value: 'select', label: isRtl ? 'قائمة اختيار متعدد' : 'Dropdown / Single Select' },
              { value: 'textarea', label: isRtl ? 'نص طويل / وصف' : 'Long Text / TextArea' },
              { value: 'boolean', label: isRtl ? 'نعم / لا' : 'Yes / No (Boolean)' },
            ]}
            value={type}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setType(e.target.value)}
          />

          {type === 'select' && (
            <TextField
              label={isRtl ? 'الخيارات (مفصولة بفواصل)' : 'Options (comma separated)'}
              placeholder="Copper, PVC, Iron, Lead"
              value={optionsStr}
              onChange={(e) => setOptionsStr(e.target.value)}
              required
            />
          )}

          <div style={{ marginTop: 'var(--sp-1)' }}>
            <Checkbox
              checked={required}
              onChange={(e) => setRequired(e.target.checked)}
              label={isRtl ? 'حقل إجباري لا يمكن تجاوزه' : 'Required field for submission'}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--sp-2)', marginTop: 'var(--sp-3)' }}>
            <Button variant="outline" size="md" type="button" onClick={() => setIsModalOpen(false)} disabled={submitting}>
              {isRtl ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button variant="primary" size="md" type="submit" loading={submitting}>
              {isRtl ? 'حفظ الحقل' : 'Save Field'}
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
};
