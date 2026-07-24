import { ENV } from '../config/env';

/**
 * Contract for all storage implementations.
 * Repositories depend on this interface — never on localStorage directly.
 */
export interface IStorageService {
  /** Auth token ─────────────────────────────── */
  getToken(): string | null;
  setToken(token: string, expiresIn?: number): void;
  getRefreshToken(): string | null;
  setRefreshToken(refreshToken: string): void;
  clearToken(): void;

  /** Generic key-value store ─────────────────── */
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  clear(): void;
}

const TOKEN_KEY = `${ENV.API_BASE_URL}:auth_token`;
const REFRESH_TOKEN_KEY = `${ENV.API_BASE_URL}:refresh_token`;

/**
 * LocalStorage implementation of IStorageService.
 * Swap this for a Cookie or SessionStorage implementation without
 * touching any repository or use-case.
 */
export class LocalStorageService implements IStorageService {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  setRefreshToken(refreshToken: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  get<T>(key: string): T | null {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  remove(key: string): void {
    localStorage.removeItem(key);
  }

  clear(): void {
    localStorage.clear();
  }
}

/** Singleton instance — injected via DI Provider */
export const storageService = new LocalStorageService();
