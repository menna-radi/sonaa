import type {
  InviteAdminInput,
  InviteAdminResult,
  TeamRepository,
} from '../../domain/repositories/TeamRepository';
import type { AdminMember, AdminMemberStatus } from '../../domain/entities/AdminMember';
import { Result, ok, fail } from '../../core/result/Result';
import { apiClient } from '../../core/network/apiClient';
import { API_ENDPOINTS } from '../../core/config/apiEndpoints';
import { AppError } from '../../core/errors/AppError';
import { optional } from './optional';

interface RawMember {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string | null;
  title?: string | null;
  status?: string;
  createdAt?: string;
}

type RawTeam = RawMember[] | { team?: RawMember[]; admins?: RawMember[]; items?: RawMember[]; users?: RawMember[] };

const STATUSES: AdminMemberStatus[] = ['ACTIVE', 'SUSPENDED', 'BLOCKED'];

function mapMember(u: RawMember): AdminMember {
  return {
    id: u.id,
    name: u.name || `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim(),
    email: u.email || '',
    title: u.title || '',
    status: (STATUSES as string[]).includes(u.status || '') ? (u.status as AdminMemberStatus) : 'ACTIVE',
    createdAt: u.createdAt || '',
    // The current user is only known to the presentation layer (useTeam sets this).
    isSelf: false,
  };
}

export class ApiTeamRepository implements TeamRepository {
  public async list(): Promise<Result<AdminMember[] | null>> {
    try {
      return await optional(
        () => apiClient.get<RawTeam>(API_ENDPOINTS.admin.team),
        (raw) => {
          const rows = Array.isArray(raw) ? raw : raw.team || raw.admins || raw.items || raw.users || [];
          return ok(rows.map(mapMember));
        }
      );
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async invite(input: InviteAdminInput): Promise<Result<InviteAdminResult>> {
    try {
      const response = await apiClient.post<{ id: string; email: string; temporaryPassword?: string }>(
        API_ENDPOINTS.admin.team,
        input
      );
      return ok({
        id: response.id,
        email: response.email,
        ...(response.temporaryPassword ? { temporaryPassword: response.temporaryPassword } : {}),
      });
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async setStatus(id: string, status: 'ACTIVE' | 'SUSPENDED', reason?: string): Promise<Result<boolean>> {
    try {
      await apiClient.put(`${API_ENDPOINTS.admin.teamMember(id)}/status`, { status, ...(reason ? { reason } : {}) });
      return ok(true);
    } catch (error) {
      return fail(error as AppError);
    }
  }
}
export default ApiTeamRepository;
