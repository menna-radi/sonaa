import { CountsRepository, AdminCounts } from '../../domain/repositories/CountsRepository';
import { Result, ok } from '../../core/result/Result';

export class MockCountsRepository implements CountsRepository {
  public async getCounts(): Promise<Result<AdminCounts | null>> {
    return ok(null);
  }
}

export default MockCountsRepository;
