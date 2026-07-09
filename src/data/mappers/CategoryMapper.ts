import { CategoryDTO, SubcategoryDTO, FormFieldDTO } from '../dto/CategoryDTO';
import { Category, Subcategory, FormField } from '../../domain/entities/Category';

export class CategoryMapper {
  public static toDomain(dto: CategoryDTO): Category {
    return {
      id: dto.id,
      name: dto.nameEn,
      nameAr: dto.nameAr,
      description: dto.key,
      descriptionAr: '',
      subcategoriesCount: 0, // Not returned by backend category object
      status: 'Active',
      requestVolume: 'Medium',
      iconName: dto.nameEn,
      visible: true,
      hasStar: false,
    };
  }

  public static toDTO(entity: Category): CategoryDTO {
    return {
      id: entity.id,
      key: entity.description || entity.name.toUpperCase().replace(/[^A-Z0-9]/g, '_'),
      nameEn: entity.name,
      nameAr: entity.nameAr,
    };
  }

  public static subToDomain(dto: SubcategoryDTO): Subcategory {
    return {
      id: dto.id,
      categoryId: dto.categoryId,
      name: dto.nameEn,
      nameAr: dto.nameAr,
      status: 'Active',
      requestCount: '0',
      visible: true,
    };
  }

  public static subToDTO(entity: Subcategory): SubcategoryDTO {
    return {
      id: entity.id,
      categoryId: entity.categoryId,
      nameEn: entity.name,
      nameAr: entity.nameAr,
      imageUrl: '',
    };
  }

  public static fieldToDomain(dto: FormFieldDTO): FormField {
    return {
      id: dto.field_id,
      categoryId: dto.parent_category_id,
      name: dto.label_en,
      nameAr: dto.label_ar,
      type: dto.input_type,
      required: dto.is_required,
    };
  }

  public static fieldToDTO(entity: FormField): FormFieldDTO {
    return {
      field_id: entity.id,
      parent_category_id: entity.categoryId,
      label_en: entity.name,
      label_ar: entity.nameAr,
      input_type: entity.type,
      is_required: entity.required,
    };
  }
}
export default CategoryMapper;
