import { z } from 'zod';
import { CategoryRepository } from '../../repositories/CategoryRepository';
import { Category } from '../../entities/Category';
import { Result, fail } from '../../../core/result/Result';
import { ValidationError } from '../../../core/errors/AppError';

const createCategorySchema = z.object({
  name: z.string().min(2, { message: 'Category name must be at least 2 characters long' }),
  description: z.string().min(5, { message: 'Category description must be at least 5 characters long' }),
});

export class CreateCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  public async execute(name: string, description: string): Promise<Result<Category>> {
    // 1. Zod Validation
    const validationResult = createCategorySchema.safeParse({ name, description });

    if (!validationResult.success) {
      const fieldErrors = validationResult.error.issues.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      return fail(new ValidationError('Invalid category data', fieldErrors));
    }

    // 2. Repository Execution
    return this.categoryRepository.createCategory(name, description);
  }
}
