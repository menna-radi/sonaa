import { AuthRepository } from '../../repositories/AuthRepository';
import { Result } from '../../../core/result/Result';

export class LogoutUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  public async execute(): Promise<Result<void>> {
    return this.authRepository.logout();
  }
}
