import type {
  UserDirectoryRepository,
  UsersQuery,
  UsersResult,
} from '../../domain/repositories/UserDirectoryRepository';
import type { UserAccountStatus, UserRole, UserSummary } from '../../domain/entities/UserSummary';
import { Result, ok, fail } from '../../core/result/Result';
import { apiClient } from '../../core/network/apiClient';
import { API_ENDPOINTS } from '../../core/config/apiEndpoints';
import { AppError } from '../../core/errors/AppError';

interface RawUser {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string | null;
  phone?: string | null;
  phoneNumber?: string | null;
  role?: string;
  status?: string;
  rating?: number | string | null;
  createdAt?: string;
}

const ROLES: UserRole[] = ['CUSTOMER', 'CRAFTSMAN', 'ADMIN'];
const STATUSES: UserAccountStatus[] = ['ACTIVE', 'SUSPENDED', 'BLOCKED'];

function mapUser(u: RawUser): UserSummary {
  const name = u.name || `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();
  const rating = u.rating == null ? null : Number(u.rating);
  return {
    id: u.id,
    name,
    role: (ROLES as string[]).includes(u.role || '') ? (u.role as UserRole) : 'CUSTOMER',
    email: u.email || undefined,
    phone: u.phone || u.phoneNumber || undefined,
    rating: rating != null && Number.isFinite(rating) ? rating : null,
    createdAt: u.createdAt,
    status: (STATUSES as string[]).includes(u.status || '') ? (u.status as UserAccountStatus) : undefined,
  };
}

export class ApiUserDirectoryRepository implements UserDirectoryRepository {
  public async getUsers(q: UsersQuery): Promise<Result<UsersResult>> {
    try {
      const response = await apiClient.get<{ users?: RawUser[]; items?: RawUser[]; total?: number } | RawUser[]>(
        API_ENDPOINTS.admin.users,
        {
          ...(q.q ? { q: q.q } : {}),
          ...(q.role === 'ALL' ? {} : { role: q.role }),
          limit: q.limit,
          offset: (q.page - 1) * q.limit,
        }
      );
      const raw = Array.isArray(response) ? response : response.users || response.items || [];
      const items = raw.map(mapUser);
      const total = Array.isArray(response) ? items.length : response.total ?? items.length;
      return ok({ items, total });
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async setUserStatus(id: string, status: UserAccountStatus, reason?: string): Promise<Result<boolean>> {
    try {
      await apiClient.put(API_ENDPOINTS.admin.userStatus(id), { status, ...(reason ? { reason } : {}) });
      return ok(true);
    } catch (error) {
      return fail(error as AppError);
    }
  }
}
export default ApiUserDirectoryRepository;
