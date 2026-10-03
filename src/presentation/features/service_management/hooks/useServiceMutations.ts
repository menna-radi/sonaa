import { useState } from 'react';
import { useDependencies } from '../../../../core/di/DependencyProvider';
import { queryKeys } from '../../../../core/query/queryKeys';
import { unwrap } from '../../../../core/query/unwrap';
import { useAdminMutation } from '../../../../core/query/useAdminMutation';
import { errorMessage } from '../../../../core/errors/errorMessage';
import { useLanguage } from '../../../context/LanguageContext';
import { useToast } from '../../../components/ui';
import type {
  CategoryInput,
  SubcategoryInput,
  FieldInput,
} from '../../../../domain/repositories/CategoryRepository';

const invalidate = [queryKeys.categories.all];

/** `PUT /admin/categories/subcategories/:id` is optional; once it 404s we stop offering it for the session. */
let subcategoryEditSupported = true;

const isNotFound = (e: unknown): boolean => (e as { code?: string } | undefined)?.code === 'NOT_FOUND_ERROR';

export const useCategoryActions = () => {
  const { dependencies } = useDependencies();
  const repo = dependencies.categoryRepository;

  const save = useAdminMutation({
    mutationFn: async ({ id, input }: { id?: string; input: CategoryInput }): Promise<void> => {
      if (id) {
        unwrap(await repo.updateCategory(id, { nameEn: input.nameEn, nameAr: input.nameAr, nameHe: input.nameHe }));
      } else {
        unwrap(await repo.addCategory(input));
      }
    },
    invalidate,
    successKey: 'categories_toast_saved',
  });

  const setVisible = useAdminMutation({
    mutationFn: ({ id, visible }: { id: string; visible: boolean }) =>
      repo.updateCategoryVisibility(id, visible).then(unwrap),
    invalidate,
    successKey: 'categories_toast_updated',
  });

  return { save, setVisible };
};

export const useSubcategoryActions = () => {
  const { dependencies } = useDependencies();
  const repo = dependencies.categoryRepository;
  const { t } = useLanguage();
  const { error } = useToast();
  const [canEdit, setCanEdit] = useState(subcategoryEditSupported);

  const add = useAdminMutation({
    mutationFn: ({ categoryId, input }: { categoryId: string; input: SubcategoryInput }) =>
      repo.addSubcategory(categoryId, input).then(unwrap),
    invalidate,
    successKey: 'subcats_toast_added',
  });

  const setVisible = useAdminMutation({
    mutationFn: ({ id, visible }: { id: string; visible: boolean }) =>
      repo.updateSubcategoryVisibility(id, visible).then(unwrap),
    invalidate,
    successKey: 'categories_toast_updated',
  });

  const move = useAdminMutation({
    mutationFn: ({ id, targetCategoryId }: { id: string; targetCategoryId: string }) =>
      repo.moveSubcategory(id, targetCategoryId).then(unwrap),
    invalidate,
    successKey: 'subcats_toast_moved',
  });

  const edit = useAdminMutation({
    mutationFn: ({ id, input }: { id: string; input: SubcategoryInput }) =>
      repo.updateSubcategory(id, input).then(unwrap),
    invalidate,
    successKey: 'subcats_toast_saved',
    silentError: true,
  });

  /** Resolves true on success. A 404 hides the edit buttons for the rest of the session. */
  const editSubcategory = async (id: string, input: SubcategoryInput): Promise<boolean> => {
    try {
      await edit.mutateAsync({ id, input });
      return true;
    } catch (e) {
      if (isNotFound(e)) {
        subcategoryEditSupported = false;
        setCanEdit(false);
        error(t('err_not_found'));
      } else {
        error(errorMessage(e, t));
      }
      return false;
    }
  };

  return { add, setVisible, move, edit, editSubcategory, canEdit, editPending: edit.isPending };
};

export const useFieldActions = () => {
  const { dependencies } = useDependencies();
  const repo = dependencies.categoryRepository;

  const add = useAdminMutation({
    mutationFn: ({ categoryId, input }: { categoryId: string; input: FieldInput }) =>
      repo.addField(categoryId, input).then(unwrap),
    invalidate,
    successKey: 'fields_toast_added',
  });

  const toggleRequired = useAdminMutation({
    mutationFn: (id: string) => repo.toggleFieldRequired(id).then(unwrap),
    invalidate,
  });

  const remove = useAdminMutation({
    mutationFn: (id: string) => repo.deleteField(id).then(unwrap),
    invalidate,
    successKey: 'fields_toast_deleted',
  });

  return { add, toggleRequired, remove };
};
