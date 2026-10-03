import type { AdminMember } from '../entities/AdminMember';
import type { Result } from '../../core/result/Result';

export interface InviteAdminInput {
  firstName: string;
  lastName: string;
  email: string;
  title: string;
}

export interface InviteAdminResult {
  id: string;
  email: string;
  temporaryPassword?: string;
}

export interface TeamRepository {
  /** `null` = the server does not support admin team management (404). */
  list(): Promise<Result<AdminMember[] | null>>;
  invite(input: InviteAdminInput): Promise<Result<InviteAdminResult>>;
  setStatus(id: string, status: 'ACTIVE' | 'SUSPENDED', reason?: string): Promise<Result<boolean>>;
}
