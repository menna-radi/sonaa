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
      const response = await apiClient.get<CategoryDTO[]>(API_ENDPOINTS.admin.categories);
      const domainCategories = response.map(dto => CategoryMapper.toDomain(dto));
      return ok(domainCategories);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async createCategory(name: string, description: string): Promise<Result<Category>> {
    try {
      const key = name.toUpperCase().replace(/[^A-Z0-9]/g, '_');
      const response = await apiClient.post<CategoryDTO>(API_ENDPOINTS.admin.categories, {
        key,
        nameEn: name,
        nameAr: name, // Fallback to English name since UI only collects name
      });
      return ok(CategoryMapper.toDomain(response));
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async updateCategoryVisibility(_id: string, _visible: boolean): Promise<Result<Category>> {
    return fail(new UnknownError('Feature not supported by the backend yet'));
  }

  public async getSubcategories(categoryId: string): Promise<Result<Subcategory[]>> {
    try {
      const response = await apiClient.get<SubcategoriesListResponse>(
        API_ENDPOINTS.admin.subcategories(categoryId)
      );
      const domainSubs = response.results.map(dto => CategoryMapper.subToDomain(dto));
      return ok(domainSubs);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async createSubcategory(categoryId: string, name: string): Promise<Result<Subcategory>> {
    try {
      const response = await apiClient.post<SubcategoryDTO>(
        API_ENDPOINTS.admin.createSubcategory(categoryId),
        {
          nameEn: name,
          nameAr: name, // Fallback to English name since UI only collects name
          imageUrl: '',
        }
      );
      return ok(CategoryMapper.subToDomain(response));
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async updateSubcategoryVisibility(_id: string, _visible: boolean): Promise<Result<Subcategory>> {
    return fail(new UnknownError('Feature not supported by the backend yet'));
  }

  public async getFormFields(_categoryId: string): Promise<Result<FormField[]>> {
    return fail(new UnknownError('Feature not supported by the backend yet'));
  }

  public async createField(
    _categoryId: string,
    _name: string,
    _type: string,
    _config?: {
      options?: string[];
      placeholder?: string;
      min?: number;
      max?: number;
      maxSize?: string;
      allowedFormats?: string[];
    }
  ): Promise<Result<FormField>> {
    return fail(new UnknownError('Feature not supported by the backend yet'));
  }

  public async toggleFieldRequired(_id: string): Promise<Result<FormField>> {
    return fail(new UnknownError('Feature not supported by the backend yet'));
  }

  public async deleteField(_id: string): Promise<Result<boolean>> {
    return fail(new UnknownError('Feature not supported by the backend yet'));
  }

  public async moveSubcategory(_id: string, _targetCategoryId: string): Promise<Result<boolean>> {
    return fail(new UnknownError('Feature not supported by the backend yet'));
  }
}
export default ApiCategoryRepository;
