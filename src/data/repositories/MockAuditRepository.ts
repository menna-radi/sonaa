import type { AuditLogPage, AuditRepository } from '../../domain/repositories/AuditRepository';
import { Result, ok } from '../../core/result/Result';

export class MockAuditRepository implements AuditRepository {
  public async getLogs(): Promise<Result<AuditLogPage>> {
    return ok({ items: [], total: 0, serverFiltering: false });
  }
}
export default MockAuditRepository;
