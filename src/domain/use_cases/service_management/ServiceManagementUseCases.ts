import { CategoryRepository } from '../../repositories/CategoryRepository';
import { Category, Subcategory, FormField } from '../../entities/Category';
import { Result } from '../../../core/result/Result';

export class UpdateCategoryVisibilityUseCase {
  constructor(private readonly repository: CategoryRepository) { }
  public async execute(id: string, visible: boolean): Promise<Result<Category>> {
    return this.repository.updateCategoryVisibility(id, visible);
  }
}

export class GetSubcategoriesUseCase {
  constructor(private readonly repository: CategoryRepository) { }
  public async execute(categoryId: string): Promise<Result<Subcategory[]>> {
    return this.repository.getSubcategories(categoryId);
  }
}

export class CreateSubcategoryUseCase {
  constructor(private readonly repository: CategoryRepository) { }
  public async execute(categoryId: string, name: string): Promise<Result<Subcategory>> {
    return this.repository.createSubcategory(categoryId, name);
  }
}

export class UpdateSubcategoryVisibilityUseCase {
  constructor(private readonly repository: CategoryRepository) { }
  public async execute(id: string, visible: boolean): Promise<Result<Subcategory>> {
    return this.repository.updateSubcategoryVisibility(id, visible);
  }
}

export class GetFormFieldsUseCase {
  constructor(private readonly repository: CategoryRepository) { }
  public async execute(categoryId: string): Promise<Result<FormField[]>> {
    return this.repository.getFormFields(categoryId);
  }
}

export class ToggleFieldRequiredUseCase {
  constructor(private readonly repository: CategoryRepository) { }
  public async execute(id: string): Promise<Result<FormField>> {
    return this.repository.toggleFieldRequired(id);
  }
}

export class DeleteFieldUseCase {
  constructor(private readonly repository: CategoryRepository) { }
  public async execute(id: string): Promise<Result<boolean>> {
    return this.repository.deleteField(id);
  }
}

import { z } from 'zod';
import { ValidationError } from '../../../core/errors/AppError';
import { fail } from '../../../core/result/Result';

const createFieldSchema = z.object({
  name: z.string().min(2, { message: 'Field label must be at least 2 characters long' }),
  type: z.string().min(1, { message: 'Field type must be specified' }),
});

export class CreateFieldUseCase {
  constructor(private readonly repository: CategoryRepository) { }
  public async execute(
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
    const validationResult = createFieldSchema.safeParse({ name, type });
    if (!validationResult.success) {
      const fieldErrors = validationResult.error.issues.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      return fail(new ValidationError('Invalid field data', fieldErrors));
    }
    return this.repository.createField(categoryId, name, type, config);
  }
}
