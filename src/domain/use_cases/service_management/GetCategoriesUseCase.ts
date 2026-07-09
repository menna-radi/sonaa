import { CategoryRepository } from '../../repositories/CategoryRepository';
import { Category } from '../../entities/Category';
import { Result } from '../../../core/result/Result';

export class GetCategoriesUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  public async execute(): Promise<Result<Category[]>> {
    return this.categoryRepository.getCategories();
  }
}
