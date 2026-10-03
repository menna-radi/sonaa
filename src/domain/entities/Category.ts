export interface Category {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  subcategoriesCount: number;
  status: 'Active' | 'Hidden' | 'Archived';
  requestVolume: string;
  iconName: string;
  visible: boolean;
  hasStar?: boolean;
  /** Backend key (immutable, set on create). */
  key?: string;
  nameHe?: string;
  /** Real task count from the backend. */
  taskVolume?: number;
  isActive?: boolean;
}

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  nameAr: string;
  status: 'Active' | 'Hidden';
  requestCount: string;
  visible: boolean;
  nameHe?: string;
  imageUrl?: string;
}

export interface FormField {
  id: string;
  categoryId: string;
  name: string;
  nameAr: string;
  type: string;
  required: boolean;
  fieldKey?: string;
  options?: string[];
  placeholder?: string;
  min?: number;
  max?: number;
  maxSize?: string;
  allowedFormats?: string[];
}
