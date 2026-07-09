import { AuthRepository } from '../../repositories/AuthRepository';
import { User } from '../../entities/User';
import { Result } from '../../../core/result/Result';

export class GetCurrentUserUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  public async execute(): Promise<Result<User | null>> {
    return this.authRepository.getCurrentUser();
  }
}
