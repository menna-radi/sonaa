import { CategoryRepository } from '../../domain/repositories/CategoryRepository';
import { Category, Subcategory, FormField } from '../../domain/entities/Category';
import { Result, ok, fail } from '../../core/result/Result';
import { NotFoundError } from '../../core/errors/AppError';

export class MockCategoryRepository implements CategoryRepository {
  private categories: Category[] = [
    { id: '1', name: 'Plumbing', nameAr: 'السباكة', description: 'Pipes, leaks, installations', descriptionAr: 'الأنابيب، التسريبات، والتركيبات', subcategoriesCount: 12, status: 'Active', requestVolume: '1,284 req / mo', iconName: 'Plumbing', visible: true, hasStar: true },
    { id: '2', name: 'Electrical', nameAr: 'الكهرباء', description: 'Wiring, fixtures, repairs', descriptionAr: 'الأسلاك، التجهيزات، والإصلاحات', subcategoriesCount: 12, status: 'Active', requestVolume: '956 req / mo', iconName: 'Electrical', visible: true, hasStar: true },
    { id: '3', name: 'Cleaning', nameAr: 'النظافة', description: 'Deep clean, standard, move-in', descriptionAr: 'تنظيف عميق، قياسي، وانتقال', subcategoriesCount: 12, status: 'Active', requestVolume: '2,104 req / mo', iconName: 'Cleaning', visible: true },
    { id: '4', name: 'Carpentry', nameAr: 'النجارة', description: 'Furniture, doors, custom build', descriptionAr: 'الأثاث، الأبواب، والتفصيل', subcategoriesCount: 12, status: 'Active', requestVolume: '432 req / mo', iconName: 'Carpentry', visible: true },
    { id: '5', name: 'Painting', nameAr: 'الدهان', description: 'Interior, exterior, touch-ups', descriptionAr: 'داخلي، خارجي، ولمسات فنية', subcategoriesCount: 12, status: 'Active', requestVolume: '621 req / mo', iconName: 'Painting', visible: true },
    { id: '6', name: 'AC & HVAC', nameAr: 'التكييف والتبريد', description: 'Service, repair, installation', descriptionAr: 'صيانة، إصلاح، وتركيب التكييف', subcategoriesCount: 12, status: 'Hidden', requestVolume: '845 req / mo', iconName: 'AC & HVAC', visible: false },
    { id: '7', name: 'Moving', nameAr: 'نقل الأثاث', description: 'Local, long distance, packing', descriptionAr: 'محلي، مسافات طويلة، وتغليف', subcategoriesCount: 12, status: 'Active', requestVolume: '312 req / mo', iconName: 'Moving', visible: true },
    { id: '8', name: 'Gardening', nameAr: 'العناية بالحدائق', description: 'Landscaping, maintenance', descriptionAr: 'تنسيق الحدائق وصيانتها', subcategoriesCount: 12, status: 'Archived', requestVolume: '120 req / mo', iconName: 'Gardening', visible: false }
  ];

  private subcategories: Subcategory[] = [
    { id: 's1', categoryId: '1', name: 'Leak Repair', nameAr: 'إصلاح التسريبات', status: 'Active', requestCount: '45 req', visible: true },
    { id: 's2', categoryId: '1', name: 'Pipe Installation', nameAr: 'تركيب الأنابيب', status: 'Active', requestCount: '45 req', visible: true },
    { id: 's3', categoryId: '1', name: 'Drain Cleaning', nameAr: 'تسليك المجاري', status: 'Active', requestCount: '45 req', visible: true },
    { id: 's4', categoryId: '1', name: 'Water Heater', nameAr: 'سخانات المياه', status: 'Active', requestCount: '45 req', visible: true },
    { id: 's5', categoryId: '1', name: 'Toilet Repair', nameAr: 'إصلاح المراحيض', status: 'Active', requestCount: '45 req', visible: true },
    { id: 's6', categoryId: '1', name: 'Faucet Installation', nameAr: 'تركيب الصنابير', status: 'Active', requestCount: '45 req', visible: true },
    { id: 's7', categoryId: '1', name: 'Emergency Plumbing', nameAr: 'طوارئ السباكة', status: 'Active', requestCount: '45 req', visible: true },
    { id: 's8', categoryId: '2', name: 'Wiring Repair', nameAr: 'إصلاح الأسلاك', status: 'Active', requestCount: '32 req', visible: true },
    { id: 's9', categoryId: '2', name: 'Outlet Installation', nameAr: 'تركيب المقابس', status: 'Active', requestCount: '28 req', visible: true },
    { id: 's10', categoryId: '2', name: 'Light Fixture', nameAr: 'تركيب الإضاءة', status: 'Active', requestCount: '42 req', visible: true }
  ];

  private fields: FormField[] = [
    { id: 'f1', categoryId: '1', name: 'Leak Type', nameAr: 'نوع التسريب', type: 'Dropdown', required: true },
    { id: 'f2', categoryId: '1', name: 'Pipe Material', nameAr: 'مادة الأنابيب', type: 'Dropdown', required: true },
    { id: 'f3', categoryId: '1', name: 'Emergency Service', nameAr: 'خدمة طوارئ', type: 'Dropdown', required: true },
    { id: 'f4', categoryId: '1', name: 'Budget Estimate', nameAr: 'تقدير الميزانية', type: 'Dropdown', required: false },
    { id: 'f5', categoryId: '1', name: 'Upload Photos', nameAr: 'رفع الصور', type: 'Image Upload', required: false }
  ];

