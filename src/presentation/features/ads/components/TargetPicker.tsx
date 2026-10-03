import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '../../../context/LanguageContext';
import { useDependencies } from '../../../../core/di/DependencyProvider';
import { apiClient } from '../../../../core/network/apiClient';
import { API_ENDPOINTS } from '../../../../core/config/apiEndpoints';
import { unwrap } from '../../../../core/query/unwrap';
import { Select, TextField } from '../../../components/ui/FormFields';
import { SearchInput } from '../../../components/ui/SearchInput';
import { Skeleton } from '../../../components/ui/Skeleton';

interface TargetPickerProps {
  targetType: string;
  targetId?: string;
  onTargetIdChange: (id: string | undefined) => void;
  error?: string;
}

interface RawCraftsman {
  id: string;
  firstName?: string;
  lastName?: string;
  title?: string;
}

export const TargetPicker: React.FC<TargetPickerProps> = ({ targetType, targetId, onTargetIdChange, error }) => {
  const { t, language } = useLanguage();
  const { repositories } = useDependencies();
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const id = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(id);
  }, [search]);

  const categoriesQ = useQuery({
    queryKey: ['ads', 'target-categories'],
    queryFn: () => repositories.categoryRepository.getCategories().then(unwrap),
    staleTime: 300000,
    enabled: targetType === 'CATEGORY',
  });

  const craftsmenQ = useQuery({
    queryKey: ['ads', 'target-craftsmen', debounced],
    queryFn: async (): Promise<RawCraftsman[]> => {
      const res = await apiClient.get<{ items?: RawCraftsman[] } | RawCraftsman[]>(API_ENDPOINTS.admin.craftsmen, {
        q: debounced || undefined,
        limit: 10,
      });
      return Array.isArray(res) ? res : res.items || [];
    },
    staleTime: 30000,
    enabled: targetType === 'CRAFTSMAN',
  });

  if (targetType === 'CATEGORY') {
    return (
      <div>
        {categoriesQ.isLoading ? (
          <Skeleton height={38} />
        ) : (
          <Select
            label={t('offers_field_target')}
            value={targetId ?? ''}
            onChange={(e) => onTargetIdChange(e.target.value || undefined)}
            error={error}
            options={(categoriesQ.data ?? []).map((c) => ({
              value: c.id,
              label: language === 'ar' ? c.nameAr || c.name : c.name,
            }))}
          />
        )}
        <p className="ui-caption">{t('offers_target_id_help')}</p>
      </div>
    );
  }

  if (targetType === 'CRAFTSMAN') {
    return (
      <div className="ui-stack ui-stack--tight">
        <SearchInput value={search} onChange={setSearch} placeholder={t('offers_target_search_ph')} />
        {craftsmenQ.isLoading ? (
          <Skeleton height={38} />
        ) : (
          <div className="ui-row" role="listbox" aria-label={t('offers_field_target')}>
            {(craftsmenQ.data ?? []).slice(0, 10).map((c) => {
              const name = `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim() || c.id;
              const active = targetId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={`offer-target-chip${active ? ' offer-target-chip--active' : ''}`}
                  onClick={() => onTargetIdChange(active ? undefined : c.id)}
                >
                  {name}
                  {c.title ? ` · ${c.title}` : ''}
                </button>
              );
            })}
          </div>
        )}
        {error ? <span className="ui-caption">{error}</span> : ''}
        <p className="ui-caption">{t('offers_target_id_help')}</p>
      </div>
    );
  }

  if (targetType === 'TASK' || targetType === 'SERVICE') {
    return (
      <div>
        <TextField
          label={t('offers_field_target')}
          value={targetId ?? ''}
          onChange={(e) => onTargetIdChange(e.target.value || undefined)}
          error={error}
          dir="ltr"
        />
        <p className="ui-caption">{t('offers_target_id_help')}</p>
      </div>
    );
  }

  return null;
};

export default TargetPicker;
