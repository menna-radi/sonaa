import { User } from '../entities/User';
import { Result } from '../../core/result/Result';

export interface AuthRepository {
  login(email: string, password: string): Promise<Result<User>>;
  logout(): Promise<Result<void>>;
  getCurrentUser(): Promise<Result<User | null>>;
  changePassword(oldPassword: string, newPassword: string): Promise<Result<void>>;
}