  public async getCategories(): Promise<Result<Category[]>> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return ok([...this.categories]);
  }

  public async createCategory(name: string, description: string): Promise<Result<Category>> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const newCat: Category = {
      id: String(this.categories.length + 1),
      name,
      nameAr: name, // Default fallback
      description,
      descriptionAr: description,
      subcategoriesCount: 0,
      status: 'Active',
      requestVolume: '0 req / mo',
      iconName: 'Plumbing', // Default icon
      visible: true
    };
    this.categories.push(newCat);
    return ok(newCat);
  }

  public async updateCategoryVisibility(id: string, visible: boolean): Promise<Result<Category>> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const idx = this.categories.findIndex(c => c.id === id);
    if (idx === -1) {
      return fail(new NotFoundError(`Category with ID ${id} not found.`));
    }
    this.categories[idx] = {
      ...this.categories[idx],
      visible,
      status: visible ? 'Active' : 'Hidden'
    };
    return ok(this.categories[idx]);
  }

  public async getSubcategories(categoryId: string): Promise<Result<Subcategory[]>> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const filtered = this.subcategories.filter(s => s.categoryId === categoryId);
    return ok(filtered);
  }

  public async createSubcategory(categoryId: string, name: string): Promise<Result<Subcategory>> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const newSub: Subcategory = {
      id: `s${this.subcategories.length + 1}`,
      categoryId,
      name,
      nameAr: name,
      status: 'Active',
      requestCount: '0 req',
      visible: true
    };
    this.subcategories.push(newSub);

    // Increment category subcategories count
    const catIdx = this.categories.findIndex(c => c.id === categoryId);
    if (catIdx !== -1) {
      this.categories[catIdx] = {
        ...this.categories[catIdx],
        subcategoriesCount: this.categories[catIdx].subcategoriesCount + 1
      };
    }

    return ok(newSub);
  }

  public async updateSubcategoryVisibility(id: string, visible: boolean): Promise<Result<Subcategory>> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const idx = this.subcategories.findIndex(s => s.id === id);
    if (idx === -1) {
      return fail(new NotFoundError(`Subcategory with ID ${id} not found.`));
    }
    this.subcategories[idx] = {
      ...this.subcategories[idx],
      visible,
      status: visible ? 'Active' : 'Hidden'
    };
    return ok(this.subcategories[idx]);
  }

  public async getFormFields(categoryId: string): Promise<Result<FormField[]>> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const filtered = this.fields.filter(f => f.categoryId === categoryId);
    return ok(filtered);
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
    await new Promise((resolve) => setTimeout(resolve, 100));
    const newField: FormField = {
      id: `f${this.fields.length + 1}`,
      categoryId,
      name,
      nameAr: name,
      type,
      required: false,
      options: config?.options,
      placeholder: config?.placeholder,
      min: config?.min,
      max: config?.max,
      maxSize: config?.maxSize,
      allowedFormats: config?.allowedFormats
    };
    this.fields.push(newField);
    return ok(newField);
  }

  public async toggleFieldRequired(id: string): Promise<Result<FormField>> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const idx = this.fields.findIndex(f => f.id === id);
    if (idx === -1) {
      return fail(new NotFoundError(`Field with ID ${id} not found.`));
    }
    this.fields[idx] = {
      ...this.fields[idx],
      required: !this.fields[idx].required
    };
    return ok(this.fields[idx]);
  }

  public async deleteField(id: string): Promise<Result<boolean>> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const initialLength = this.fields.length;
    this.fields = this.fields.filter(f => f.id !== id);
    return ok(this.fields.length < initialLength);
  }

  public async moveSubcategory(id: string, targetCategoryId: string): Promise<Result<boolean>> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const idx = this.subcategories.findIndex(s => s.id === id);
    if (idx === -1) {
      return fail(new NotFoundError(`Subcategory with ID ${id} not found.`));
    }
    const oldCatId = this.subcategories[idx].categoryId;
    
    // Update categoryId
    this.subcategories[idx] = {
      ...this.subcategories[idx],
      categoryId: targetCategoryId
    };

    // Update old category subcategories count
    const oldCatIdx = this.categories.findIndex(c => c.id === oldCatId);
    if (oldCatIdx !== -1) {
      this.categories[oldCatIdx] = {
        ...this.categories[oldCatIdx],
        subcategoriesCount: Math.max(0, this.categories[oldCatIdx].subcategoriesCount - 1)
      };
    }

    // Update new category subcategories count
    const newCatIdx = this.categories.findIndex(c => c.id === targetCategoryId);
    if (newCatIdx !== -1) {
      this.categories[newCatIdx] = {
        ...this.categories[newCatIdx],
        subcategoriesCount: this.categories[newCatIdx].subcategoriesCount + 1
      };
    }

    return ok(true);
  }
}
export default MockCategoryRepository;
