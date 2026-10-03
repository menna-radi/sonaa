import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDependencies } from '../../../../core/di/DependencyProvider';
import { queryKeys } from '../../../../core/query/queryKeys';
import { unwrap } from '../../../../core/query/unwrap';

/** Server state for the service catalog; all keys live under `queryKeys.categories.all`. */
export const useServiceManagement = () => {
  const { dependencies } = useDependencies();
  const repo = dependencies.categoryRepository;
  const [selectedId, setSelectedId] = useState('');

  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: () => repo.getCategories().then(unwrap),
    staleTime: 30000,
  });

  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data]);
  const selected = categories.find((c) => c.id === selectedId) ?? categories[0];
  const activeId = selected?.id ?? '';

  const subcategoriesQuery = useQuery({
    queryKey: [...queryKeys.categories.all, 'subcategories', activeId],
    queryFn: () => repo.getSubcategories(activeId).then(unwrap),
    enabled: !!activeId,
  });

  const fieldsQuery = useQuery({
    queryKey: [...queryKeys.categories.all, 'fields', activeId],
    queryFn: () => repo.getFormFields(activeId).then(unwrap),
    enabled: !!activeId,
  });

  return {
    categories,
    selected,
    selectCategory: setSelectedId,
    loading: categoriesQuery.isLoading,
    error: categoriesQuery.error,
    refetch: () => {
      void categoriesQuery.refetch();
    },
    fetching: categoriesQuery.isFetching,
    subcategories: subcategoriesQuery.data ?? [],
    loadingSubcategories: subcategoriesQuery.isLoading,
    subcategoriesError: subcategoriesQuery.error,
    fields: fieldsQuery.data ?? [],
    loadingFields: fieldsQuery.isLoading,
    fieldsError: fieldsQuery.error,
  };
};

export default useServiceManagement;
