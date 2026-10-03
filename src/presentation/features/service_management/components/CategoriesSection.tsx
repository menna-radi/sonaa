import React, { useMemo, useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Category } from '../../../../domain/entities/Category';
import { Card, Button, SearchInput, StatusPill, Skeleton, EmptyState } from '../../../components/ui';
import { Plus, Layers } from 'lucide-react';
import { formatNumber } from '../../../../core/utils/format';
import { CategoryFormModal } from './CategoryFormModal';
import { localName } from './localName';
import '../service_management.css';

export interface CategoriesSectionProps {
  categories: Category[];
  selectedId: string;
  onSelect: (id: string) => void;
  loading: boolean;
}

export const CategoriesSection: React.FC<CategoriesSectionProps> = ({
  categories,
  selectedId,
  onSelect,
  loading,
}) => {
  const { t, language } = useLanguage();
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) =>
      [c.name, c.nameAr, c.nameHe, c.key].some((v) => v && v.toLowerCase().includes(q))
    );
  }, [categories, search]);

  return (
    <Card
      eyebrow={t('categories_eyebrow')}
      title={t('categories_list_title')}
      actions={
        <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setCreating(true)}>
          {t('categories_new')}
        </Button>
      }
    >
      <div className="ui-stack">
        <SearchInput value={search} onChange={setSearch} placeholder={t('categories_search')} />

        {loading ? (
          <div className="ui-stack ui-stack--tight">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton.Card key={i} height={56} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Layers size={20} />}
            title={t('categories_empty_title')}
            body={t('categories_empty_desc')}
          />
        ) : (
          <div className="svc-cat-list" role="listbox" aria-label={t('categories_list_title')}>
            {filtered.map((c) => {
              const selected = c.id === selectedId;
              const active = c.isActive ?? c.visible;
              return (
                <button
                  key={c.id}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={`svc-cat${selected ? ' svc-cat--selected' : ''}`}
                  onClick={() => onSelect(c.id)}
                >
                  <span className="svc-cat__text">
                    <span className="svc-cat__name ui-clamp-1">{localName(c, language)}</span>
                    <span className="svc-cat__meta ui-num">
                      {formatNumber(c.subcategoriesCount, language)} {t('categories_subs_short')} ·{' '}
                      {formatNumber(c.taskVolume ?? 0, language)} {t('categories_tasks_short')}
                    </span>
                  </span>
                  {!active && <StatusPill variant="neutral" label={t('categories_status_hidden')} />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <CategoryFormModal isOpen={creating} onClose={() => setCreating(false)} />
    </Card>
  );
};
