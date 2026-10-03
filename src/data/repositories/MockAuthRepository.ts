import { User } from '../../domain/entities/User';
import type { AuthRepository } from '../../domain/repositories/AuthRepository';
import { Result, ok, fail } from '../../core/result/Result';
import { ValidationError } from '../../core/errors/AppError';
import { storageService } from '../../core/storage/StorageService';

export class MockAuthRepository implements AuthRepository {
  private mockUser: User = {
    id: 'sonaa-admin',
    email: 'admin@sonaa.com',
    name: 'Sonaa Admin',
    role: 'Admin',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
  };

  public async login(email: string, password: string): Promise<Result<User>> {
    await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate delay
    
    if (email === 'admin@sonaa.com' && password === 'admin123') {
      storageService.setToken('mock-jwt-token-12345');
      return ok(this.mockUser);
    }
    
    return fail(new ValidationError('Invalid email or password', [
      { field: 'email', message: 'Invalid credentials' }
    ]));
  }

  public async logout(): Promise<Result<void>> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    storageService.clearToken();
    return ok(undefined);
  }

  public async getCurrentUser(): Promise<Result<User | null>> {
    const token = storageService.getToken();
    if (!token) return ok(null);
    
    // Simulate lookup latency
    await new Promise((resolve) => setTimeout(resolve, 200));
    return ok(this.mockUser);
  }

  public async changePassword(oldPassword: string): Promise<Result<void>> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    if (oldPassword !== 'admin123') {
      return fail(new ValidationError('Current password is incorrect', [
        { field: 'oldPassword', message: 'Current password is incorrect' }
      ]));
    }
    return ok(undefined);
  }
}
export default MockAuthRepository;
