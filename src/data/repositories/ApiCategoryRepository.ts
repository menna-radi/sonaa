import {
  CategoryRepository,
  CategoryInput,
  SubcategoryInput,
  FieldInput,
} from '../../domain/repositories/CategoryRepository';
import { Category, Subcategory, FormField } from '../../domain/entities/Category';
import { Result, ok, fail } from '../../core/result/Result';
import { apiClient } from '../../core/network/apiClient';
import { API_ENDPOINTS } from '../../core/config/apiEndpoints';
import { CategoryMapper } from '../mappers/CategoryMapper';
import { AppError } from '../../core/errors/AppError';

interface RawCategory {
  id: string;
  key?: string;
  nameEn?: string;
  name?: string;
  nameAr?: string;
  nameHe?: string | null;
  isActive?: boolean;
  taskVolume?: number;
  _count?: { subCategories?: number };
  subCategories?: unknown[];
}

interface RawSubcategory {
  id: string;
  categoryId: string;
  nameEn?: string;
  name?: string;
  nameAr?: string;
  nameHe?: string | null;
  imageUrl?: string | null;
  isActive?: boolean;
  tasksCount?: number;
}

interface RawField {
  id: string;
  categoryId: string;
  label: string;
  fieldKey?: string;
  fieldType?: string;
  options?: string[] | null;
  isRequired?: boolean;
}

type ListResponse<T> = T[] | { categories?: T[]; items?: T[]; subcategories?: T[] };

const unwrapList = <T>(response: ListResponse<T>): T[] =>
  Array.isArray(response)
    ? response
    : response.categories || response.items || response.subcategories || [];

const toCategory = (dto: RawCategory): Category => ({
  ...CategoryMapper.toDomain(dto),
  key: dto.key,
  nameHe: dto.nameHe || undefined,
  taskVolume: Number(dto.taskVolume) || 0,
  isActive: dto.isActive !== false,
});

const toSubcategory = (dto: RawSubcategory): Subcategory => ({
  ...CategoryMapper.subToDomain(dto),
  nameHe: dto.nameHe || undefined,
  imageUrl: dto.imageUrl || undefined,
});

const toField = (f: RawField): FormField => ({
  id: f.id,
  categoryId: f.categoryId,
  name: f.label,
  nameAr: f.label,
  type: f.fieldType || 'text',
  required: !!f.isRequired,
  fieldKey: f.fieldKey,
  options: f.options || undefined,
});

const FIELD_TYPES = ['text', 'number', 'select', 'textarea', 'image'] as const;

export class ApiCategoryRepository implements CategoryRepository {
  public async getCategories(): Promise<Result<Category[]>> {
    try {
      const response = await apiClient.get<ListResponse<RawCategory>>(API_ENDPOINTS.categories.list);
      return ok(unwrapList(response).map(toCategory));
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async createCategory(name: string, description: string): Promise<Result<Category>> {
    return this.addCategory({
      key: name.toUpperCase().replace(/[^A-Z0-9]/g, '_'),
      nameEn: name,
      nameAr: description || name,
    });
  }

  public async addCategory(input: CategoryInput): Promise<Result<Category>> {
    try {
      const response = await apiClient.post<RawCategory>(API_ENDPOINTS.categories.create, input);
      return ok(toCategory(response));
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async updateCategory(id: string, input: Omit<CategoryInput, 'key'>): Promise<Result<boolean>> {
    try {
      await apiClient.put<unknown>(API_ENDPOINTS.categories.update(id), input);
      return ok(true);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async updateCategoryVisibility(id: string, visible: boolean): Promise<Result<Category>> {
    try {
      await apiClient.put<unknown>(API_ENDPOINTS.categories.updateVisibility(id), { visible });
      const categoriesResult = await this.getCategories();
      const found = categoriesResult.success ? categoriesResult.data.find((c) => c.id === id) : undefined;
      if (found) return ok(found);
      return ok({
        id,
        name: '',
        nameAr: '',
        description: '',
        descriptionAr: '',
        subcategoriesCount: 0,
        status: visible ? 'Active' : 'Hidden',
        requestVolume: 'Low',
        iconName: '',
        visible,
        isActive: visible,
      });
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async getSubcategories(categoryId: string): Promise<Result<Subcategory[]>> {
    try {
      const response = await apiClient.get<ListResponse<RawSubcategory>>(
        API_ENDPOINTS.categories.subcategories(categoryId)
      );
      return ok(unwrapList(response).map(toSubcategory));
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async createSubcategory(categoryId: string, name: string): Promise<Result<Subcategory>> {
    return this.addSubcategory(categoryId, { nameEn: name, nameAr: name });
  }

  public async addSubcategory(categoryId: string, input: SubcategoryInput): Promise<Result<Subcategory>> {
    try {
      const response = await apiClient.post<RawSubcategory>(
        API_ENDPOINTS.categories.createSubcategory(categoryId),
        input
      );
      return ok(toSubcategory(response));
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async updateSubcategory(id: string, input: SubcategoryInput): Promise<Result<boolean>> {
    try {
      await apiClient.put<unknown>(`/admin/categories/subcategories/${id}`, input);
      return ok(true);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async updateSubcategoryVisibility(id: string, visible: boolean): Promise<Result<Subcategory>> {
    try {
      await apiClient.put<unknown>(API_ENDPOINTS.categories.subcategoryVisibility(id), { visible });
      return ok({
        id,
        categoryId: '',
        name: '',
        nameAr: '',
        status: visible ? 'Active' : 'Hidden',
        requestCount: '0',
        visible,
      });
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async getFormFields(categoryId: string): Promise<Result<FormField[]>> {
    try {
      const response = await apiClient.get<RawField[]>(API_ENDPOINTS.categories.fields(categoryId));
      return ok((response || []).map(toField));
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async createField(
    categoryId: string,
    name: string,
    type: string,
    config?: { options?: string[] }
  ): Promise<Result<FormField>> {
    return this.addField(categoryId, {
      label: name,
      fieldKey: name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      fieldType: FIELD_TYPES.find((x) => x === type) ?? 'text',
      options: config?.options,
      isRequired: false,
    });
  }

  public async addField(categoryId: string, input: FieldInput): Promise<Result<FormField>> {
    try {
      const response = await apiClient.post<RawField>(API_ENDPOINTS.categories.createField(categoryId), {
        ...input,
        options: input.options && input.options.length ? input.options : null,
      });
      return ok(toField(response));
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async toggleFieldRequired(id: string): Promise<Result<FormField>> {
    try {
      const response = await apiClient.post<RawField>(API_ENDPOINTS.categories.toggleFieldRequired(id));
      return ok(toField(response));
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async deleteField(id: string): Promise<Result<boolean>> {
    try {
      await apiClient.delete<unknown>(API_ENDPOINTS.categories.deleteField(id));
      return ok(true);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async moveSubcategory(id: string, targetCategoryId: string): Promise<Result<boolean>> {
    try {
      await apiClient.put<unknown>(API_ENDPOINTS.categories.moveSubcategory(id), { targetCategoryId });
      return ok(true);
    } catch (error) {
      return fail(error as AppError);
    }
  }
}
export default ApiCategoryRepository;
