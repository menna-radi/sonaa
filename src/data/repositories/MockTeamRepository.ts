import type { InviteAdminInput, InviteAdminResult, TeamRepository } from '../../domain/repositories/TeamRepository';
import type { AdminMember } from '../../domain/entities/AdminMember';
import { Result, ok } from '../../core/result/Result';

export class MockTeamRepository implements TeamRepository {
  public async list(): Promise<Result<AdminMember[] | null>> {
    return ok(null);
  }

  public async invite(input: InviteAdminInput): Promise<Result<InviteAdminResult>> {
    return ok({ id: '', email: input.email });
  }

  public async setStatus(): Promise<Result<boolean>> {
    return ok(true);
  }
}
export default MockTeamRepository;
