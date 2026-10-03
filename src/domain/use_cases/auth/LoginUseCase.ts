import { z } from 'zod';
import { AuthRepository } from '../../repositories/AuthRepository';
import { User } from '../../entities/User';
import { Result, fail } from '../../../core/result/Result';
import { ValidationError } from '../../../core/errors/AppError';

// Validation Schema using Zod
export const loginSchema = z.object({
  email: z.string().trim().min(3, 'val_min_len|3'),
  password: z.string().min(6, 'val_min_len|6'),
});

export class LoginUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  public async execute(email: string, pass: string): Promise<Result<User>> {
    // 1. Validation Layer (Zod)
    const result = loginSchema.safeParse({ email, password: pass });
    
    if (!result.success) {
      const fieldErrors = result.error.issues.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      return fail(new ValidationError('Validation failed', fieldErrors));
    }

    // 2. Business Execution
    return this.authRepository.login(email, pass);
  }
}

export default LoginUseCase;
