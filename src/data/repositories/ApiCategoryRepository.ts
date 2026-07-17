import { CategoryRepository } from '../../domain/repositories/CategoryRepository';
import { Category, Subcategory, FormField } from '../../domain/entities/Category';
import { Result, ok, fail } from '../../core/result/Result';
import { apiClient } from '../../core/network/apiClient';
import { API_ENDPOINTS } from '../../core/config/apiEndpoints';
import { CategoryMapper } from '../mappers/CategoryMapper';
import { CategoryDTO, SubcategoryDTO, SubcategoriesListResponse, FormFieldDTO } from '../dto/CategoryDTO';
import { AppError, UnknownError } from '../../core/errors/AppError';

export class ApiCategoryRepository implements CategoryRepository {
  public async getCategories(): Promise<Result<Category[]>> {
    try {
      const response = await apiClient.get<any>(API_ENDPOINTS.admin.categories);
      const domainCategories = (response || []).map((dto: any) => CategoryMapper.toDomain(dto));
      return ok(domainCategories);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async createCategory(name: string, description: string): Promise<Result<Category>> {
    try {
      const key = name.toUpperCase().replace(/[^A-Z0-9]/g, '_');
      const response = await apiClient.post<any>(API_ENDPOINTS.admin.categories, {
        key,
        nameEn: name,
        nameAr: name,
      });
      return ok(CategoryMapper.toDomain(response));
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async updateCategoryVisibility(id: string, visible: boolean): Promise<Result<Category>> {
    try {
      await apiClient.put<any>(
        API_ENDPOINTS.categories.updateVisibility(id),
        { visible }
      );
      const categoriesResult = await this.getCategories();
      if (categoriesResult.success) {
        const found = categoriesResult.data.find(c => c.id === id);
        if (found) return ok(found);
      }
      
      const fallback: Category = {
        id,
        name: 'Category',
        nameAr: '',
        description: '',
        descriptionAr: '',
        subcategoriesCount: 0,
        status: visible ? 'Active' : 'Hidden',
        requestVolume: 'Low',
        iconName: '',
        visible,
        hasStar: false,
      };
      return ok(fallback);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async getSubcategories(categoryId: string): Promise<Result<Subcategory[]>> {
    try {
      const response = await apiClient.get<any>(
        API_ENDPOINTS.admin.subcategories(categoryId)
      );
      const domainSubs = (response.items || []).map((dto: any) => CategoryMapper.subToDomain(dto));
      return ok(domainSubs);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async createSubcategory(categoryId: string, name: string): Promise<Result<Subcategory>> {
    try {
      const response = await apiClient.post<any>(
        API_ENDPOINTS.admin.createSubcategory(categoryId),
        {
          nameEn: name,
          nameAr: name,
          imageUrl: '',
        }
      );
      return ok(CategoryMapper.subToDomain(response));
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async updateSubcategoryVisibility(id: string, visible: boolean): Promise<Result<Subcategory>> {
    try {
      await apiClient.put<any>(
        API_ENDPOINTS.categories.subcategoryVisibility(id),
        { visible }
      );
      const sub: Subcategory = {
        id,
        categoryId: '',
        name: 'Subcategory',
        nameAr: '',
        status: visible ? 'Active' : 'Hidden',
        requestCount: '0',
        visible,
      };
      return ok(sub);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  private mapBackendFieldToDomain(f: any): FormField {
    return {
      id: f.id,
      categoryId: f.categoryId,
      name: f.label,
      nameAr: f.label,
      type: f.fieldType || 'text',
      required: !!f.isRequired,
    };
  }

  public async getFormFields(categoryId: string): Promise<Result<FormField[]>> {
    try {
      const response = await apiClient.get<any[]>(
        API_ENDPOINTS.categories.fields(categoryId)
      );
      const fields = (response || []).map(f => this.mapBackendFieldToDomain(f));
      return ok(fields);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async createField(
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
  ): Promise<Result<FormField>> {
    try {
      const fieldKey = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const response = await apiClient.post<any>(
        API_ENDPOINTS.categories.createField(categoryId),
        {
          label: name,
          fieldKey,
          fieldType: type,
          options: config?.options || null,
          isRequired: false,
        }
      );
      return ok(this.mapBackendFieldToDomain(response));
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async toggleFieldRequired(id: string): Promise<Result<FormField>> {
    try {
      const response = await apiClient.post<any>(
        API_ENDPOINTS.categories.toggleFieldRequired(id)
      );
      return ok(this.mapBackendFieldToDomain(response));
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async deleteField(id: string): Promise<Result<boolean>> {
    try {
      await apiClient.delete<any>(
        API_ENDPOINTS.categories.deleteField(id)
      );
      return ok(true);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async moveSubcategory(id: string, targetCategoryId: string): Promise<Result<boolean>> {
    try {
      await apiClient.put<any>(
        API_ENDPOINTS.categories.moveSubcategory(id),
        { targetCategoryId }
      );
      return ok(true);
    } catch (error) {
      return fail(error as AppError);
    }
  }
}
export default ApiCategoryRepository;
