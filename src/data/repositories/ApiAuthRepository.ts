import { AuthRepository } from '../../domain/repositories/AuthRepository';
import { User } from '../../domain/entities/User';
import { Result, ok, fail } from '../../core/result/Result';
import { apiClient } from '../../core/network/apiClient';
import { API_ENDPOINTS } from '../../core/config/apiEndpoints';
import { UserMapper } from '../mappers/UserMapper';
import { UserDTO } from '../dto/UserDTO';
import { ApiResponse } from '../../core/network/ApiResponse';
import { AppError, UnknownError } from '../../core/errors/AppError';
import { storageService } from '../../core/storage/StorageService';

interface LoginResponse {
  token: string;
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    name: string;
    username: string;
    email: string;
    emailVerified: boolean;
    phone: string | null;
    phoneNumber: string | null;
    role: string;
    isProfileCompleted: boolean;
  };
}

export class ApiAuthRepository implements AuthRepository {
  public async login(email: string, pass: string): Promise<Result<User>> {
    try {
      const response = await apiClient.post<LoginResponse>(API_ENDPOINTS.auth.login, {
        identifier: email,
        password: pass,
      });

      // Extract token from response payload and persist in StorageService
      const token = response.token || response.accessToken;
      if (token) {
        storageService.setToken(token);
      }

      const domainUser: User = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        role: response.user.role,
        avatarUrl: '', // Avatar not provided in raw login response fields, fallback to empty string
      };

      storageService.set<User>('cached_user', domainUser);

      return ok(domainUser);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async logout(): Promise<Result<void>> {
    try {
      await apiClient.post<void>(API_ENDPOINTS.auth.logout);
      storageService.clearToken();
      storageService.remove('cached_user');
      return ok(undefined);
    } catch (error) {
      storageService.clearToken(); // Always clear token on logout
      storageService.remove('cached_user');
      return fail(error as AppError);
    }
  }

  public async getCurrentUser(): Promise<Result<User | null>> {
    try {
      const token = storageService.getToken();
      if (!token) return ok(null);

      // In API mode, /auth/me is missing. We load cached user from storage
      const cached = storageService.get<User>('cached_user');
      if (cached) {
        return ok(cached);
      }

      return ok(null);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async getAdmins(): Promise<Result<User[]>> {
    return fail(new UnknownError('Feature not supported by the backend yet'));
  }

  public async createAdmin(_name: string, _email: string, _role: string, _avatarUrl?: string): Promise<Result<User>> {
    return fail(new UnknownError('Feature not supported by the backend yet'));
  }
}
export default ApiAuthRepository;

