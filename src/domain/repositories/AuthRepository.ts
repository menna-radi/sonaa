import { User } from '../entities/User';
import { Result } from '../../core/result/Result';

export interface AuthRepository {
  login(email: string, password: string): Promise<Result<User>>;
  logout(): Promise<Result<void>>;
  getCurrentUser(): Promise<Result<User | null>>;
  getAdmins(): Promise<Result<User[]>>;
  createAdmin(name: string, email: string, role: string, avatarUrl?: string): Promise<Result<User>>;
}
