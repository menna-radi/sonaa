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

      const response = await apiClient.get<any>(API_ENDPOINTS.auth.me);
      
      const domainUser: User = {
        id: response.id,
        email: response.email || '',
        name: response.name || `${response.firstName} ${response.lastName}`.trim(),
        role: response.role,
        avatarUrl: response.avatarUrl || '',
      };

      storageService.set<User>('cached_user', domainUser);
      return ok(domainUser);
    } catch (error) {
      storageService.clearToken();
      storageService.remove('cached_user');
      return ok(null);
    }
  }

  public async getAdmins(): Promise<Result<User[]>> {
    try {
      const response = await apiClient.get<any[]>('/admin/roles/users');
      const mapped: User[] = response.map((user) => ({
        id: user.id,
        email: user.email || '',
        name: `${user.firstName} ${user.lastName}`.trim(),
        role: user.role,
        avatarUrl: '',
      }));
      return ok(mapped);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async createAdmin(name: string, email: string, role: string, _avatarUrl?: string): Promise<Result<User>> {
    try {
      const nameParts = name.trim().split(/\s+/);
      const firstName = nameParts[0] || 'Admin';
      const lastName = nameParts.slice(1).join(' ') || 'User';
      const username = `admin_${email.split('@')[0]}_${Date.now().toString().slice(-4)}`;
      
      const response = await apiClient.post<any>('/admin/roles/users', {
        username,
        email,
        password: 'Password123!',
        firstName,
        lastName,
        role: 'ADMIN',
      });

      const domainUser: User = {
        id: response.id,
        email: response.email,
        name: `${response.firstName} ${response.lastName}`.trim(),
        role: response.role,
        avatarUrl: '',
      };
      return ok(domainUser);
    } catch (error) {
      return fail(error as AppError);
    }
  }
}
export default ApiAuthRepository;

