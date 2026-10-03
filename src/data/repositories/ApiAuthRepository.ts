import { AuthRepository } from '../../domain/repositories/AuthRepository';
import { User } from '../../domain/entities/User';
import { Result, ok, fail } from '../../core/result/Result';
import { apiClient } from '../../core/network/apiClient';
import { API_ENDPOINTS } from '../../core/config/apiEndpoints';
import { AppError } from '../../core/errors/AppError';
import { storageService } from '../../core/storage/StorageService';

interface MeResponse {
  id: string;
  email?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  avatarUrl?: string;
}

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
      if (response.refreshToken) {
        storageService.setRefreshToken(response.refreshToken);
      }

      const domainUser: User = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name || `${response.user.firstName || ''} ${response.user.lastName || ''}`.trim() || response.user.username || response.user.email,
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
      const refreshToken = storageService.getRefreshToken();
      await apiClient.post<void>(API_ENDPOINTS.auth.logout, { refreshToken });
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

      const cachedUser = storageService.get<User>('cached_user');

      try {
        const response = await apiClient.get<MeResponse>(API_ENDPOINTS.auth.me);

        const domainUser: User = {
          id: response.id,
          email: response.email || '',
          name: response.name || `${response.firstName ?? ''} ${response.lastName ?? ''}`.trim(),
          role: response.role,
          avatarUrl: response.avatarUrl || '',
        };

        storageService.set<User>('cached_user', domainUser);
        return ok(domainUser);
      } catch (err: unknown) {
        // If cached user exists and request failed (network/server temporary error), preserve session
        if (cachedUser) {
          return ok(cachedUser);
        }
        throw err;
      }
    } catch {
      storageService.clearToken();
      storageService.remove('cached_user');
      return ok(null);
    }
  }

  public async changePassword(oldPassword: string, newPassword: string): Promise<Result<void>> {
    try {
      await apiClient.post('/auth/change-password', {
        oldPassword,
        newPassword,
        currentRefreshToken: storageService.getRefreshToken(),
      });
      return ok(undefined);
    } catch (error) {
      return fail(error as AppError);
    }
  }
}
export default ApiAuthRepository;

