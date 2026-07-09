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

  private mockAdmins: User[] = [
    { id: 'u1', name: 'Sarah Jenkins', email: 'sarah.j@sonaa.sa', role: 'Super Admin', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80' },
    { id: 'u2', name: 'Mike Ross', email: 'mike.r@sonaa.sa', role: 'Super Admin', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80' },
    { id: 'u3', name: 'John Doe', email: 'john.d@sonaa.sa', role: 'Operations Lead', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80' },
    { id: 'u4', name: 'Rachel Zane', email: 'rachel.z@sonaa.sa', role: 'Operations Lead', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80' },
    { id: 'u5', name: 'Emma Watson', email: 'emma.w@sonaa.sa', role: 'Moderator', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80' },
    { id: 'u6', name: 'Harvey Specter', email: 'harvey.s@sonaa.sa', role: 'Moderator', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80' },
    { id: 'u7', name: 'Donna Paulsen', email: 'donna.p@sonaa.sa', role: 'Finance', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80' },
    { id: 'u8', name: 'Louis Litt', email: 'louis.l@sonaa.sa', role: 'Finance', avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=100&q=80' },
    { id: 'u9', name: 'Jessica Pearson', email: 'jessica.p@sonaa.sa', role: 'Support Agent', avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80' }
  ];

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

  public async getAdmins(): Promise<Result<User[]>> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return ok(this.mockAdmins);
  }

  public async createAdmin(name: string, email: string, role: string, avatarUrl?: string): Promise<Result<User>> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const newAdmin: User = {
      id: `u-${Date.now()}`,
      name,
      email,
      role,
      avatarUrl: avatarUrl || `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 900000)}?auto=format&fit=crop&w=100&q=80`,
    };
    this.mockAdmins.push(newAdmin);
    return ok(newAdmin);
  }
}
export default MockAuthRepository;
