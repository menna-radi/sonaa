import { Category, Subcategory, FormField } from '../entities/Category';
import { Result } from '../../core/result/Result';

export interface CategoryInput {
  key: string;
  nameEn: string;
  nameAr: string;
  nameHe?: string;
}

export interface SubcategoryInput {
  nameEn: string;
  nameAr: string;
  nameHe?: string;
  imageUrl?: string;
}

export interface FieldInput {
  label: string;
  fieldKey: string;
  fieldType: 'text' | 'number' | 'select' | 'textarea' | 'image';
  options?: string[];
  isRequired: boolean;
}

export interface CategoryRepository {
  addCategory(input: CategoryInput): Promise<Result<Category>>;
  updateCategory(id: string, input: Omit<CategoryInput, 'key'>): Promise<Result<boolean>>;
  addSubcategory(categoryId: string, input: SubcategoryInput): Promise<Result<Subcategory>>;
  /** Optional on the backend: a NotFoundError means the server does not support it. */
  updateSubcategory(id: string, input: SubcategoryInput): Promise<Result<boolean>>;
  addField(categoryId: string, input: FieldInput): Promise<Result<FormField>>;
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
