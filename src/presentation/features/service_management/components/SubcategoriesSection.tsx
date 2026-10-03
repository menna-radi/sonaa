import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Category, Subcategory } from '../../../../domain/entities/Category';
import {
  DataTable,
  Column,
  Button,
  StatusPill,
  Switch,
  FormModal,
  Select,
  EmptyState,
  ErrorState,
} from '../../../components/ui';
import { Plus, ArrowRightLeft, Pencil, ImageOff, FolderTree } from 'lucide-react';
import { formatNumber } from '../../../../core/utils/format';
import { useSubcategoryActions } from '../hooks/useServiceMutations';
import { SubcategoryFormModal } from './SubcategoryFormModal';
import { localName } from './localName';
import '../service_management.css';

export interface SubcategoriesSectionProps {
  category: Category;
  categories: Category[];
  subcategories: Subcategory[];
  loading: boolean;
  error: Error | null;
}

export const SubcategoriesSection: React.FC<SubcategoriesSectionProps> = ({
  category,
  categories,
  subcategories,
  loading,
  error,
}) => {
  const { t, language } = useLanguage();
  const { setVisible, move, canEdit } = useSubcategoryActions();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Subcategory | null>(null);
  const [moving, setMoving] = useState<Subcategory | null>(null);
  const [targetId, setTargetId] = useState('');

  const targets = categories.filter((c) => c.id !== category.id);

  const openMove = (sub: Subcategory) => {
    setMoving(sub);
    setTargetId(targets[0]?.id ?? '');
  };

  const submitMove = () => {
    if (!moving || !targetId) return;
    move.mutate({ id: moving.id, targetCategoryId: targetId }, { onSuccess: () => setMoving(null) });
  };

  const actions = (row: Subcategory) => (
    <div className="ui-row ui-row--end">
      {canEdit && (
        <Button
          variant="ghost"
          size="sm"
          icon={<Pencil size={13} />}
          onClick={() => setEditing(row)}
          aria-label={t('subcats_edit')}
        >
          {t('subcats_edit')}
        </Button>
      )}
      {targets.length > 0 && (
        <Button variant="outline" size="sm" icon={<ArrowRightLeft size={13} />} onClick={() => openMove(row)}>
          {t('subcats_move')}
        </Button>
      )}
    </div>
  );

  const thumb = (row: Subcategory) =>
    row.imageUrl ? (
      <img className="svc-thumb" src={row.imageUrl} alt="" loading="lazy" />
    ) : (
      <span className="svc-thumb svc-thumb--empty">
        <ImageOff size={14} />
      </span>
    );

  const columns: Column<Subcategory>[] = [
    {
      key: 'name',
      header: t('subcats_col_name'),
      render: (row) => (
        <div className="svc-cell">
          {thumb(row)}
          <span className="ui-text-strong">{localName(row, language)}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: t('subcats_col_status'),
      width: 120,
      render: (row) => (
        <StatusPill
          variant={row.visible ? 'success' : 'neutral'}
          dot
          label={t(row.visible ? 'status_active' : 'categories_status_hidden')}
        />
      ),
    },
    {
      key: 'requestCount',
      header: t('subcats_col_tasks'),
      width: 100,
      render: (row) => <span className="ui-num">{formatNumber(Number(row.requestCount) || 0, language)}</span>,
    },
    {
      key: 'visible',
      header: t('subcats_col_visible'),
      align: 'center',
      width: 90,
      render: (row) => (
        <Switch checked={row.visible} onChange={(visible) => setVisible.mutate({ id: row.id, visible })} />
      ),
    },
    { key: 'actions', header: t('subcats_col_actions'), align: 'end', render: actions },
  ];

  if (error) return <ErrorState title={t('status_error')} message={error.message} />;

  return (
    <div className="ui-stack">
      <div className="ui-row ui-row--between">
        <span className="ui-caption">{t('subcats_hint')}</span>
        <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setAdding(true)}>
          {t('subcats_add')}
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={subcategories}
        rowKey={(row) => row.id}
        loading={loading}
        empty={
          <EmptyState
            icon={<FolderTree size={20} />}
            title={t('subcats_empty_title')}
            body={t('subcats_empty_desc')}
          />
        }
        mobile={(row) => (
          <div className="svc-card">
            <div className="svc-cell">
              {thumb(row)}
              <span className="ui-text-strong">{localName(row, language)}</span>
            </div>
            <div className="ui-row ui-row--between">
              <Switch checked={row.visible} onChange={(visible) => setVisible.mutate({ id: row.id, visible })} />
              {actions(row)}
            </div>
          </div>
        )}
      />

      <SubcategoryFormModal isOpen={adding} onClose={() => setAdding(false)} categoryId={category.id} />
      <SubcategoryFormModal
        key={editing?.id}
        isOpen={!!editing}
        onClose={() => setEditing(null)}
        categoryId={category.id}
        subcategory={editing ?? undefined}
      />

      <FormModal
        isOpen={!!moving}
        onClose={() => setMoving(null)}
        title={t('subcats_move_title')}
        onSubmit={submitMove}
        pending={move.isPending}
        submitLabel={t('subcats_move_confirm')}
        submitDisabled={!targetId}
      >
        <Select
          id="subcats-move-target"
          label={t('subcats_move_target')}
          options={targets.map((c) => ({ value: c.id, label: localName(c, language) }))}
          value={targetId}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTargetId(e.target.value)}
        />
      </FormModal>
    </div>
  );
};
