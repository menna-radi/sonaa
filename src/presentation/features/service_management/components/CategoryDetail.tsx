import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Category, FormField, Subcategory } from '../../../../domain/entities/Category';
import { Card, Button, Segmented, StatusPill, useConfirm } from '../../../components/ui';
import { Pencil, EyeOff, Eye } from 'lucide-react';
import { useCategoryActions } from '../hooks/useServiceMutations';
import { CategoryFormModal } from './CategoryFormModal';
import { SubcategoriesSection } from './SubcategoriesSection';
import { FieldsBuilder } from './FieldsBuilder';
import { localName } from './localName';
import '../service_management.css';

export interface CategoryDetailProps {
  category: Category;
  categories: Category[];
  subcategories: Subcategory[];
  loadingSubcategories: boolean;
  subcategoriesError: Error | null;
  fields: FormField[];
  loadingFields: boolean;
  fieldsError: Error | null;
}

type Tab = 'subcategories' | 'fields';

export const CategoryDetail: React.FC<CategoryDetailProps> = (props) => {
  const { category } = props;
  const { t, language } = useLanguage();
  const confirm = useConfirm();
  const { setVisible } = useCategoryActions();
  const [tab, setTab] = useState<Tab>('subcategories');
  const [editing, setEditing] = useState(false);
  const active = category.isActive ?? category.visible;

  const toggleVisible = async () => {
    if (active) {
      const ok = await confirm({
        title: t('categories_hide_title'),
        body: t('categories_hide_body'),
        tone: 'danger',
        confirmLabel: t('categories_hide'),
      });
      if (!ok) return;
    }
    setVisible.mutate({ id: category.id, visible: !active });
  };

  return (
    <Card
      eyebrow={category.key}
      title={
        <span className="ui-row">
          {localName(category, language)}
          {!active && <StatusPill variant="neutral" label={t('categories_status_hidden')} />}
        </span>
      }
      actions={
        <div className="ui-row">
          <Button variant="outline" size="sm" icon={<Pencil size={14} />} onClick={() => setEditing(true)}>
            {t('categories_edit')}
          </Button>
          <Button
            variant={active ? 'soft-danger' : 'outline'}
            size="sm"
            icon={active ? <EyeOff size={14} /> : <Eye size={14} />}
            loading={setVisible.isPending}
            onClick={toggleVisible}
          >
            {t(active ? 'categories_hide' : 'categories_show')}
          </Button>
        </div>
      }
    >
      <div className="ui-stack">
        <Segmented
          value={tab}
          onChange={(v) => setTab(v as Tab)}
          items={[
            { value: 'subcategories', label: t('categories_tab_subs'), count: props.subcategories.length },
            { value: 'fields', label: t('categories_tab_fields'), count: props.fields.length },
          ]}
        />
        {tab === 'subcategories' ? (
          <SubcategoriesSection
            category={category}
            categories={props.categories}
            subcategories={props.subcategories}
            loading={props.loadingSubcategories}
            error={props.subcategoriesError}
          />
        ) : (
          <FieldsBuilder
            category={category}
            fields={props.fields}
            loading={props.loadingFields}
            error={props.fieldsError}
          />
        )}
      </div>
      <CategoryFormModal
        key={category.id}
        isOpen={editing}
        onClose={() => setEditing(false)}
        category={category}
      />
    </Card>
  );
};
