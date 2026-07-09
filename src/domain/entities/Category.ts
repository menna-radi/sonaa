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
}

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  nameAr: string;
  status: 'Active' | 'Hidden';
  requestCount: string;
  visible: boolean;
}

export interface FormField {
  id: string;
  categoryId: string;
  name: string;
  nameAr: string;
  type: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
  min?: number;
  max?: number;
  maxSize?: string;
  allowedFormats?: string[];
}
