export interface CategoryDTO {
  id: string;
  key: string;
  nameEn: string;
  nameAr: string;
  createdAt?: string;
}

export interface SubcategoryDTO {
  id: string;
  categoryId: string;
  nameEn: string;
  nameAr: string;
  imageUrl?: string;
  createdAt?: string;
}

export interface SubcategoriesListResponse {
  results: SubcategoryDTO[];
  total: number;
  page: number;
  limit: number;
}

export interface FormFieldDTO {
  field_id: string;
  parent_category_id: string;
  label_en: string;
  label_ar: string;
  input_type: string;
  is_required: boolean;
}
