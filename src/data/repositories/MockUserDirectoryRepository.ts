import type { UserDirectoryRepository, UsersResult } from '../../domain/repositories/UserDirectoryRepository';
import { Result, ok } from '../../core/result/Result';

export class MockUserDirectoryRepository implements UserDirectoryRepository {
  public async getUsers(): Promise<Result<UsersResult>> {
    return ok({ items: [], total: 0 });
  }

  public async setUserStatus(): Promise<Result<boolean>> {
    return ok(true);
  }
}
export default MockUserDirectoryRepository;
