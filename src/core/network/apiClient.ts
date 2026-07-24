import axios, { AxiosInstance, AxiosError } from 'axios';
import { ENV } from '../config/env';
import { storageService } from '../storage/StorageService';
import { logger } from '../logger/Logger';
import {
  NetworkError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  TimeoutError,
  ServerError,
  UnknownError,
  AppError,
} from '../errors/AppError';

class ApiClient {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: ENV.API_BASE_URL,
      timeout: ENV.API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to automatically append Bearer token
    this.client.interceptors.request.use(
      (config) => {
        const token = storageService.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        logger.debug(`HTTP Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        return Promise.reject(this.handleError(error));
      }
    );

    // Response interceptor to handle errors and auto-refresh expired tokens
    this.client.interceptors.response.use(
      (response) => {
        logger.debug(`HTTP Response Success: ${response.status} ${response.config.url}`);
        return response;
      },
      async (error) => {
        const originalRequest = error?.config;

        // Intercept 401 Unauthorized errors and attempt transparent refresh token rotation
        if (axios.isAxiosError(error) && error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          const requestUrl = originalRequest.url || '';
          if (!requestUrl.includes('/auth/login') && !requestUrl.includes('/auth/refresh')) {
            originalRequest._retry = true;
            const refreshToken = storageService.getRefreshToken();

            if (refreshToken) {
              try {
                logger.info('Access token expired. Attempting token refresh...');
                const refreshRes = await axios.post<{ token?: string; accessToken?: string; refreshToken?: string }>(
                  `${ENV.API_BASE_URL}/auth/refresh`,
                  { refreshToken }
                );

                const newAccessToken = refreshRes.data.accessToken || refreshRes.data.token;
                if (newAccessToken) {
                  storageService.setToken(newAccessToken);
                  if (refreshRes.data.refreshToken) {
                    storageService.setRefreshToken(refreshRes.data.refreshToken);
                  }

                  // Update header and retry original failed request
                  originalRequest.headers = originalRequest.headers || {};
                  originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                  return this.client(originalRequest);
                }
              } catch (refreshErr) {
                logger.error(`Token refresh attempt failed: ${refreshErr}`);
                storageService.clearToken();
                storageService.remove('cached_user');
              }
            }
          }
        }

        logger.error(`HTTP Response Failure: ${error.message}`);
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: unknown): AppError {
    if (!axios.isAxiosError(error)) {
      return new UnknownError(error instanceof Error ? error.message : 'Unknown system error');
    }

    const axiosError = error as AxiosError<{ message?: string; errors?: Array<{ field: string; message: string }> }>;

    // Timeout
    if (axiosError.code === 'ECONNABORTED' || axiosError.message.includes('timeout')) {
      return new TimeoutError('Request timed out');
    }

    // Network Issue
    if (!axiosError.response) {
      return new NetworkError('Failed to connect to the server');
    }

    const status = axiosError.response.status;
    const responseData = axiosError.response.data;
    const msg = responseData?.message || 'HTTP Request Failed';

    switch (status) {
      case 401:
        // Automatically clear session on authentication failure
        storageService.clearToken();
        return new UnauthorizedError(msg);
      case 403:
        return new ForbiddenError(msg);
      case 404:
        return new NotFoundError(msg);
      case 500:
      default:
        return new ServerError(msg, status);
    }
  }

  public async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const response = await this.client.get<T>(url, { params });
    return response.data;
  }

  public async post<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  public async put<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  public async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url);
    return response.data;
  }
}

export const apiClient = new ApiClient();
