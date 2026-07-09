import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDependencies } from '../../../../core/di/DependencyProvider';
import { ErrorToastMapper } from '../../../../core/errors/ErrorToastMapper';
import { useLanguage } from '../../../../presentation/context/LanguageContext';

export const useServiceManagement = () => {
  const { dependencies, useCases } = useDependencies();
  const { categoryRepository } = dependencies;
  const {
    getCategoriesUseCase,
    createCategoryUseCase,
    updateCategoryVisibilityUseCase,
    getSubcategoriesUseCase,
    createSubcategoryUseCase,
    updateSubcategoryVisibilityUseCase,
    getFormFieldsUseCase,
    toggleFieldRequiredUseCase,
    deleteFieldUseCase,
    createFieldUseCase
  } = useCases;

  const queryClient = useQueryClient();
  const { language } = useLanguage();
  const [selectedSubCatCategoryId, setSelectedSubCatCategoryId] = useState<string>('1');
  const [selectedFieldCategoryId, setSelectedFieldCategoryId] = useState<string>('1');

  // ── Queries ──

  // 1. Fetch Categories
  const { data: categories = [], isLoading: loadingCategories, error: errorCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await getCategoriesUseCase.execute();
      if (!res.success) {
        throw new Error(ErrorToastMapper.toMessage(res.error, language));
      }
      return res.data;
    }
  });

  // 2. Fetch Subcategories for Selected Category
  const { data: subcategories = [], isLoading: loadingSubcats, error: errorSubcats } = useQuery({
    queryKey: ['subcategories', selectedSubCatCategoryId],
    queryFn: async () => {
      const res = await getSubcategoriesUseCase.execute(selectedSubCatCategoryId);
      if (!res.success) {
        throw new Error(ErrorToastMapper.toMessage(res.error, language));
      }
      return res.data;
    },
    enabled: !!selectedSubCatCategoryId
  });

  // 3. Fetch Form Fields for Selected Category
  const { data: fields = [], isLoading: loadingFields, error: errorFields } = useQuery({
    queryKey: ['fields', selectedFieldCategoryId],
    queryFn: async () => {
      const res = await getFormFieldsUseCase.execute(selectedFieldCategoryId);
      if (!res.success) {
        throw new Error(ErrorToastMapper.toMessage(res.error, language));
      }
      return res.data;
    },
    enabled: !!selectedFieldCategoryId
  });

  // ── Mutations ──

  // Create Category Mutation
  const createCategoryMutation = useMutation({
    mutationFn: async ({ name, description }: { name: string; description: string }) => {
      const res = await createCategoryUseCase.execute(name, description);
      if (!res.success) {
        throw new Error(ErrorToastMapper.toMessage(res.error, language));
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  });

  // Toggle Category Visibility
  const toggleCategoryVisibilityMutation = useMutation({
    mutationFn: async ({ id, visible }: { id: string; visible: boolean }) => {
      const res = await updateCategoryVisibilityUseCase.execute(id, visible);
      if (!res.success) {
        throw new Error(ErrorToastMapper.toMessage(res.error, language));
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  });

  // Create Subcategory
  const createSubcategoryMutation = useMutation({
    mutationFn: async ({ categoryId, name }: { categoryId: string; name: string }) => {
      const res = await createSubcategoryUseCase.execute(categoryId, name);
      if (!res.success) {
        throw new Error(ErrorToastMapper.toMessage(res.error, language));
      }
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subcategories', variables.categoryId] });
      queryClient.invalidateQueries({ queryKey: ['categories'] }); // subcat count changed
    }
  });

  // Toggle Subcategory Visibility
  const toggleSubcategoryVisibilityMutation = useMutation({
    mutationFn: async ({ id, categoryId: _categoryId, visible }: { id: string; categoryId: string; visible: boolean }) => {
      const res = await updateSubcategoryVisibilityUseCase.execute(id, visible);
      if (!res.success) {
        throw new Error(ErrorToastMapper.toMessage(res.error, language));
      }
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subcategories', variables.categoryId] });
    }
  });

  // Toggle Field Required Status
  const toggleFieldRequiredMutation = useMutation({
    mutationFn: async ({ id, categoryId: _categoryId }: { id: string; categoryId: string }) => {
      const res = await toggleFieldRequiredUseCase.execute(id);
      if (!res.success) {
        throw new Error(ErrorToastMapper.toMessage(res.error, language));
      }
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['fields', variables.categoryId] });
    }
  });

  // Delete Form Field
  const deleteFieldMutation = useMutation({
    mutationFn: async ({ id, categoryId: _categoryId }: { id: string; categoryId: string }) => {
      const res = await deleteFieldUseCase.execute(id);
      if (!res.success) {
        throw new Error(ErrorToastMapper.toMessage(res.error, language));
      }
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['fields', variables.categoryId] });
    }
  });

  // Create Form Field
  const createFieldMutation = useMutation({
    mutationFn: async ({ 
      categoryId, 
      name, 
      type, 
      config 
    }: { 
      categoryId: string; 
      name: string; 
      type: string; 
      config?: {
        options?: string[];
        placeholder?: string;
        min?: number;
        max?: number;
        maxSize?: string;
        allowedFormats?: string[];
      } 
    }) => {
      const res = await createFieldUseCase.execute(categoryId, name, type, config);
      if (!res.success) {
        throw new Error(ErrorToastMapper.toMessage(res.error, language));
      }
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['fields', variables.categoryId] });
    }
  });

  const moveSubcategoryMutation = useMutation({
    mutationFn: async ({ id, targetCategoryId }: { id: string; targetCategoryId: string }) => {
      const res = await categoryRepository.moveSubcategory(id, targetCategoryId);
      if (!res.success) {
        throw new Error(ErrorToastMapper.toMessage(res.error, language));
      }
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  });

  return {
    moveSubcategory: (id: string, targetCategoryId: string) =>
      moveSubcategoryMutation.mutateAsync({ id, targetCategoryId }),
    categories,
    subcategories,
    fields,
    loading: loadingCategories || loadingSubcats || loadingFields,
    error: errorCategories?.message || errorSubcats?.message || errorFields?.message || null,
    selectedSubCatCategoryId,
    setSelectedSubCatCategoryId,
    selectedFieldCategoryId,
    setSelectedFieldCategoryId,

    // Mutation triggers
    createCategory: createCategoryMutation.mutateAsync,
    isCreatingCategory: createCategoryMutation.isPending,

    toggleCategoryVisibility: (id: string, visible: boolean) =>
      toggleCategoryVisibilityMutation.mutateAsync({ id, visible }),

    createSubcategory: (categoryId: string, name: string) =>
      createSubcategoryMutation.mutateAsync({ categoryId, name }),
    isCreatingSubcat: createSubcategoryMutation.isPending,

    toggleSubcategoryVisibility: (id: string, categoryId: string, visible: boolean) =>
      toggleSubcategoryVisibilityMutation.mutateAsync({ id, categoryId, visible }),

    toggleFieldRequired: (id: string, categoryId: string) =>
      toggleFieldRequiredMutation.mutateAsync({ id, categoryId }),

    deleteField: (id: string, categoryId: string) =>
      deleteFieldMutation.mutateAsync({ id, categoryId }),

    createField: (
      categoryId: string,
      name: string,
      type: string,
      config?: {
        options?: string[];
        placeholder?: string;
        min?: number;
        max?: number;
        maxSize?: string;
        allowedFormats?: string[];
      }
    ) =>
      createFieldMutation.mutateAsync({ categoryId, name, type, config }),
  };
};

export default useServiceManagement;
