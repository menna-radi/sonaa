import { Category, Subcategory, FormField } from '../entities/Category';
import { Result } from '../../core/result/Result';

export interface CategoryRepository {
  getCategories(): Promise<Result<Category[]>>;
  createCategory(name: string, description: string): Promise<Result<Category>>;
  updateCategoryVisibility(id: string, visible: boolean): Promise<Result<Category>>;
  getSubcategories(categoryId: string): Promise<Result<Subcategory[]>>;
  createSubcategory(categoryId: string, name: string): Promise<Result<Subcategory>>;
  updateSubcategoryVisibility(id: string, visible: boolean): Promise<Result<Subcategory>>;
  getFormFields(categoryId: string): Promise<Result<FormField[]>>;
  createField(
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
  ): Promise<Result<FormField>>;
  toggleFieldRequired(id: string): Promise<Result<FormField>>;
  deleteField(id: string): Promise<Result<boolean>>;
  moveSubcategory(id: string, targetCategoryId: string): Promise<Result<boolean>>;
}
